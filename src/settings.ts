import joplin from "../api";
import {ENABLE_DAILY_NOTE, ENABLE_HISTORY, ENABLE_OUTLINE, ENABLE_TODO, ENABLE_WRITING_MARKER} from "./common";
import {SettingItemType} from "../api/types";

export namespace settings {
    const SECTION = 'BundleSettings';

    export async function register() {
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
            label: 'Enable Outline in bundle',
            description: "Forked from https://github.com/cqroot/joplin-outline. Requires restart",
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

        await joplin.settings.registerSettings(PLUGIN_SETTINGS);
    }
}
