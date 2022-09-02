import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import joplin from "../../api";
import {panelHtml} from "./panelHtml";
import {getAllTaggedSentences} from "./utils";
import {debounce} from "ts-debounce";

class WritingMarkerPlugin extends SidebarPlugin {

    sidebar: Sidebars;

    async refresh() {
        await this.sidebar.updateHtml(this.id, await panelHtml(await getAllTaggedSentences()));
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
        ];
        this.scripts = [
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
}

const writingMarkerPlugin = new WritingMarkerPlugin();
export default writingMarkerPlugin;
