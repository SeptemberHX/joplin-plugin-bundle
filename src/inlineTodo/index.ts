import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {Settings, Summary} from "./types";
import joplin from "api";
import {regexes} from "./common";
import {SummaryBuilder} from "./builder";
import panelHtml from "./panelHtml";
import {debounce} from "ts-debounce";
import {set_origin_todo} from "./mark_todo";

class TodolistPlugin extends SidebarPlugin {

    sidebar: Sidebars;
    summary_map: Summary;
    builder: SummaryBuilder;
    todoTypeClicked: number = 3;

    refresh = debounce(async () => {
        await this.builder.search_in_all();
        await this.update_summary(this.builder.summary, this.builder.settings);
    }, 100);

    constructor() {
        super();

        this.id = "inline-todo";
        this.name = "Inline Todo";
        this.icon = "fas fa-check";
        this.styles = [
            './scripts/inlineTodo/inlineTodo.css',
        ];
        this.scripts = [
            './scripts/inlineTodo/inlineTodo.js',
        ];
        this.html = '<div class="card"><div class="card-body">Init...</div></div>';
    }

    public async init(sidebar: Sidebars) {
        this.sidebar = sidebar;
        this.builder = new SummaryBuilder(await this.getSettings());
        await joplin.settings.onChange(async (_) => {
            this.builder.settings = await this.getSettings();
        });

        await joplin.workspace.onNoteSelectionChange(async () => {
            await this.refresh();
        });

        await joplin.workspace.onNoteChange(async () => {
            await this.refresh();
        })

        await this.refresh();
    }

    public async panelMsgProcess(msg) {
        switch (msg.name) {
            case 'sidebar_todo_item_clicked':
                if (msg.id) {
                    const ids = msg.id.split('-');
                    if (ids.length > 0) {
                        await joplin.commands.execute('openItem', `:/${ids[0]}`);
                        return true;
                    }
                }
                break;
            case 'sidebar_todo_item_checked':
                if (msg.id) {
                    const ids = msg.id.split('-');
                    if (ids.length > 0) {
                        await set_origin_todo(this.summary_map[ids[0]][ids[1]], await this.getSettings());
                        await this.refresh();
                        return true;
                    }
                }
                break;
            case 'sidebar_todo_type_tab_item_clicked':
                if (msg.id) {
                    this.todoTypeClicked = msg.id;
                }
                return true;
            default:
                break;
        }
        return false;
    }

    private async getSettings(): Promise<Settings> {
        return {
            scan_period_s: 11,
            scan_period_c: 960,
            todo_type: regexes['list'],
            summary_type: 'Table',
            force_sync: true,
        };
    }

    private async update_summary(summary_map: Summary, settings: Settings) {
        this.summary_map = summary_map;
        await this.sidebar.updateHtml(this.id, await panelHtml(this.summary_map, this.todoTypeClicked));
    }
}

const todolistPlugin = new TodolistPlugin();
export default todolistPlugin;
