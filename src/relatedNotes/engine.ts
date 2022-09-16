import {getAllNotes, getFolder, getNoteTags} from "../utils/noteUtils";

export class RelatedElement {
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
        const relatedEl = new RelatedElement();
        relatedEl.id = note.id;
        relatedEl.title = note.title;
        relatedEl.body = note.body;
        relatedEl.tags = [];
        relatedEl.parentId = folder.id;
        relatedEl.parentTitle = folder.title;
        for (const tag of tags) {
            relatedEl.tags.push(tag.title);
        }
        return relatedEl;
    }

    isRelated(text: string) {
        if (text.includes(this.id) || text.includes(this.title)) {
            return true;
        }
        return false;
    }
}


export class RelatedEngine {
    relatedElDict: Map<string, RelatedElement>;
    _folders;

    constructor() {
        this.relatedElDict = new Map<string, RelatedElement>();
        this._folders = {};
    }

    async fullParse() {
        this.relatedElDict.clear();
        const notes = await getAllNotes();
        for (const note of notes) {
            const relatedEl = RelatedElement.parseNote(note, await getNoteTags(note.id), await this.get_parent_title(note.parent_id));
            this.relatedElDict.set(relatedEl.id, relatedEl);
        }
    }

    related(text: string) {
        const results = [];
        for (const relatedEl of this.relatedElDict.values()) {
            if (relatedEl.isRelated(text)) {
                results.push(relatedEl);
            }
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
}


const relatedEngine = new RelatedEngine();
export default relatedEngine;
