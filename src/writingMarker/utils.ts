import joplin from "../../api";
import {TaggedSentence} from "./common";

const taggedSentenceReg = /\(([^\s)]+?)::([^)]+)\)/g;

export async function getAllTaggedSentences() {
    let taggedSentences = {};
    let page = 0;
    let r;
    do {
        page += 1;
        // I don't know how the basic search is implemented, it could be that it runs a regex
        // query on each note under the hood. If that is the case and this behaviour crushed
        // some slow clients, I should consider reverting this back to searching all notes
        // (with the rate limiter)
        r = await joplin.data.get(['search'], { query: taggedSentenceReg,  fields: ['id', 'body', 'title', 'parent_id', 'is_conflict'], page: page });
        if (r.items) {
            for (let note of r.items) {
                taggedSentences[note.id] = await searchTaggedSentencesInNote(note);
            }
        }
        // This is a rate limiter that prevents us from pinning the CPU
        if (r.has_more && (page % 1000) == 0) {
            // sleep
            await new Promise(res => setTimeout(res, 2 * 1000));
        }
    } while(r.has_more);
    return taggedSentences;
}

async function searchTaggedSentencesInNote(note) {
    // Conflict notes are duplicates usually
    if (note.is_conflict) { return; }
    let matches = [];
    let match;
    let index = 0;
    let lineNumber = 0;
    taggedSentenceReg.lastIndex = 0;
    for (const line of note.body.split('\n')) {
        while ((match = taggedSentenceReg.exec(line)) !== null) {
            // For todoitems in daily notes, we consider the note date as the default task date
            const item = new TaggedSentence();
            item.tags = match[1].split('|');
            item.noteId = note.id;
            item.noteTitle = note.title;
            item.text = match[2];
            item.index = index;
            item.line = lineNumber;
            matches.push(item);
            index += 1;
        }
        lineNumber += 1;
    }

    return matches;
}
