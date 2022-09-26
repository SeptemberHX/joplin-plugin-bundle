import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {GROUPS_PLUGIN_ID} from "../common";

class GroupsPlugin extends SidebarPlugin {
    sidebar: Sidebars;

    constructor() {
        super();

        this.id = GROUPS_PLUGIN_ID;
        this.name = "Groups";
        this.icon = "fas fa-th-large";
        this.styles = [
        ];
        this.scripts = [
        ];
    }
}

const groupsPlugin = new GroupsPlugin();
export default groupsPlugin;
