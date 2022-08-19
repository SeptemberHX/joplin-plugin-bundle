import joplin from 'api';
import {createPage} from "./sidebars/sidebarPage";

joplin.plugins.register({
	onStart: async function() {
		const panel = await joplin.views.panels.create('sidebar_bundle_panel');

		await joplin.views.panels.setHtml(panel, createPage());
		await joplin.views.panels.addScript(panel, './bootstrap.min.css');
		await joplin.views.panels.addScript(panel, './custom.css');
		await joplin.views.panels.addScript(panel, './bootstrap.bundle.min.js');
	},
});
