import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {settings} from "./settings";
import joplin from "../../api";
import {initPapers} from "./readcube";
import {getPaperItemByNoteIdOrTitle} from "./lib/papers/papersDB";
import {PaperItem} from "./lib/papers/papersLib";
import { debounce } from "ts-debounce";
import {panelHtml} from "./panelHtml";

class ReadCubePlugin extends SidebarPlugin {

    sidebar: Sidebars;
    currPaper: PaperItem;
    currTabIndex: number = 1;

    constructor() {
        super();

        this.id = 'readcubePapers';
        this.name = 'ReadCube Papers';
        this.icon = 'fas fa-graduation-cap';
        this.styles = [
            './scripts/readcube/readcube.css'
        ];
        this.scripts = [

        ];
    }

    async init(sidebars: Sidebars): Promise<void> {
        this.sidebar = sidebars;

        await settings.register();
        await initPapers();

        await joplin.workspace.onNoteSelectionChange(async () => {
            await this.update();
        });
        await this.update();
    }

    update = debounce(async () => {
        const currNote = await joplin.workspace.selectedNote();
        if (currNote) {
            this.currPaper = await getPaperItemByNoteIdOrTitle(currNote.id, currNote.title);
        } else {
            this.currPaper = null;
        }
        await this.sidebar.updateHtml(this.id, panelHtml(this.currPaper, this.currTabIndex));
    }, 100);
}

const readCubePlugin = new ReadCubePlugin();
export default readCubePlugin;
