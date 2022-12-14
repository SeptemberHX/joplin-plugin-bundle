import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import relatedEngine from "./engine";
import joplin from "../../api";
import {panelHtml} from "./panelHtml";
import {debounce} from "ts-debounce";
import {RELATED_NOTE_PLUGIN_ID} from "../common";
import {SidebarStatus} from "./types";
import {settings} from "./settings";
import {ContentScriptType} from "../../api/types";
import {getAllNotes} from "../utils/noteUtils";


class RelatedNotesPlugin extends SidebarPlugin {

    sidebar: Sidebars;
    relatedNotesSidebarStatus: SidebarStatus;
    currRelatedNotes: any[];

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
        this.currRelatedNotes = [];
    }

    async panelMsgProcess(msg: any): Promise<boolean> {
        switch (msg.name) {
            case 'sidebar_related_notes_item_clicked':
                await joplin.commands.execute('openItem', `:/${msg.id}`);
                if (msg.line > 0) {
                    await this.debounceScrollToLine(msg.line - 1);
                }
                return true;
            case 'sidebar_related_notes_arrow_clicked':
                if (msg.lineR > 0) {
                    await this.debounceScrollToLine(msg.lineR - 1);
                }
                return true;
            case 'sidebar_related_notes_sorter_changed':
                if (this.relatedNotesSidebarStatus.sortFilter !== msg.id) {
                    this.relatedNotesSidebarStatus.sortFilter = msg.id;
                    await this.cachedUpdateHtml();
                }
                return true;
            case 'sidebar_related_note_item_tab_clicked':
                if (this.relatedNotesSidebarStatus.tabIndex !== msg.id) {
                    this.relatedNotesSidebarStatus.tabIndex = msg.id;
                    await this.cachedUpdateHtml();
                }
                return true;
            case 'sidebar_related_note_context_clicked':
                if (msg.id && msg.id.length > 0) {
                    const currentNote = await joplin.workspace.selectedNote();
                    if (currentNote.id !== msg.id) {
                        await joplin.commands.execute('openItem', ':/' + msg.id);
                    }
                }
                await this.debounceScrollToLine(msg.line);
                return true;
            case 'sidebar_related_notes_filter_changed':
                let changed = false;
                switch (msg.type) {
                    case 'mention':
                        if (this.relatedNotesSidebarStatus.mentionFilter !== msg.id) {
                            changed = true;
                            this.relatedNotesSidebarStatus.mentionFilter = msg.id;
                        }
                        break;
                    case 'mentioned':
                        if (this.relatedNotesSidebarStatus.mentionedFilter !== msg.id) {
                            changed = true;
                            this.relatedNotesSidebarStatus.mentionedFilter = msg.id;
                        }
                        break;
                    case 'bidirection':
                        if (this.relatedNotesSidebarStatus.bidirectionFilter !== msg.id) {
                            changed = true;
                            this.relatedNotesSidebarStatus.bidirectionFilter = msg.id;
                        }
                        break;
                    default:
                        break;
                }

                if (changed) {
                    await this.cachedUpdateHtml();
                }
                return true;
            default:
                return false
        }
    }

    async init(sidebars: Sidebars): Promise<void> {
        this.sidebar = sidebars;
        await settings.register();
        this.relatedNotesSidebarStatus = {
            mentionFilter: true,
            mentionedFilter: true,
            bidirectionFilter: true,
            sortFilter: 'Default',
            tabIndex: 1,
            settings: await settings.getSettings()
        };

        await joplin.contentScripts.register(
            ContentScriptType.CodeMirrorPlugin,
            'cm_note_ref_completion',
            './codemirror/noteRefCompletion/index.js'
        );

        // auto completion
        // Message processing
        await joplin.contentScripts.onMessage('cm_note_ref_completion', async (msg) => {
            switch (msg.type) {
                case 'cm_note_ref_completion':
                    return await getAllNotes();
                    break;
                default:
                    break;
            }
        });

        await relatedEngine.init();

        await joplin.workspace.onNoteSelectionChange(async () => {
            await this.updateHtml();
        });

        await relatedEngine.onRelatedUpdate(async () => {
            await this.updateHtml();
        });

        await joplin.settings.onChange(async () => {
            this.relatedNotesSidebarStatus.settings = await settings.getSettings();
            await this.cachedUpdateHtml();
        })

        await this.updateHtml();
    }

    cachedUpdateHtml = debounce(async () => {
        await this.sidebar.updateHtml(this.id, panelHtml(this.currRelatedNotes, this.relatedNotesSidebarStatus));
    }, 100);

    updateHtml = debounce(async () => {
        const note = await joplin.workspace.selectedNote();
        if (note) {
            this.currRelatedNotes = relatedEngine.related(note.body, note.id, note.title);
            await this.sidebar.updateHtml(this.id, panelHtml(this.currRelatedNotes, this.relatedNotesSidebarStatus));
        } else {
            this.currRelatedNotes = [];
        }
    }, 100);

    debounceScrollToLine = debounce(async (line) => {
        await joplin.commands.execute('editor.execCommand', {
            name: 'sidebar_cm_scrollToLine',
            args: [line]
        });
    }, 500);
}


const relatedNotesPlugin = new RelatedNotesPlugin();
export default relatedNotesPlugin;
