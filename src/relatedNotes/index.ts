import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import relatedEngine from "./engine";
import joplin from "../../api";
import {panelHtml} from "./panelHtml";
import {debounce} from "ts-debounce";
import {RELATED_NOTE_PLUGIN_ID} from "../common";

class RelatedNotesPlugin extends SidebarPlugin {

    sidebar: Sidebars;

    constructor() {
        super();

        this.id = RELATED_NOTE_PLUGIN_ID;
        this.name = "Related Notes";
        this.icon = "fas fa-yin-yang";
        this.styles = [
            './scripts/relatedNotes/relatedNotes.css',
        ];
        this.scripts = [
            './scripts/relatedNotes/relatedNotes.js',
        ];
    }

    async panelMsgProcess(msg: any): Promise<boolean> {
        switch (msg.name) {
            case 'sidebar_related_notes_item_clicked':
                await joplin.commands.execute('openItem', `:/${msg.id}`);
                return true;
            default:
                return false
        }
    }

    async init(sidebars: Sidebars): Promise<void> {
        this.sidebar = sidebars;
        await relatedEngine.init();

        await joplin.workspace.onNoteSelectionChange(async () => {
            await this.updateHtml();
        });

        await relatedEngine.onRelatedUpdate(async () => {
            await this.updateHtml();
        });

        await this.updateHtml();
    }

    updateHtml = debounce(async () => {
        const note = await joplin.workspace.selectedNote();
        if (note) {
            await this.sidebar.updateHtml(this.id, panelHtml(relatedEngine.related(note.body, note.id, note.title)));
        }
    }, 100);
}


const relatedNotesPlugin = new RelatedNotesPlugin();
export default relatedNotesPlugin;
