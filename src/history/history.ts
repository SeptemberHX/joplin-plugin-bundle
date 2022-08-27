import joplin from 'api';
import { HistSettings, includeType } from './settings';

const DEBUG = false;

const linkExp = new RegExp(/{(.*?)}/g);
const noteExp = new RegExp(/\[(?<title>[^\[]+)\]\(:\/(?<id>.*)\)/g);

export interface HistItem {
    date: Date;
    id: string;
    title: string;
    trails: number[];
    is_todo: boolean;
}

/**
 * logs a new selected note in the history note.
 */
export default async function addHistItem(params: HistSettings) {
    // get current note
    let note;
    try {
        note = await joplin.workspace.selectedNote();
        if (note == undefined) return;
        if (note.title == '')
            note.title = 'Untitled';
    } catch{
        if (DEBUG) console.log('addHistItem: failed to get selected note');
        return;
    }
    if (params.histNoteId == note.id) return;
    if (params.excludeNotes.has(note.id)) return;
    if (params.excludeFolders.has(note.parent_id)) return;
    if ((params.includeType == includeType.onlyNote) && note.is_todo) return;
    if ((params.includeType == includeType.onlyToDo) && !note.is_todo) return;
    if (note.is_conflict) return;

    const noteTags: string[] =
        (await joplin.data.get(['notes', note.id, 'tags'], { fields: ['title'] }))
            .items.map(t => t.title);
    if (setDiff(params.excludeTags, new Set(noteTags)).size < params.excludeTags.size) return;

    // get history note
    let histNote;
    try {
        histNote = await joplin.data.get(['notes', params.histNoteId], { fields: ['id', 'title', 'body'] });
    } catch {
        if (DEBUG) console.log('addHistItem: failed when histNoteId = ' + params.histNoteId);
        return
    }
    let history = histNote.body.split('\n');

    // tidy up history
    const item: HistItem = {
        date: new Date(),
        id: note.id,
        title: note.title,
        trails: [],
        is_todo: note.is_todo,
    }

    if (isDuplicate(history[params.currentLine], item))  // do not duplicate the last item
        return

    if (params.secBetweenItems > 0)
        history = cleanNewHist(history, item.date,
            params.secBetweenItems, params.trailFormat);

    if (params.detectBacktrack && isBacktrack(history, item, params)) {
        await joplin.data.put(['notes', histNote.id], null, { body: history.join('\n') });  // edited by cleanNewHist
        return
    }  // when backtracking only update the panel

    if (!params.detectBacktrack)
        params.currentLine = 0;

    if (params.maxDays > 0)
        history = cleanOldHist(history, item.date, params.maxDays);

    if (isDuplicate(history[0], item)) {  // do not duplicate the last item
        await joplin.data.put(['notes', histNote.id], null, { body: history.join('\n') });
        return
    }

    history = await fixUntitledItem(history, params.trailFormat);

    // add new item
    history.unshift(formatItem(item, params.trailFormat));

    if (params.trailRecords > 0) {
        const processed = new Set() as Set<string>;
        await addTrailToItem(note, history, 0, processed, new Set() as Set<number>, params);
    }

    const finish = new Date();
    if (DEBUG)
        console.log('addHistItem: ' + (finish.getTime() - item.date.getTime()) + 'ms');

    await joplin.data.put(['notes', histNote.id], null, { body: history.join('\n') });
}

/**
 * recursively searches for links to a new history item,
 * and updates the body of the history note with new trails.
 */
async function addTrailToItem(noteDest: any, lines: string[], i: number,
                              processed: Set<string>, existLevels: Set<number>, params: HistSettings):
    Promise<[boolean, number]> {
    if (i == lines.length)
        return [false, 1]
    const [item, error] = parseItem(lines[i]);

    if (i > params.trailLength)
        return [false, getNextLevel(existLevels)];  // link not found

    existLevels = setUnion(existLevels, new Set(item.trails));
    const nl = getNextLevel(existLevels);
    if ((i > 1) && (nl > params.trailRecords))
        return [false, nl];  // link not found

    if ((i > 0) && !processed.has(item.id)){
        let skip = false;
        let noteSource;
        try {
            noteSource = await joplin.data.get(['notes', item.id], { fields: ['id', 'body'] });
        } catch {
            skip = true;
            if (DEBUG) console.log(`addTrailToItem: bad note = ${item}`);
        }

        if (!skip && isLinked(noteSource.body, noteSource.id, noteDest.body, noteDest.id, params.trailBacklinks)) {
            let nextLevel: number;
            if (i == 1)
                nextLevel = 1;
            else
                nextLevel = getNextLevel(existLevels);
            // add trail to all previous items (but not to current)
            return [true, nextLevel];  // link found
        }
        processed.add(item.id);
    }

    // processed, means that it is not linked to the note, continue processing
    const [foundLink, nextLevel] = await addTrailToItem(noteDest, lines, i+1, processed, existLevels, params);
    if ((foundLink) && (!error)) {
        item.trails.push(nextLevel);
        lines[i] = formatItem(item, params.trailFormat);
    }
    return [foundLink, nextLevel];
}

function formatItem(item: HistItem, trailFormat: number): string {
    let trailString = '';
    let trail = item.trails.sort();
    let todoString = '';
    if (trailFormat == 0)
        trail = trail.reverse();
    if (trail.length > 0)
        trailString = ` {${trail.map(String).join(',')}}`;
    if (item.is_todo)
        todoString = ' X';

    try {
        if (trailFormat == 0) {
            return `${item.date.toISOString()}${trailString} [${item.title}](:/${item.id})${todoString}`;
        } else {
            return `${item.date.toISOString()} [${item.title}](:/${item.id})${trailString}${todoString}`;
        }
    } catch {
        if (DEBUG) console.log(`formatItem: bad data = ${item}`);
        return '';
    }
}

export function parseItem(line: string): [HistItem, boolean] {
    const item: HistItem = {
        date: new Date(),
        id: '',
        title: '',
        trails: [],
        is_todo: false,
    };

    try {
        item.date = new Date(line.slice(0, 24));
        if (isNaN(item.date.valueOf())) throw 'bad date';

        noteExp.lastIndex = 0;
        const noteMatch = noteExp.exec(line);
        if (noteMatch){
            item.title = noteMatch.groups.title;
            item.id = noteMatch.groups.id;
        }

        const linkMatch = line.match(linkExp);
        if (linkMatch)
            item.trails = linkMatch[0].slice(1, -1).split(',').map(Number);

        item.is_todo = line.slice(-1) == 'X';

        return [item, false];
    } catch {
        if (DEBUG) console.log('parseItem: bad line=' + line);
        return [item, true];
    }
}

/**
 * tries to detect backtracking (browsing through history).
 * when ambiguous, prefers a step forward.
 */
function isBacktrack(history: string[], item: HistItem, params: HistSettings): boolean {
    const backInd = Math.min(params.currentLine + 1, history.length - 1);
    const [backItem, error1] = parseItem(history[backInd]);
    if (!error1 && (backItem.id == item.id)) {
        params.currentLine = backInd;
        return true;
    }

    const nextInd = params.currentLine - 1;
    if (nextInd < 0) {
        params.currentLine = 0;
        return false;
    }

    const [nextItem, error2] = parseItem(history[nextInd]);
    if (!error2 && (nextItem.id == item.id)) {
        params.currentLine = nextInd;
        return true;
    }

    // reset to 0
    params.currentLine = 0;
    const [lastItem, error3] = parseItem(history[1]);
    if (!error3 && (lastItem.id == item.id)) {
        params.currentLine += 1;
        return true;
    }

    return false;
}

function isDuplicate(line: string, newItem: HistItem): boolean {
    const [lastItem, error] = parseItem(line);
    if (error) return false;
    return (lastItem.id == newItem.id) && (lastItem.date.getDate() == newItem.date.getDate());
}

/**
 * removes history items if they are too recent.
 */
function cleanNewHist(lines: string[], newItemDate: Date, minSecBetweenItems: number,
                      trailFormat: number): string[] {
    const lastItemDate = new Date(lines[0].slice(0, 24));
    if (newItemDate.getTime() - lastItemDate.getTime() >= 1000*minSecBetweenItems)
        return lines;

    // remove last item from history
    lines = cleanNewTrail(lines, trailFormat);
    return lines.slice(1);
}

function cleanNewTrail(lines: string[], trailFormat: number): string[] {
    const [item, error] = parseItem(lines[0]);
    if (item.trails.length == 0)
        return lines;

    const level = item.trails[0];  // last item has at most one trail

    if (level == 1) {
        return lines  // last line will be removed by calling function
    }

    for (let i = 0; i < lines.length; i++) {
        const [item, error] = parseItem(lines[i]);
        if (error) {
            if (DEBUG) console.log(`cleanNewTrail: failed on line ${i}:\n${lines[i]}`);
            continue;
        }
        const ind = item.trails.indexOf(level);
        if (ind < 0)  // once the trail ends
            break
        item.trails.splice(ind, 1);
        lines[i] = formatItem(item, trailFormat);
    }
    return lines;
}

/**
 * removes history items if they are too old.
 */
function cleanOldHist(lines: string[], newItemDate: Date, maxHistDays: number): string[] {
    for (var i = lines.length - 1; i >= 0; i--) {
        const itemDate = new Date(lines[i].split(' ')[0]).getTime();
        if ((newItemDate.getTime() - itemDate) <= maxHistDays*1000*60*60*24)
            break;
    }
    return lines.slice(0, i+1);
}

/**
 * if the last item is untitled, which happens in the case of a
 * newly created note, this function tries to update its title.
 */
async function fixUntitledItem(lines: string[], trailFormat: number): Promise<string[]> {
    let [item, error] = parseItem(lines[0]);
    if ((item.title != 'Untitled') || (error))
        return lines

    try {
        const note = await joplin.data.get(['notes', item.id], { fields: ['title'] });
        if (note) {
            if (note.title == '') item.title = 'Untitled';
            else item.title = note.title;
        }
        lines[0] = formatItem(item, trailFormat);  // rename untitled item
    } catch {
        lines.shift();  // remove untitled item
        if (DEBUG) console.log('fixUntitledItem: failed to open untitled note');
    }

    return lines
}

function isLinked(body1: string, id1: string, body2: string, id2: string, backlinks: boolean): boolean {
    if (id1 == id2)
        return true;
    let res = (body1.search(':/' + id2) > 0);
    if (backlinks)
        res = res || (body2.search(':/' + id1) > 0);
    return res;
}

function setUnion(setA: Set<number>, setB: Set<number>): Set<number> {
    let _union = new Set(setA);
    for (let elem of setB)
        _union.add(elem);
    return _union
}

function setDiff(setA: Set<any>, setB: Set<any>): Set<any> {
    let _difference = new Set(setA);
    for (let elem of setB)
        _difference.delete(elem);
    return _difference
}

/**
 * returns [2, 3, ..., maxNum].
 * level 1 is reserved for direct links between consecutive items.
 */
function getLevelSeries(maxNum: number): number[] {
    let a = [] as number[];
    for (var i = 2; i <= maxNum; i++)
        a.push(i);
    return a
}

function getNextLevel(existLevels: Set<number>): number {
    if (existLevels.size == 0)
        return 2;
    const maxExist = Math.max.apply(this, [...existLevels]) as number;
    if (maxExist < 2)
        return 2;
    const allLevels = new Set(getLevelSeries(maxExist + 1));
    return Math.min.apply(this, [...setDiff(allLevels, existLevels)]);
}
