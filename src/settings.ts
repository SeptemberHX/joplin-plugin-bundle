import joplin from "../api";
import {
    ENABLE_DAILY_NOTE,
    ENABLE_HISTORY,
    ENABLE_OUTLINE,
    ENABLE_READCUBE_PAPERS,
    ENABLE_TODO,
    ENABLE_WRITING_MARKER
} from "./common";
import {SettingItemType} from "../api/types";
import {localeString, MsgType} from "./locale";

export namespace settings {
    const SECTION = 'BundleSettings';

    export async function register() {
        const joplinLocale = await joplin.settings.globalValue('locale');

        await joplin.settings.registerSection(SECTION, {
            label: "Plugin Bundle",
            iconName: "fas fa-boxes",
        });
        let PLUGIN_SETTINGS = {};

        PLUGIN_SETTINGS[ENABLE_OUTLINE] = {
            value: true,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: localeString(MsgType.ENABLE_OUTLINE_LABEL, joplinLocale),
            description: localeString(MsgType.ENABLE_OUTLINE_DESCRIPTION, joplinLocale),
        }

        PLUGIN_SETTINGS[ENABLE_TODO] = {
            value: true,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Enable Inline Todo in bundle',
            description: "Forked from https://github.com/CalebJohn/joplin-inline-todo. Requires restart",
        }

        PLUGIN_SETTINGS[ENABLE_DAILY_NOTE] = {
            value: true,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Enable Daily Note in bundle',
            description: "Requires restart",
        }

        PLUGIN_SETTINGS[ENABLE_WRITING_MARKER] = {
            value: false,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Enable Writing Marker in bundle',
            description: "Syntax: (Tag1|Tag2::XXXXXXXXX). Requires restart",
        }

        PLUGIN_SETTINGS[ENABLE_HISTORY] = {
            value: true,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Enable History in bundle',
            description: "Forked from https://github.com/alondmnt/joplin-plugin-history-panel. Requires restart",
        }

        PLUGIN_SETTINGS[ENABLE_READCUBE_PAPERS] = {
            value: false,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Enable ReadCube Papers in bundle',
            description: "Requires restart",
        }

        await joplin.settings.registerSettings(PLUGIN_SETTINGS);
    }
}
