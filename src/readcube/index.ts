import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {settings} from "./settings";
import joplin from "../../api";
import {initPapers} from "./readcube";
import {getAllRecords, getPaperItemByNoteIdOrTitle} from "./lib/papers/papersDB";
import {AnnotationItem, PaperItem, PaperMetadata, PapersLib} from "./lib/papers/papersLib";
import { debounce } from "ts-debounce";
import {panelHtml} from "./panelHtml";
import {PapersWS} from "./lib/papers/papersWS";
import {ENABLE_ENHANCED_BLOCKQUOTE} from "./common";

class ReadCubePlugin extends SidebarPlugin {

    sidebar: Sidebars;
    currPaper: PaperItem;
    currAnnotations: AnnotationItem[] = [];
    currMetadata: PaperMetadata;
    annoSearchStr: string = '';
    refSearchStr: string = '';
    paperList: PaperItem[] = [];
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
            case 'sidebar_annotation_copy_clicked':
                for (const anno of this.currAnnotations) {
                    if (anno.id === msg.id) {
                        await joplin.clipboard.writeText(anno.text);
                        break;
                    }
                }
                return true;
            case 'sidebar_annotation_cite_clicked':
                for (const anno of this.currAnnotations) {
                    if (anno.id === msg.id) {
                        await joplin.commands.execute('editor.execCommand', {
                            name: 'enhancement_insertAnnotation',
                            args: [[[anno], await joplin.settings.value(ENABLE_ENHANCED_BLOCKQUOTE)]]
                        });
                        break;
                    }
                }
                return true;
            case 'sidebar_papers_anno_search_changed':
                this.annoSearchStr = msg.id;
                await this.cacheUpdate();
                return true;
            case 'sidebar_papers_ref_search_changed':
                this.refSearchStr = msg.id;
                await this.cacheUpdate();
                return true;
            case 'sidebar_copy_img_by_url':
                await joplin.clipboard.writeImage(msg.id);
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
            this.annoSearchStr = '';
            this.refSearchStr = '';
            this.currAnnotations = [];
            this.currMetadata = null;
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

        await this.updateHtml();
        if (this.currPaper) {
            PapersLib.getAnnotation(this.currPaper.collection_id, this.currPaper.id).then(async annos => {
                this.currAnnotations = annos;
                await this.updateHtml();
            });

            PapersLib.getMetadata(this.currPaper.doi).then(async metadata => {
                this.currMetadata = metadata;
                await this.updateHtml();
            });
        }
    }, 100);

    cacheUpdate = debounce(async () => {
        await this.updateHtml();
    })

    async updateHtml() {
        await this.sidebar.partUpdateHtml(this.id, panelHtml(this.currPaper, this.currAnnotations, this.paperList, this.currMetadata, this.currTabIndex, this.annoSearchStr, this.refSearchStr));
    }
}

const readCubePlugin = new ReadCubePlugin();
export default readCubePlugin;
