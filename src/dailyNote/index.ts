import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {createCalendar} from "./panelHtml";
import {createDailyNoteByDate, getDailyNoteByDate} from "./utils";
import joplin from "../../api";
import {debounce} from "ts-debounce";
import * as moment from "moment";
import {settings} from "./settings";

class DailyNotePlugin extends SidebarPlugin {

    sidebar: Sidebars;
    createDialog;
    year: number;
    month: number;

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
        this.year = moment().year();
        this.month = moment().month();
    }

    public async init(sidebar: Sidebars) {
        await settings.register();

        this.sidebar = sidebar;
        await this.sidebar.updateHtml(this.id, await createCalendar(this.year, this.month));

        this.createDialog = await joplin.views.dialogs.create('DailyNoteCreateDialog');
        const updateDebounce = debounce(async () => await this.sidebar.updateHtml(this.id, await createCalendar(this.year, this.month)), 100);
        await joplin.workspace.onSyncComplete(async () => await updateDebounce());
        await joplin.workspace.onNoteSelectionChange(async () => await updateDebounce());
        await joplin.workspace.onNoteChange(async () => updateDebounce());
        await joplin.settings.onChange(async () => updateDebounce());
    }

    async panelMsgProcess(msg: any): Promise<boolean> {
        switch (msg.name) {
            case 'sidebar_dailynote_day_clicked':
                const splits = msg.id.split('-');
                if (splits.length === 3) {
                    const noteDate = msg.id;

                    const noteId = await getDailyNoteByDate(noteDate);
                    if (!noteId) {
                        await joplin.views.dialogs.setHtml(this.createDialog, `<p>Note for <font color="dodgerblue">${noteDate}</font> do not exist.</p><p>Would you like to create one?</p>`);
                        await joplin.views.dialogs.addScript(this.createDialog, './scripts/dailyNote/dialog.css');
                        const dialogResult = await joplin.views.dialogs.open(this.createDialog);
                        if (dialogResult.id === 'ok') {
                            const createNoteId = await createDailyNoteByDate(noteDate);
                            await joplin.commands.execute('openItem', `:/${createNoteId}`);
                        }
                    } else {
                        await joplin.commands.execute('openItem', `:/${noteId}`);
                    }
                    return true;
                }
                break;
            case 'sidebar_dailynote_show_calendar_for':
                await this.sidebar.updateHtml(this.id, await createCalendar(msg.id.year, msg.id.month));
                this.year = msg.id.year;
                this.month = msg.id.month;
                return true;
            default:
                break;
        }
        return false;
    }
}

const dailyNotePlugin = new DailyNotePlugin();
export default dailyNotePlugin;
