import joplin from 'api';
import {SidebarPlugin, Sidebars} from "./sidebars/sidebarPage";
import outlinePlugin from "./outline";
import todolistPlugin from "./inlineTodo";
import dailyNotePlugin from "./dailyNote";
import writingMarkerPlugin from "./writingMarker";
import noteLinkPlugin from "./noteLink";
import aggregateSearchPlugin from "./aggregateSearch";
import historyPlugin from "./history";
import {ContentScriptType} from "../api/types";
import {
	ENABLE_DAILY_NOTE,
	ENABLE_HISTORY,
	ENABLE_OUTLINE,
	ENABLE_TODO,
	ENABLE_WRITING_MARKER,
	SideBarConfig
} from "./common";
import {settings} from "./settings";

joplin.plugins.register({
	onStart: async function() {
		await settings.register();

		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			'sidebar_cm_commands',
			'./codemirror/commands/index.js'
		);

		const sidebar = new Sidebars();

		let plugins: SidebarPlugin[] = [];

		const pluginConfig = await getConfig();
		if (pluginConfig.outline) {
			plugins.push(outlinePlugin);
		}

		if (pluginConfig.inlineTodo) {
			plugins.push(todolistPlugin);
		}

		if (pluginConfig.dailyNote) {
			plugins.push(dailyNotePlugin);
		}

		if (pluginConfig.writingMarker) {
			plugins.push(writingMarkerPlugin);
		}

		if (pluginConfig.history) {
			plugins.push(historyPlugin);
		}

		await sidebar.init(plugins);
	},
});

async function getConfig(): Promise<SideBarConfig> {
	const config = new SideBarConfig();
	config.outline = await joplin.settings.value(ENABLE_OUTLINE);
	config.inlineTodo = await joplin.settings.value(ENABLE_TODO);
	config.dailyNote = await joplin.settings.value(ENABLE_DAILY_NOTE);
	config.writingMarker = await joplin.settings.value(ENABLE_WRITING_MARKER);
	config.history = await joplin.settings.value(ENABLE_HISTORY);
	return config;
}
