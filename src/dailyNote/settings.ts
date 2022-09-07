import joplin from "../../api";
import {SettingItemType} from "../../api/types";

export const DAILY_NOTE_TEMPLATE = 'bundle_daily_note_template';
export const DAILY_NOTE_ROOT_DIR_NAME = 'bundle_daily_note_root_dir_name';

export namespace settings {
    const SECTION = 'DailyNoteSettings';

    export async function register() {
        await joplin.settings.registerSection(SECTION, {
            label: "Daily Note",
            iconName: "fas fa-calendar-alt",
        });

        let PLUGIN_SETTINGS = {};

        PLUGIN_SETTINGS[DAILY_NOTE_ROOT_DIR_NAME] = {
            value: 'Daily Note',
            public: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'Daily Note Root Directory Name/ID',
            description: "Where to save all your daily notes. Set it to the directory ID if you want to use a specific directory as the root. Right click on the folder -> Copy external link -> Paste it in any editor and you will find the folder id (32 characters). If an invalid id is provided, 'Daily Note' will be used instead.",
        };

        PLUGIN_SETTINGS[DAILY_NOTE_TEMPLATE] = {
            value: '',
            public: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'Daily Note Template',
            description: "Template when you create a new daily note. Use '\\n' for new line",
        };

        await joplin.settings.registerSettings(PLUGIN_SETTINGS);
    }
}
