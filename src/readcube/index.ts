import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {settings} from "./settings";
import joplin from "../../api";
import {initPapers} from "./readcube";
import {getPaperItemByNoteIdOrTitle} from "./lib/papers/papersDB";
import {AnnotationItem, PaperItem, PapersLib} from "./lib/papers/papersLib";
import { debounce } from "ts-debounce";
import {panelHtml} from "./panelHtml";
import {PapersWS} from "./lib/papers/papersWS";

class ReadCubePlugin extends SidebarPlugin {

    sidebar: Sidebars;
    currPaper: PaperItem;
    currAnnotations: AnnotationItem[] = [];
    currTabIndex: number = 1;
    papersWS: PapersWS;

    constructor() {
        super();

        this.id = 'readcubePapers';
        this.name = 'ReadCube Papers';
        this.icon = 'fas fa-graduation-cap';
        this.styles = [
            './scripts/readcube/readcube.css'
        ];
        this.scripts = [
            './scripts/readcube/readcube.js'
        ];
    }

    async panelMsgProcess(msg: any): Promise<boolean> {
        switch (msg.name) {
            case 'sidebar_paper_tab_item_clicked':
                this.currTabIndex = msg.id;
                return true;
            default:
                return false;
        }
    }

    async init(sidebars: Sidebars): Promise<void> {
        this.sidebar = sidebars;

        await settings.register();
        this.papersWS = await initPapers();

        await joplin.workspace.onNoteSelectionChange(async () => {
            await this.update();
        });

        if (this.papersWS) {
            await this.papersWS.onPaperChange(async () => {
                await this.update();
            });
        }
        await this.update();
    }

    update = debounce(async () => {
        const currNote = await joplin.workspace.selectedNote();
        if (currNote) {
            this.currPaper = await getPaperItemByNoteIdOrTitle(currNote.id, currNote.title);
        } else {
            this.currPaper = null;
        }

        await this.sidebar.partUpdateHtml(this.id, panelHtml(this.currPaper, this.currAnnotations, this.currTabIndex));
        if (this.currPaper) {
            PapersLib.getAnnotation(this.currPaper.collection_id, this.currPaper.id).then(async annos => {
                this.currAnnotations = annos;
                await this.sidebar.partUpdateHtml(this.id, panelHtml(this.currPaper, this.currAnnotations, this.currTabIndex));
            });
        }
    }, 100);
}

const readCubePlugin = new ReadCubePlugin();
export default readCubePlugin;
