import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";

class DailyNotePlugin extends SidebarPlugin {

    sidebar: Sidebars;

    constructor() {
        super();

        this.id = "dailyNote";
        this.name = "Daily Note";
        this.icon = "fas fa-calendar-alt";
        this.styles = [];
        this.scripts = [];
        this.html = 'Init...';
    }

    public async init(sidebar: Sidebars) {
        this.sidebar = sidebar;
    }
}

const dailyNotePlugin = new DailyNotePlugin();
export default dailyNotePlugin;
