import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {Settings, Summary} from "./types";
import joplin from "api";
import {regexes} from "./common";
import {SummaryBuilder} from "./builder";
import panelHtml from "./panelHtml";
import {debounce} from "ts-debounce";

class TodolistPlugin extends SidebarPlugin {

    sidebar: Sidebars;
    summary_map: Summary;

    constructor() {
        super();

        this.id = "inline-todo";
        this.name = "inline-todo";
        this.icon = "fas fa-check";
        this.styles = [
            './scripts/inlineTodo/inlineTodo.css',
        ];
        this.scripts = [
            './scripts/inlineTodo/inlineTodo.js',
        ];
        this.html = "Todo list is under development";
    }

    public async init(sidebar: Sidebars) {
        this.sidebar = sidebar;
        const builder = new SummaryBuilder(await this.getSettings());
        await joplin.settings.onChange(async (_) => {
            builder.settings = await this.getSettings();
        });

        const refresh = debounce(async () => {
            await builder.search_in_all();
            await this.update_summary(builder.summary, builder.settings);
        }, 100);

        await joplin.workspace.onNoteSelectionChange(async () => {
            await refresh();
        });

        await joplin.workspace.onNoteChange(async () => {
            await refresh();
        })

        await refresh();
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
        console.log(summary_map);
        await this.sidebar.updateHtml(this.id, await panelHtml(this.summary_map));
    }
}

const todolistPlugin = new TodolistPlugin();
export default todolistPlugin;
