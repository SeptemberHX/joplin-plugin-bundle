import {Note, Settings, Summary} from "./types";
import * as chrono from "chrono-node";
import joplin from "../../api";

const dateStrReg = /^\d{4}-\d{2}-\d{2}$/;


/**
 * New version builder engine that supports task description and sub-tasks
 */
export default class TodoEngine {

    _summary: Summary = {};
    // Maps folder ids to folder name
    // Record<id, name>
    _folders: Record<string, string> = {};
    // The plugin settings
    _settings: Settings;
    // Don't overwrite the summary note unless all notes have been checked
    _initialized: boolean = false;

    constructor (s: Settings) {
        this._settings = s;
    }

    async search_in_note(note: Note) : Promise<boolean> {
        // Conflict notes are duplicates usually
        if (note.is_conflict) { return; }
        let matches = [];

        let folder = await this.get_parent_title(note.parent_id);
        let match;
        let index = 0;
        let lineNumber = 0;
        const todo_type = this._settings.todo_type;
        todo_type.regex.lastIndex = 0;
        let lastScopeMatches = [];
        for (const line of note.body.split('\n')) {
            todo_type.regex.lastIndex = 0;
            if ((match = todo_type.regex.exec(line)) !== null) {
                // we find a task line

                // For todoitems in daily notes, we consider the note date as the default task date
                let matchedDate = todo_type.date(match);
                if (this._settings.note_title_date && matchedDate.length === 0 && dateStrReg.test(note.title)) {
                    matchedDate = note.title;
                }

                // parse task date
                const dateStrSplit = matchedDate.split('~');
                let fromDate, toDate;
                fromDate = chrono.parseDate(dateStrSplit[0]);
                if (dateStrSplit.length >= 2) {
                    toDate = chrono.parseDate(dateStrSplit[1]);
                    if (toDate < fromDate) {
                        toDate = null;
                    }
                }

                // build the task and save it
                const task = {
                    note: note.id,
                    note_title: note.title,
                    parent_id: note.parent_id,
                    parent_title: folder,
                    msg: todo_type.msg(match),
                    assignee: todo_type.assignee(match),
                    date: matchedDate,
                    fromDate: fromDate,
                    toDate: toDate,
                    tags: todo_type.tags(match),
                    index: index,
                    priority: todo_type.priority(match),
                    line: lineNumber,
                    description: [],
                    indent: line.length - line.trimStart().length
                };
                matches.push(task);

                // update the match scopes
                if (lastScopeMatches.length === 0) {
                    lastScopeMatches.push(task);
                } else {
                    if (lastScopeMatches[lastScopeMatches.length - 1].indent === task.indent) {
                        // at the same level
                        lastScopeMatches[lastScopeMatches.length - 1] = task;
                    } else if (lastScopeMatches[lastScopeMatches.length - 1].indent < task.indent) {
                        // next level
                        lastScopeMatches.push(task);
                    } else {
                        // pop up until find proper parent level
                        let isSuccess = false;
                        for (let i = lastScopeMatches.length - 2; i >= 0; i--) {
                            if (lastScopeMatches[i].indent === task.indent) {
                                lastScopeMatches[i] = task;
                                lastScopeMatches = lastScopeMatches.slice(0, i + 1);
                                isSuccess = true;
                                break;
                            } else if (lastScopeMatches[i].indent > task.index) {
                                lastScopeMatches[i + 1] = task;
                                lastScopeMatches = lastScopeMatches.slice(0, i + 2);
                                isSuccess = true;
                                break;
                            } else {
                                continue;
                            }
                        }

                        if (!isSuccess) {
                            lastScopeMatches = [task];
                        }
                    }
                }

                // the index is used to locate this task for convenience
                index += 1;
            } else {
                // we find a non-task line. We need to check whether it is the description of previous task
                if (lastScopeMatches.length === 0) {
                    // No previous task
                    ;
                } else if (line.trim().length === 0) {
                    // Empty. It breaks all the scope of last match
                    lastScopeMatches = [];
                } else {
                    const textIndent = line.length - line.trimStart().length;
                    let isSuccess = false;
                    for (let i = lastScopeMatches.length - 1; i >= 0; i--) {
                        if (lastScopeMatches[i].indent === textIndent) {
                            continue;
                        } else if (lastScopeMatches[i].indent > textIndent) {
                            continue;
                        } else {
                            lastScopeMatches = lastScopeMatches.slice(0, i + 1);
                            lastScopeMatches[i].description.push(line);
                            isSuccess = true;
                            break;
                        }
                    }

                    if (!isSuccess) {
                        lastScopeMatches = [];
                    }
                }
            }
            lineNumber += 1;
        }

        if (matches.length > 0 || this._summary[note.id]?.length > 0) {
            // Check if the matches actually changed
            const dirty = JSON.stringify(this._summary[note.id]) != JSON.stringify(matches);

            this._summary[note.id] = matches;

            return dirty;
        }

        return false;
    }

    // Reads a parent title from cache, or uses the joplin api to get a title based on id
    async get_parent_title(id: string): Promise<string> {
        if (!(id in this._folders)) {
            let f = await joplin.data.get(['folders', id], { fields: ['title'] });
            this._folders[id] = f.title;
        }

        return this._folders[id];
    }

    // This function scans all notes, but it's rate limited to it from crushing Joplin
    async search_in_all() {
        this._summary = {};
        let page = 0;
        let r;
        do {
            page += 1;
            // I don't know how the basic search is implemented, it could be that it runs a regex
            // query on each note under the hood. If that is the case and this behaviour crushed
            // some slow clients, I should consider reverting this back to searching all notes
            // (with the rate limiter)
            r = await joplin.data.get(['search'], { query: this._settings.todo_type.query,  fields: ['id', 'body', 'title', 'parent_id', 'is_conflict'], page: page });
            if (r.items) {
                for (let note of r.items) {
                    await this.search_in_note(note);
                }
            }
        } while(r.has_more);

        this._initialized = true;
    }

    async update_from_note(note: Note, note_title_date?: boolean) {
        if (note.id in this._summary) {
            delete this._summary[note.id];
        }
        await this.search_in_note(note);
    }

    get summary(): Summary {
        return this._summary;
    }

    get settings(): Settings {
        return this._settings;
    }
    set settings(s: Settings) {
        this._settings = s;
    }
}
