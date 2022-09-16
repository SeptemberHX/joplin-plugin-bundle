import {getAllNotes, getNoteTags} from "../utils/noteUtils";

class RelatedElement {
    id: string;         // note id
    title: string;      // note title
    tags: string[];     // note tags

    /**
     *
     * @param note Note object returned by joplin data api
     * @param tags Tag array returned by joplin data api
     */
    static parseNote(note, tags) {
        const relatedEl = new RelatedElement();
        relatedEl.id = note.id;
        relatedEl.title = note.title;
        relatedEl.tags = [];
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


class RelatedEngine {
    relatedElDict: Map<string, RelatedElement>;

    constructor() {
        this.relatedElDict = new Map<string, RelatedElement>();
    }

    async fullParse() {
        this.relatedElDict.clear();
        const notes = await getAllNotes();
        for (const note of notes) {
            const relatedEl = RelatedElement.parseNote(note, await getNoteTags(note.id));
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
}


const relatedEngine = new RelatedEngine();
export default relatedEngine;
