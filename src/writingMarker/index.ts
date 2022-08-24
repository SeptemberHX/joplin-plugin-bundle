import {SidebarPlugin} from "../sidebars/sidebarPage";

class WritingMarkerPlugin extends SidebarPlugin {

    constructor() {
        super();

        this.id = "writingMarker";
        this.name = "Writing Marker";
        this.icon = "fas fa-feather";
        this.styles = [
        ];
        this.scripts = [
        ];
        this.html = '<div class="card"><div class="card-body">Under development...</div></div>';
    }
}


const writingMarkerPlugin = new WritingMarkerPlugin();
export default writingMarkerPlugin;
