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
	ENABLE_OUTLINE,
	ENABLE_READCUBE_PAPERS,
	ENABLE_RELATED_NOTES,
	ENABLE_TODO,
	ENABLE_WRITING_MARKER,
	PAPERS_DEFAULT_OPEN_DIRS,
	SideBarConfig,
	RELATED_NOTES_DEFAULT_OPEN_DIRS,
	HISTORY_DEFAULT_OPEN_DIRS,
	WRITING_MARKER_DEFAULT_OPEN_DIRS,
	DAILY_NOTE_DEFAULT_OPEN_DIRS, TODO_DEFAULT_OPEN_DIRS, OUTLINE_DEFAULT_OPEN_DIRS, ENABLE_GROUPS
} from "./common";
import {settings} from "./settings";
import readCubePlugin from "./readcube";
import relatedNotesPlugin from "./relatedNotes";
import noteUpdateNotify from "./utils/noteUpdateNotify";
import groupsPlugin from "./groups";

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

		if (pluginConfig.groups) {
			plugins.push(groupsPlugin);
		}

		await sidebar.init(plugins);
	},
});

export async function getConfig(): Promise<SideBarConfig> {
	const config = new SideBarConfig();
	config.outline = await joplin.settings.value(ENABLE_OUTLINE);
	config.outlineDefaultOpenDirs = await getFolderSetting(OUTLINE_DEFAULT_OPEN_DIRS);

	config.inlineTodo = await joplin.settings.value(ENABLE_TODO);
	config.inlineTodoDefaultOpenDirs = await getFolderSetting(TODO_DEFAULT_OPEN_DIRS);

	config.dailyNote = await joplin.settings.value(ENABLE_DAILY_NOTE);
	config.dailyNoteDefaultOpenDirs = await getFolderSetting(DAILY_NOTE_DEFAULT_OPEN_DIRS);

	config.writingMarker = await joplin.settings.value(ENABLE_WRITING_MARKER);
	config.writingMarkerDefaultOpenDirs = await getFolderSetting(WRITING_MARKER_DEFAULT_OPEN_DIRS);

	config.history = await joplin.settings.value(ENABLE_HISTORY);
	config.historyDefaultOpenDirs = await getFolderSetting(HISTORY_DEFAULT_OPEN_DIRS);

	config.readcube = await joplin.settings.value(ENABLE_READCUBE_PAPERS);
	config.papersDefaultDirs = await getFolderSetting(PAPERS_DEFAULT_OPEN_DIRS);

	config.relatedNotes = await joplin.settings.value(ENABLE_RELATED_NOTES);
	config.relatedNotesDefaultDirs = await getFolderSetting(RELATED_NOTES_DEFAULT_OPEN_DIRS)

	config.groups = await joplin.settings.value(ENABLE_GROUPS);

	config.charCount = await joplin.settings.value(ENABLE_CHAR_COUNT);
	return config;
}

async function getFolderSetting(configName: string) {
	const folderNames = await joplin.settings.value(configName);
	const results = [];
	for (const noteFolder of folderNames.split('|')) {
		if (noteFolder.length > 0) {
			results.push(noteFolder);
		}
	}
	return results;
}
