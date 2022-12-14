import joplin from "api";
import { SettingItemType } from "api/types";
import {
    ENABLE_CUSTOM_STYLE,
    ENABLE_ENHANCED_BLOCKQUOTE,
    PAPERS_COOKIE, PAPERS_CREATE_PAPER_NOTE_IN_CURRENT_FOLDER, PAPERS_SERVICE_PROVIDER, PaperServiceType,
    ZOTERO_USER_API_KEY,
    ZOTERO_USER_ID
} from "./common";

export namespace settings {
    const SECTION = 'FeatureSettings';

    export async function register() {
        await joplin.settings.registerSection(SECTION, {
            label: "Bundle Papers",
            iconName: "fa fa-graduation-cap",
        });

        let PLUGIN_SETTINGS = {};

        PLUGIN_SETTINGS[PAPERS_CREATE_PAPER_NOTE_IN_CURRENT_FOLDER] = {
            value: true,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Create paper notes in current folder by default (Restart required)',
        }

        PLUGIN_SETTINGS[PAPERS_SERVICE_PROVIDER] = {
            value: 'Zotero',
            public: true,
            isEnum: true,
            options: {
                Readcube : 'ReadCube Papers',
                Zotero: 'Zotero'
            },
            section: SECTION,
            type: SettingItemType.String,
            label: 'Your paper reference provider',
            description: "You MUST delete the papers.sqlite file after switching the provider. You can find it in the directory contains userchrome.css -> plugin-data -> com.septemberhx.pluginBundle",
        }

        PLUGIN_SETTINGS[PAPERS_COOKIE] = {
            value: '',
            public: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'Cookie for ReadCube Papers',
            description: "Visit ReadCube Papers web app in your web browser, open development tools and copy your cookies (requires restart)",
        }

        PLUGIN_SETTINGS[ENABLE_CUSTOM_STYLE] = {
            value: false,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Enable Custom CSS style',
            description: "Header auto numbering, Times New Roman font family, and more (requires restart)",
        }

        PLUGIN_SETTINGS[ENABLE_ENHANCED_BLOCKQUOTE] = {
            value: false,
            public: true,
            section: SECTION,
            type: SettingItemType.Bool,
            label: 'Enable created user name, modified date, and more colors for annotations',
            description: "NEED Enhancement plugin. It can add [color=red][name=SeptemberHX][date=19700101] to the annotation references",
        }

        PLUGIN_SETTINGS[ZOTERO_USER_ID] = {
            value: 0,
            public: true,
            section: SECTION,
            type: SettingItemType.Int,
            label: 'Zotero User Id',
            description: 'Get your user id from https://www.zotero.org/settings/keys'
        }

        PLUGIN_SETTINGS[ZOTERO_USER_API_KEY] = {
            value: '',
            public: true,
            section: SECTION,
            type: SettingItemType.String,
            label: 'Zotero User API Key',
            description: 'Get your API Key from https://www.zotero.org/settings/keys. PLEASE create separate keys for different Joplin clients. Otherwise the information may not be updated in time due to the subscription limitation of each API key'
        }

        await joplin.settings.registerSettings(PLUGIN_SETTINGS);
    }
}
