import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import relatedEngine from "./engine";
import joplin from "../../api";
import {panelHtml} from "./panelHtml";
import {debounce} from "ts-debounce";

class RelatedNotesPlugin extends SidebarPlugin {

    sidebar: Sidebars;

    constructor() {
        super();

        this.id = "relatedNotesPlugin";
        this.name = "Related Notes";
        this.icon = "fas fa-yin-yang";
        this.styles = [
            './scripts/relatedNotes/relatedNotes.css',
        ];
        this.scripts = [];
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
            await this.sidebar.updateHtml(this.id, panelHtml(relatedEngine.related(note.body)));
        }
    }, 100);
}


const relatedNotesPlugin = new RelatedNotesPlugin();
export default relatedNotesPlugin;
