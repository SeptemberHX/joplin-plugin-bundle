import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {settings} from "./settings";
import joplin from "../../api";
import {initPapers} from "./readcube";
import {getAllRecords, getPaperItemByNoteIdOrTitle} from "./lib/base/paperDB";
import { debounce } from "ts-debounce";
import {panelHtml} from "./panelHtml";
import {ENABLE_ENHANCED_BLOCKQUOTE} from "./common";
import {AnnotationItem, PaperItem, PaperMetadata} from "./lib/base/paperType";
import paperSvc from "./lib/PaperSvcFactory";
import {PAPERS_PLUGIN_ID} from "../common";
import {ContentScriptType} from "../../api/types";
import {getAllNotes} from "../utils/noteUtils";

class ReadCubePlugin extends SidebarPlugin {

    sidebar: Sidebars;
    currPaper: PaperItem;
    currAnnotations: AnnotationItem[] = [];
    currMetadata: PaperMetadata;
    currNotes: string[] = [];
    annoSearchStr: string = '';
    refSearchStr: string = '';
    paperList: PaperItem[] = [];
    currTabIndex: number = 1;
    paperNote: boolean = false;
    selectedPaperId: string;

    paperNotesCache = {};

    constructor() {
        super();

        this.id = PAPERS_PLUGIN_ID;
        this.name = 'Papers';
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
            case 'sidebar_annotation_copy_link_clicked':
                for (const anno of this.currAnnotations) {
                    if (anno.id === msg.id) {
                        await joplin.clipboard.writeText(`[](${paperSvc.externalAnnotationLink(anno)})`);
                        break;
                    }
                }
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
                            args: [[[anno], await joplin.settings.value(ENABLE_ENHANCED_BLOCKQUOTE), [paperSvc.externalAnnotationLink(anno)]]]
                        });
                        break;
                    }
                }
                return true;
            case 'sidebar_paper_selector_changed':
                for (const paper of this.paperList) {
                    if (paper.id === msg.id) {
                        this.currPaper = paper;
                        this.selectedPaperId = msg.id;
                        break;
                    }
                }
                await this.updatePaperInfo();
                return true;
            case 'sidebar_papers_anno_search_changed':
                this.annoSearchStr = msg.id;
                await this.debounceHtmlUpdate();
                return true;
            case 'sidebar_papers_ref_search_changed':
                this.refSearchStr = msg.id;
                await this.debounceHtmlUpdate();
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
        await initPapers();

        await joplin.contentScripts.register(
            ContentScriptType.CodeMirrorPlugin,
            'cm_paper_cite_completion',
            './codemirror/paperCiteCompletion/index.js'
        );

        // auto completion
        // Message processing
        await joplin.contentScripts.onMessage('cm_paper_cite_completion', async (msg) => {
            switch (msg.type) {
                case 'cm_paper_cite_completion':
                    let items : PaperItem[] = await getAllRecords();
                    let results = [];
                    for (let item of items) {
                        results.push({
                            'title': item.title,
                            'url': paperSvc.externalLink(item)
                        });
                    }
                    return results;
                    break;
                default:
                    break;
            }
        });

        await joplin.workspace.onNoteSelectionChange(async () => {
            this.annoSearchStr = '';
            this.refSearchStr = '';
            this.currAnnotations = [];
            this.currMetadata = null;
            this.currNotes = [];
            this.paperNote = false;
            this.selectedPaperId = null;
            this.paperNotesCache = {};
            await this.fullUpdate();
        });

        await joplin.workspace.onNoteChange(async () => {
            await this.fullUpdate();
        });

        if (paperSvc) {
            await paperSvc.onPaperChange(async () => {
                this.paperNotesCache = {};
                await this.fullUpdate();
            });
        }
        await this.fullUpdate();
    }

    fullUpdate = debounce(async () => {
        const currNote = await joplin.workspace.selectedNote();
        this.paperList = [];
        const paperIdSet = new Set();
        if (currNote) {
            this.currPaper = await getPaperItemByNoteIdOrTitle(currNote.id, currNote.title);
            if (this.currPaper) {
                paperIdSet.add(this.currPaper.id);
                this.paperList.push(this.currPaper);
                this.paperNote = true;
            } else {
                this.paperNote = false;
            }

            for (const paperCandidate of await getAllRecords()) {
                if (paperIdSet.has(paperCandidate.id)) {
                    continue;
                }

                if (currNote.body.includes(paperCandidate.title) || currNote.body.includes(paperCandidate.id)) {
                    this.paperList.push(paperCandidate);
                }
            }
            if (!this.selectedPaperId && this.paperList.length > 0) {
                this.currPaper = this.paperList[0];
            } else if (this.selectedPaperId && this.paperList.length > 0) {
                for (const paperCandidate of this.paperList) {
                    if (paperCandidate.id === this.selectedPaperId) {
                        this.currPaper = paperCandidate;
                        break;
                    }
                }
            }
        } else {
            this.currPaper = null;
        }

        await this.updatePaperInfo();
    }, 100);

    updatePaperInfo = debounce(async () => {
        await this.debounceHtmlUpdate();
        if (this.currPaper) {
            if (this.currPaper.id in this.paperNotesCache) {
                this.currNotes = this.paperNotesCache[this.currPaper.id];
                await this.debounceHtmlUpdate();
            } else {
                paperSvc.extractNotes(this.currPaper).then(async notes => {
                    this.paperNotesCache[this.currPaper.id] = notes;
                    this.currNotes = notes;
                    await this.debounceHtmlUpdate();
                });
            }

            paperSvc.getAnnotation(this.currPaper).then(async annos => {
                this.currAnnotations = annos;
                await this.debounceHtmlUpdate();
            });

            paperSvc.getMetadata(this.currPaper.doi).then(async metadata => {
                this.currMetadata = metadata;
                await this.debounceHtmlUpdate();
            });
        }
    })

    debounceHtmlUpdate = debounce(async () => {
        await this.sidebar.partUpdateHtml(this.id, panelHtml(this.currPaper, this.currAnnotations, this.paperList, this.currMetadata, this.currNotes, this.currTabIndex, this.annoSearchStr, this.refSearchStr));
    })
}

const readCubePlugin = new ReadCubePlugin();
export default readCubePlugin;
