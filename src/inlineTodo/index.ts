import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {Settings, Summary} from "./types";
import joplin from "api";
import {regexes} from "./common";
import panelHtml, {allDue, allProjectsStr, allTagsStr} from "./panelHtml";
import {debounce} from "ts-debounce";
import {set_origin_todo} from "./mark_todo";
import {
    INLINE_TODO_AUTO_COMPLETION, INLINE_TODO_FILTER_TAG,
    INLINE_TODO_ITEM_DESCRIPTION,
    INLINE_TODO_NOTE_TITLE_AS_DATE,
    settings
} from "./settings";
import {MsgType, TODO_PLUGIN_ID} from "../common";
import TodoEngine from "./todoEngine";
import {ContentScriptType} from "../../api/types";

class TodolistPlugin extends SidebarPlugin {

    sidebar: Sidebars;
    summary_map: Summary;
    engine: TodoEngine;
    todoTypeClicked: number = 3;
    filterProject: string = allProjectsStr;
    filterTag: string = allTagsStr;
    filterDue: string = allDue;
    searchCondition: string = '';
    settings: Settings;

    debounceRefresh = debounce(async () => {
        await this.refresh();
    }, 100);

    refresh = async () => {
        await this.engine.search_in_all();
        await this.update_summary(this.engine.summary, this.engine.settings);
    };

    debounceCacheRefresh = debounce(async () => {
        await this.cacheRefresh();
    }, 100);

    cacheRefresh = async () => {
        await this.update_summary(this.engine.summary, this.engine.settings);
    }

    debounceRefreshNote = debounce(async (noteId: string) => {
        await this.refreshNote(noteId);
    }, 100);

    refreshNote = async (noteId: string) => {
        const note = await joplin.data.get(['notes', noteId], { fields: ['id', 'body', 'title', 'parent_id', 'is_conflict'] });
        if (note) {
            await this.engine.update_from_note(note);
            await this.engine.search_in_note(note);
            await this.update_summary(this.engine.summary, this.engine.settings);
        }
    }

    constructor() {
        super();

        this.id = TODO_PLUGIN_ID;
        this.name = "Inline Todo";
        this.icon = "fas fa-check";
        this.styles = [
            './scripts/inlineTodo/inlineTodo.css',
        ];
        this.scripts = [
            './scripts/inlineTodo/inlineTodo.js',
        ];
    }

    public async init(sidebar: Sidebars) {
        this.sidebar = sidebar;
        await settings.register();
        this.settings = await this.getSettings();
        this.engine = new TodoEngine(this.settings);
        await joplin.settings.onChange(async (_) => {
            this.settings = await this.getSettings();
            this.engine.settings = this.settings;
            await this.debounceRefresh();
        });

        // do full refresh when switching notes because sometimes we need to manually refresh
        await joplin.workspace.onNoteSelectionChange(async () => {
            await this.debounceRefresh();
        });

        // do part refresh for performance. Only search tasks in changed note.
        await joplin.workspace.onNoteChange(async (event) => {
            await this.debounceRefreshNote(event.id);
        });

        // do full refresh when sync is completed
        await joplin.workspace.onSyncComplete(async () => {
            await this.debounceRefresh();
        });

        await this.debounceRefresh();

        if (this.settings.auto_completion) {
            await joplin.contentScripts.register(
                ContentScriptType.CodeMirrorPlugin,
                'cm_auto_completion',
                './codemirror/autoCompletion/index.js'
            );

            // auto completion
            // Message processing
            await joplin.contentScripts.onMessage('cm_auto_completion', async (msg) => {
                switch (msg.type) {
                    case 'auto_completion':
                        return this.engine.all_tags_projects();
                        break;
                    default:
                        break;
                }
            });
        }

        await joplin.contentScripts.register(
            ContentScriptType.MarkdownItPlugin,
            'conference_style_renderer',
            './inlineTodo/todoRender/index.js'
        );
    }

    debounceScrollToLine = debounce(async (noteId, index) => {
        await joplin.commands.execute('editor.execCommand', {
            name: 'sidebar_cm_scrollToLine',
            args: [this.summary_map[noteId][index].line]
        });
    }, 500);

    public async panelMsgProcess(msg) {
        switch (msg.name) {
            case 'sidebar_todo_item_clicked':
                if (msg.id) {
                    const ids = msg.id.split('-');
                    if (ids.length > 0) {
                        await joplin.commands.execute('openItem', `:/${ids[0]}`);
                        await this.debounceScrollToLine(ids[0], ids[1]);
                        return true;
                    }
                }
                break;
            case 'sidebar_todo_item_checked':
                if (msg.id) {
                    const ids = msg.id.split('-');
                    if (ids.length > 0) {
                        await set_origin_todo(this.summary_map[ids[0]][ids[1]], await this.getSettings());
                        const currentNote = await joplin.workspace.selectedNote();
                        if (currentNote.id === ids[0]) {
                            await joplin.commands.execute('editor.setText', currentNote.body);
                            await this.debounceScrollToLine(ids[0], ids[1]);
                        }
                        await this.debounceRefresh();
                        return true;
                    }
                }
                break;
            case 'sidebar_todo_type_tab_item_clicked':
                if (msg.id) {
                    this.todoTypeClicked = msg.id;
                }
                return true;
            case 'sidebar_todo_filter_project_changed':
                if (msg.id) {
                    this.filterProject = msg.id;
                    await this.debounceCacheRefresh();
                    return true;
                }
                break;
            case 'sidebar_todo_filter_tag_changed':
                if (msg.id) {
                    this.filterTag = msg.id;
                    await this.debounceCacheRefresh();
                    return true;
                }
                break;
            case 'sidebar_todo_filter_due_changed':
                if (msg.id) {
                    this.filterDue = msg.id;
                    await this.debounceCacheRefresh();
                    return true;
                }
                break;
            case 'sidebar_todo_search_changed':
                this.searchCondition = msg.id;
                await this.debounceCacheRefresh();
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
            note_title_date: await joplin.settings.value(INLINE_TODO_NOTE_TITLE_AS_DATE),
            showDescription: await joplin.settings.value(INLINE_TODO_ITEM_DESCRIPTION),
            auto_completion: await joplin.settings.value(INLINE_TODO_AUTO_COMPLETION),
            filterTags: (await joplin.settings.value(INLINE_TODO_FILTER_TAG)).split('|')
        };
    }

    private async update_summary(summary_map: Summary, settings: Settings) {
        this.summary_map = summary_map;
        await this.sidebar.updateHtml(this.id, await panelHtml(this.summary_map, this.todoTypeClicked,
            this.filterProject, this.filterTag, this.filterDue, this.searchCondition, this.settings.showDescription));
    }
}

const todolistPlugin = new TodolistPlugin();
export default todolistPlugin;
