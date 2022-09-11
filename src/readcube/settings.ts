import joplin from "api";
import { SettingItemType } from "api/types";
import {ENABLE_CUSTOM_STYLE, ENABLE_ENHANCED_BLOCKQUOTE, PAPERS_COOKIE} from "./common";

export namespace settings {
    const SECTION = 'FeatureSettings';

    export async function register() {
        await joplin.settings.registerSection(SECTION, {
            label: "ReadCube Papers",
            iconName: "fa fa-graduation-cap",
        });

        let PLUGIN_SETTINGS = {};

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

        await joplin.settings.registerSettings(PLUGIN_SETTINGS);
    }
}
