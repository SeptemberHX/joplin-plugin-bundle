import joplin from 'api';
import {SidebarPlugin, Sidebars} from "./sidebars/sidebarPage";
import outlinePlugin from "./outline";
import todolistPlugin from "./inlineTodo";
import dailyNotePlugin from "./dailyNote";

joplin.plugins.register({
	onStart: async function() {
		const sidebar = new Sidebars();

		const plugins: SidebarPlugin[] = [
			outlinePlugin,
			todolistPlugin,
			dailyNotePlugin
		];

		await sidebar.init(plugins);
	},
});
