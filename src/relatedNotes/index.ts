import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import relatedEngine from "./engine";
import joplin from "../../api";

class RelatedNotesPlugin extends SidebarPlugin {

    sidebar: Sidebars;

    constructor() {
        super();

        this.id = "relatedNotesPlugin";
        this.name = "Related Notes";
        this.icon = "fas fa-yin-yang";
        this.styles = [
        ];
        this.scripts = [
        ];
    }

    async init(sidebars: Sidebars): Promise<void> {
        this.sidebar = sidebars;
        await relatedEngine.fullParse();

        await joplin.workspace.onNoteSelectionChange(async () => {
            const note = await joplin.workspace.selectedNote();
            if (note) {
                console.log(relatedEngine.related(note.body));
            }
        });
    }
}

const relatedNotesPlugin = new RelatedNotesPlugin();
export default relatedNotesPlugin;
