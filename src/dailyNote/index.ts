import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {createCalendar} from "./panelHtml";

class DailyNotePlugin extends SidebarPlugin {

    sidebar: Sidebars;

    constructor() {
        super();

        this.id = "dailyNote";
        this.name = "Daily Note";
        this.icon = "fas fa-calendar-alt";
        this.styles = [
            './scripts/dailyNote/dailyNote.css',
        ];
        this.scripts = [
            './scripts/dailyNote/dailyNote.js',
        ];
        this.html = 'Init...';
    }

    public async init(sidebar: Sidebars) {
        this.sidebar = sidebar;
        await this.sidebar.updateHtml(this.id, createCalendar());
    }
}

const dailyNotePlugin = new DailyNotePlugin();
export default dailyNotePlugin;
