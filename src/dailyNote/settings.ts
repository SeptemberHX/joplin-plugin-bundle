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
            label: 'Daily Note Root Directory Name',
            description: "Where to save all your daily notes",
        };

        PLUGIN_SETTINGS[DAILY_NOTE_TEMPLATE] = {
            value: '',
            public: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'Daily Note Template',
            description: "Template when you create a new daily note",
        };

        await joplin.settings.registerSettings(PLUGIN_SETTINGS);
    }
}
