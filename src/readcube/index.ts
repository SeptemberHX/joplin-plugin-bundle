import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {settings} from "./settings";
import joplin from "../../api";
import {ENABLE_CUSTOM_STYLE} from "./common";
import {ContentScriptType} from "../../api/types";
import {initPapers} from "./readcube";

class ReadCubePlugin extends SidebarPlugin {
    sidebar: Sidebars;

    constructor() {
        super();

        this.id = 'readcubePapers';
        this.name = 'ReadCube Papers';
        this.icon = 'fas fa-graduation-cap';
        this.styles = [

        ];
        this.scripts = [

        ];
    }

    async init(sidebars: Sidebars): Promise<void> {
        this.sidebar = sidebars;

        await settings.register();
        const enableCustomStyle = await joplin.settings.value(ENABLE_CUSTOM_STYLE);

        await initPapers();
        if (enableCustomStyle) {
            await joplin.contentScripts.register(
                ContentScriptType.MarkdownItPlugin,
                'enhancement_paper_style',
                './readcube/driver/style/index.js'
            );
        }
    }
}

const readCubePlugin = new ReadCubePlugin();
export default readCubePlugin;
