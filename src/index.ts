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

joplin.plugins.register({
	onStart: async function() {
		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			'sidebar_cm_commands',
			'./codemirror/commands/index.js'
		);

		const sidebar = new Sidebars();

		const plugins: SidebarPlugin[] = [
			outlinePlugin,
			todolistPlugin,
			dailyNotePlugin,
			writingMarkerPlugin,
			historyPlugin,
			// noteLinkPlugin,
			aggregateSearchPlugin
		];

		await sidebar.init(plugins);
	},
});
