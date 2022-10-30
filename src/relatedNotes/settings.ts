import joplin from "../../api";
import {SettingItemType} from "../../api/types";
import {RelatedNoteSettings} from "./types";

const RELATED_NOTE_COLLAPSED_BY_DEFAULT = 'related_note_collapsed_by_default';


export namespace settings {
    const SECTION = 'RelatedNoteTodoSettings';

    export async function register() {
        await joplin.settings.registerSection(SECTION, {
            label: "Bundle Related Notes",
            iconName: "fas fa-yin-yang",
        });

        let PLUGIN_SETTINGS = {};

        PLUGIN_SETTINGS[RELATED_NOTE_COLLAPSED_BY_DEFAULT] = {
            value: true,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Show collapsed related notes by default',
        };

        await joplin.settings.registerSettings(PLUGIN_SETTINGS);
    }

    export async function getSettings() {
        const settings = new RelatedNoteSettings();
        settings.collapsed = await joplin.settings.value(RELATED_NOTE_COLLAPSED_BY_DEFAULT);
        return settings;
    }
}
