import joplin from "../../api";
import {SettingItemType} from "../../api/types";

export const INLINE_TODO_NOTE_TITLE_AS_DATE = 'bundle_inline_todo_note_title_as_date';

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

        await joplin.settings.registerSettings(PLUGIN_SETTINGS);
    }
}
