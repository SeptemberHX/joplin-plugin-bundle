import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import joplin from "../../api";
import {panelHtml} from "./panelHtml";
import {getAllTaggedSentences} from "./utils";
import {debounce} from "ts-debounce";
import {TaggedSentence} from "./common";

class WritingMarkerPlugin extends SidebarPlugin {

    sidebar: Sidebars;
    items: {};

    async refresh() {
        await this.updateTaggedSentences();
        let itemArray = [];
        for (const noteId in this.items) {
            itemArray = itemArray.concat(this.items[noteId]);
        }
        await this.sidebar.updateHtml(this.id, await panelHtml(itemArray));
    }

    debounceRefresh = debounce(async () => {
        await this.refresh();
    }, 100);

    constructor() {
        super();

        this.id = "writingMarker";
        this.name = "Writing Marker";
        this.icon = "fas fa-tags";
        this.styles = [
            './scripts/writingMarker/writingMarker.css'
        ];
        this.scripts = [
            './scripts/writingMarker/writingMarker.js'
        ];
        this.html = '<div class="card"><div class="card-body">Under development...</div></div>';
    }

    public async init(sidebar: Sidebars) {
        this.sidebar = sidebar;
        await joplin.workspace.onNoteSelectionChange(async () => {
            await this.debounceRefresh();
        });

        await joplin.workspace.onNoteChange(async () => {
            await this.debounceRefresh();
        })

        await this.debounceRefresh();
    }

    debounceScrollToLine = debounce(async (noteId, lineNumber) => {
        await joplin.commands.execute('editor.execCommand', {
            name: 'sidebar_cm_scrollToLine',
            args: [this.items[noteId][lineNumber].line]
        });
    }, 250);

    async panelMsgProcess(msg: any): Promise<boolean> {
        switch (msg.name) {
            case 'sidebar_tagged_sentence_clicked':
                if (msg.id) {
                    const items = msg.id.split('-');
                    if (items.length === 2) {
                        await joplin.commands.execute('openItem', `:/${items[0]}`);
                        await this.debounceScrollToLine(items[0], items[1]);
                        return true;
                    }
                }
                break;
            default:
                break;
        }
        return false;
    }

    async updateTaggedSentences() {
        this.items = await getAllTaggedSentences();
    }
}

const writingMarkerPlugin = new WritingMarkerPlugin();
export default writingMarkerPlugin;
