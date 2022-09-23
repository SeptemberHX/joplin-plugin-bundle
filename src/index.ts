import joplin from 'api';
import {SidebarPlugin, Sidebars} from "./sidebars/sidebarPage";
import outlinePlugin from "./outline";
import todolistPlugin from "./inlineTodo";
import dailyNotePlugin from "./dailyNote";
import writingMarkerPlugin from "./writingMarker";
import historyPlugin from "./history";
import {ContentScriptType} from "../api/types";
import {
	ENABLE_CHAR_COUNT,
	ENABLE_DAILY_NOTE,
	ENABLE_HISTORY,
	ENABLE_OUTLINE, ENABLE_READCUBE_PAPERS, ENABLE_RELATED_NOTES,
	ENABLE_TODO,
	ENABLE_WRITING_MARKER, PAPERS_DEFAULT_OPEN_DIRS,
	SideBarConfig,
    RELATED_NOTES_DEFAULT_OPEN_DIRS
} from "./common";
import {settings} from "./settings";
import readCubePlugin from "./readcube";
import relatedNotesPlugin from "./relatedNotes";
import noteUpdateNotify from "./utils/noteUpdateNotify";

joplin.plugins.register({
	onStart: async function() {
		await settings.register();

		await noteUpdateNotify.init();

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

		if (pluginConfig.readcube) {
			plugins.push(readCubePlugin);
		}

		if (pluginConfig.relatedNotes) {
			plugins.push(relatedNotesPlugin);
		}

		await sidebar.init(plugins);
	},
});

export async function getConfig(): Promise<SideBarConfig> {
	const config = new SideBarConfig();
	config.outline = await joplin.settings.value(ENABLE_OUTLINE);
	config.inlineTodo = await joplin.settings.value(ENABLE_TODO);
	config.dailyNote = await joplin.settings.value(ENABLE_DAILY_NOTE);
	config.writingMarker = await joplin.settings.value(ENABLE_WRITING_MARKER);
	config.history = await joplin.settings.value(ENABLE_HISTORY);
	config.readcube = await joplin.settings.value(ENABLE_READCUBE_PAPERS);
	const paperFolders = await joplin.settings.value(PAPERS_DEFAULT_OPEN_DIRS);
	config.papersDefaultDirs = [];
	for (const paperFolder of paperFolders.split('|')) {
		if (paperFolder.length > 0) {
			config.papersDefaultDirs.push(paperFolder);
		}
	}
	config.relatedNotes = await joplin.settings.value(ENABLE_RELATED_NOTES);
	const relatedNoteFolders = await joplin.settings.value(RELATED_NOTES_DEFAULT_OPEN_DIRS);
	config.relatedNotesDefaultDirs = [];
	for (const noteFolder of relatedNoteFolders.split('|')) {
		if (noteFolder.length > 0) {
			config.relatedNotesDefaultDirs.push(noteFolder);
		}
	}
	config.charCount = await joplin.settings.value(ENABLE_CHAR_COUNT);
	return config;
}
