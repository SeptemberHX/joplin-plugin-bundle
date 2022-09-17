import joplin from "../../api";
import { LAST_NOTE_UPDATE_DATE } from "../common";
import dateFormat  from "dateformat";
import {searchNoteByUpdatedDate} from "./noteUtils";
import { debounce } from "ts-debounce";

class NoteUpdateNotify {

    lastUpdateDate: Date;
    updateCallbacks;
    deleteCallbacks;

    constructor() {
        this.updateCallbacks = [];
        this.deleteCallbacks = [];
    }

    debounceRefresh = debounce(async () => {
        const [notes, lastUpdatedTime] = await this.findUpdatedNotes();
        if (notes.length > 0) {
            this.lastUpdateDate = new Date(lastUpdatedTime);
            await this.saveLastUpdateDate();

            for (const callback of this.updateCallbacks) {
                await callback(notes);
            }
        }
    }, 100);

    async onNoteUpdates(callback: (notes) => {}) {
        this.updateCallbacks.push(callback);
    }

    async onNoteDeleted(callback: (noteId: string) => {}) {
        this.deleteCallbacks.push(callback);
    }

    async init() {
        await this.readLastUpdateDate();

        await joplin.workspace.onNoteChange(async () => {
            await this.debounceRefresh();
        });

        await joplin.workspace.onSyncComplete(async () => {
            await this.debounceRefresh();
        });

        await joplin.workspace.onNoteSelectionChange(async () => {
            await this.debounceRefresh();
        })

        await joplin.workspace.onNoteChange(async (event) => {
            // https://joplinapp.org/api/references/plugin_api/enums/itemchangeeventtype.html
            if (event.event === 3) {
                for (const callback of this.deleteCallbacks) {
                    callback(event.id);
                }
            }
        })
    }

    async saveLastUpdateDate() {
        await joplin.settings.setValue(LAST_NOTE_UPDATE_DATE, this.lastUpdateDate.toISOString());
    }

    async readLastUpdateDate() {
        const dateStr = await joplin.settings.value(LAST_NOTE_UPDATE_DATE);
        if (dateStr.length > 0) {
            this.lastUpdateDate = new Date(dateStr);
        }
    }

    async findUpdatedNotes() : Promise<[any[], number]> {
        let updatedDate = '19700101';
        if (this.lastUpdateDate) {
            updatedDate = dateFormat(this.lastUpdateDate, 'yyyymmdd');
        }
        const updatedNotes = await searchNoteByUpdatedDate(updatedDate);

        let results = [];
        let lastUpdateTime: number = 0;
        for (const note of updatedNotes) {
            if (this.lastUpdateDate && note.updated_time > this.lastUpdateDate.valueOf()) {
                results.push(note);
            }

            if (note.updated_time > lastUpdateTime) {
                lastUpdateTime = note.updated_time;
            }
        }

        if (!this.lastUpdateDate) {
            results = updatedNotes;
        }
        return [results, lastUpdateTime];
    }
}

const noteUpdateNotify = new NoteUpdateNotify();
export default noteUpdateNotify;
