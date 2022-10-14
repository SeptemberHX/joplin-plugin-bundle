import {getAllNotes, getFolder, getNoteTags} from "../utils/noteUtils";
import noteUpdateNotify from "../utils/noteUpdateNotify";
import wordsCount from 'words-count';
import {lineOfString} from "../utils/stringUtils";


const ignoreTitles = ['default-history'];

// do not change the order and value
export enum RelationshipType {
    NULL = 0,
    MENTION = 1,
    MENTIONED = 2,
    BIDIRECTION = 3,
}


export class Relationship {
    elementId: string;      // note id
    type: RelationshipType;
    score: number;          // relationship score. High is better
    line: number;           // the first line where it appears
    lineR: number;          // the first line where it is referred
}


export class NoteElement {
    id: string;         // note id
    title: string;      // note title
    body: string;       // note body
    tags: string[];     // note tags
    parentId: string;   // note parent id
    parentTitle: string;    // note parent title

    /**
     *
     * @param note Note object returned by joplin data api
     * @param tags Tag array returned by joplin data api
     * @param folder Folder object returned by joplin data api
     */
    static parseNote(note, tags, folder) {
        if (note.is_conflict) {
            return null;
        }

        const noteEl = new NoteElement();
        noteEl.id = note.id;
        noteEl.title = note.title;
        noteEl.body = note.body;
        noteEl.tags = [];
        noteEl.parentId = folder.id;
        noteEl.parentTitle = folder.title;
        if (tags) {
            for (const tag of tags) {
                noteEl.tags.push(tag.title);
            }
        }
        return noteEl;
    }

    isRelated(text: string, noteId: string, title: string) {
        if (ignoreTitles.includes(this.title)) {
            return false;
        }

        if (this.id === noteId) {
            return false;
        }

        if (text.includes(this.id) || text.includes(this.title) || this.body.includes(title)) {
            return true;
        }
        return false;
    }

    checkRelationShip(text: string, noteId: string, title: string) {
        const relationship = new Relationship();
        relationship.elementId = this.id;
        relationship.type = RelationshipType.NULL;
        relationship.score = 0;

        if (!ignoreTitles.includes(this.title) && this.id !== noteId) {
            const lines = this.body.split('\n');
            const otherLines = text.split('\n');

            // check references
            const mentionIdLineNumber = lineOfString(noteId, lines);
            relationship.line = mentionIdLineNumber;

            const mentionTitleLineNumber = lineOfString(title, lines);
            if (mentionTitleLineNumber > 0 && mentionIdLineNumber <= 0 || mentionTitleLineNumber < mentionIdLineNumber) {
                relationship.line = mentionTitleLineNumber;
            }
            const mentionFlag = mentionTitleLineNumber > 0 || mentionIdLineNumber > 0;

            // check cited
            const mentionedIdLineNumber = lineOfString(this.id, otherLines);
            relationship.lineR = mentionedIdLineNumber;

            const mentionedTitleLineNumber = lineOfString(this.title, otherLines);
            if (mentionedTitleLineNumber > 0 && mentionedIdLineNumber <= 0 || mentionedTitleLineNumber < mentionedIdLineNumber) {
                relationship.lineR = mentionedTitleLineNumber;
            }

            const mentionedFlag = mentionedTitleLineNumber > 0 || mentionedIdLineNumber;

            // calculate score
            if (mentionFlag && !mentionedFlag) {
                relationship.type = RelationshipType.MENTION;
                if (mentionIdLineNumber > 0) {
                    relationship.score = 100;
                } else {
                    relationship.score = 10 * Math.min(10, wordsCount(title));
                }
            } else if (!mentionFlag && mentionedFlag) {
                relationship.type = RelationshipType.MENTIONED;
                if (mentionedIdLineNumber > 0) {
                    relationship.score = 100;
                } else {
                    relationship.score = 10 * Math.min(10, wordsCount(this.title));
                }
            } else if (mentionFlag && mentionedFlag) {
                relationship.type = RelationshipType.BIDIRECTION;
                if (mentionIdLineNumber > 0 && mentionedIdLineNumber > 0) {
                    relationship.score = 200;
                } else if (mentionIdLineNumber <= 0 && mentionedIdLineNumber > 0) {
                    relationship.score = 100 + 10 * Math.min(10, wordsCount(this.title));
                } else if (mentionIdLineNumber > 0 && mentionedIdLineNumber <= 0) {
                    relationship.score = 100 + 10 * Math.min(10, wordsCount(title));
                } else {
                    relationship.score = 10 * Math.min(10, wordsCount(this.title))
                                        + 10 * Math.min(10, wordsCount(title));
                }
            }
        }

        return relationship;
    }
}


export class RelatedEngine {
    relatedElDict: Map<string, NoteElement>;
    relationships: Map<string, Relationship>;
    relatedUpdateCallback;
    _folders;

    constructor() {
        this.relatedElDict = new Map<string, NoteElement>();
        this.relationships = new Map<string, Relationship>();
        this._folders = {};
        this.relatedUpdateCallback = [];
    }

    async onRelatedUpdate(callback: () => {}) {
        this.relatedUpdateCallback.push(callback);
    }

    async init() {
        await this.fullParse();
        await noteUpdateNotify.onNoteUpdates(async (notes) => {
            for (const note of notes) {
                const relatedEl = NoteElement.parseNote(note, await getNoteTags(note.id), await this.get_parent_title(note.parent_id));
                if (relatedEl) {
                    this.relatedElDict.set(note.id, relatedEl);
                }
            }

            if (notes.length > 0) {
                for (const callback of this.relatedUpdateCallback) {
                    await callback();
                }
            }
        });

        await noteUpdateNotify.onNoteDeleted(async (noteId) => {
            this.relatedElDict.delete(noteId);
            for (const callback of this.relatedUpdateCallback) {
                await callback();
            }
        });
    }

    async fullParse() {
        this.relatedElDict.clear();
        this.relationships.clear();
        const notes = await getAllNotes();
        for (const note of notes) {
            const relatedEl = NoteElement.parseNote(note, await getNoteTags(note.id), await this.get_parent_title(note.parent_id));
            if (relatedEl) {
                this.relatedElDict.set(relatedEl.id, relatedEl);
            }
        }
    }

    related(text: string, noteId: string, title: string) {
        const results = [];
        let relationships = [];
        for (const relatedEl of this.relatedElDict.values()) {
            const ship = relatedEl.checkRelationShip(text, noteId, title);
            if (ship.type !== RelationshipType.NULL) {
                relationships.push(ship);
            }
        }
        relationships = relationships.sort((a, b) => {
            if (a.score > b.score) {
                return -1;
            } else if (a.score < b.score) {
                return 1;
            } else {
                return 0;
            }
        })
        this.relationships.clear();
        for (const ship of relationships) {
            this.relationships.set(ship.elementId, ship);
            results.push(this.relatedElDict.get(ship.elementId));
        }

        return results;
    }

    // Reads a parent title from cache, or uses the joplin api to get a title based on id
    async get_parent_title(id: string): Promise<string> {
        if (!(id in this._folders)) {
            let f = await getFolder(id);
            this._folders[id] = f;
        }

        return this._folders[id];
    }

    getRelationShip(elementId) {
        return this.relationships.get(elementId);
    }
}


const relatedEngine = new RelatedEngine();
export default relatedEngine;
