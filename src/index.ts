import joplin from 'api';
import {SidebarPlugin, Sidebars} from "./sidebars/sidebarPage";
import outlinePlugin from "./outline";
import todolistPlugin from "./inlineTodo";

joplin.plugins.register({
	onStart: async function() {
		const sidebar = new Sidebars();

		const plugins: SidebarPlugin[] = [
			outlinePlugin,
			todolistPlugin
		];

		await sidebar.init(plugins);
	},
});
