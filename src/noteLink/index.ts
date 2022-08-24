import {SidebarPlugin} from "../sidebars/sidebarPage";

class NoteLinkPlugin extends SidebarPlugin {

    constructor() {
        super();

        this.id = "noteLinkPlugin";
        this.name = "Note Link";
        this.icon = "fas fa-exchange-alt";
        this.styles = [
        ];
        this.scripts = [
        ];
        this.html = '<div class="card"><div class="card-body">Under development...</div></div>';
    }
}


const noteLinkPlugin = new NoteLinkPlugin();
export default noteLinkPlugin;
