import joplin from 'api';
import {SidebarPlugin, Sidebars} from "./sidebars/sidebarPage";
import outlinePlugin from "./outline";
import todolistPlugin from "./inlineTodo";
import dailyNotePlugin from "./dailyNote";
import writingMarkerPlugin from "./writingMarker";
import noteLinkPlugin from "./noteLink";
import aggregateSearchPlugin from "./aggregateSearch";

joplin.plugins.register({
	onStart: async function() {
		const sidebar = new Sidebars();

		const plugins: SidebarPlugin[] = [
			outlinePlugin,
			todolistPlugin,
			dailyNotePlugin,
			// writingMarkerPlugin,
			// noteLinkPlugin,
			// aggregateSearchPlugin
		];

		await sidebar.init(plugins);
	},
});
