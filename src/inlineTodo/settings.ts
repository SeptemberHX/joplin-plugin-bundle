import joplin from "../../api";
import {SettingItemType} from "../../api/types";

export const INLINE_TODO_NOTE_TITLE_AS_DATE = 'bundle_inline_todo_note_title_as_date';
export const INLINE_TODO_ITEM_DESCRIPTION = 'bundle_inline_todo_item_description';
export const INLINE_TODO_AUTO_COMPLETION = 'bundle_inline_todo_auto_completion';

export namespace settings {
    const SECTION = 'BundleInlineTodoSettings';

    export async function register() {
        await joplin.settings.registerSection(SECTION, {
            label: "Bundle Inline Todo",
            iconName: "fas fa-check",
        });

        let PLUGIN_SETTINGS = {};

        PLUGIN_SETTINGS[INLINE_TODO_NOTE_TITLE_AS_DATE] = {
            value: false,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Use note title as default task date',
            description: "When the note title means a date, then use it as the default task data for all the tasks in the note",
        };

        PLUGIN_SETTINGS[INLINE_TODO_ITEM_DESCRIPTION] = {
            value: true,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Show task description',
            description: "Show the text following tasks with one more indent as task description",
        };

        PLUGIN_SETTINGS[INLINE_TODO_AUTO_COMPLETION] = {
            value: true,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Show hints for todo tags and project. Triggered by "+" and "@". Requires restart'
        };

        await joplin.settings.registerSettings(PLUGIN_SETTINGS);
    }
}
