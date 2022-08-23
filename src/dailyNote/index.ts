import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {createCalendar} from "./panelHtml";
import {getDailyNoteByDate} from "./utils";
import joplin from "../../api";

class DailyNotePlugin extends SidebarPlugin {

    sidebar: Sidebars;
    createDialog;

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

        this.createDialog = await joplin.views.dialogs.create('DailyNoteCreateDialog');
    }

    async panelMsgProcess(msg: any): Promise<boolean> {
        switch (msg.name) {
            case 'sidebar_dailynote_day_clicked':
                const splits = msg.id.split('-');
                if (splits.length === 3) {
                    const year = splits[0];
                    const month = splits[1];
                    const noteDate = msg.id;

                    const noteId = await getDailyNoteByDate(noteDate);
                    if (!noteId) {
                        await joplin.views.dialogs.setHtml(this.createDialog, `<p>Note for <font color="dodgerblue">${noteDate}</font> do not exist.</p><p>Would you like to create one?</p>`);
                        await joplin.views.dialogs.addScript(this.createDialog, './scripts/dailyNote/dialog.css');
                        const dialogResult = await joplin.views.dialogs.open(this.createDialog);
                        if (dialogResult.id === 'ok') {
                            console.log('====> Ok clicked');
                        }
                    }

                    return true;
                }
                break;
            default:
                break;
        }
        return false;
    }
}

const dailyNotePlugin = new DailyNotePlugin();
export default dailyNotePlugin;
