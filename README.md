# Joplin Plugin Bundle

Plugins in one panel. Some of the plugins come from other repo, and I modified them to show all the plugin panels in the same panel under different tabs.

> **Why?** : Save my screen space by aggregating those plugins into one panel

> **How?** : Copy & Paste code from existing plugins, and modify them at the code level. I cannot figure out a non-intrusive way to gather them together in one panel.

Current plugins:

* Outline (v1.3.1): https://github.com/cqroot/joplin-outline
* Inline Todo (v1.4.0): https://github.com/CalebJohn/joplin-inline-todo
* Daily Note: Idea from https://github.com/liamcain/obsidian-calendar-plugin

Under development:

* Note Link System (v0.8.0): https://github.com/ylc395/joplin-plugin-note-link-system
* Writing Marker [Planned]: Help to mark text with a label and show them in the sidebar ordered by marker categories:
  * Recheck: text needs to be rechecked
  * Rewrite: text needs to be rewritten
  * ... (It depends on what I need to finish my papers)
* Aggregated Search [Planned]: Allow search multiple resources and present the results in one panel.
  > I treat Joplin as my top-level knowledge base while there exist many other tools behind Joplin. Joplin is not a good choice for document management, so I need to search other tools.
  * Joplin Notes
  * ReadCube Papers: https://www.papersapp.com/
  * ArchiveBox: https://github.com/ArchiveBox/ArchiveBox
  * ... ?

![Imgur](https://i.imgur.com/yfcsNDb.gif)
<img src="https://i.imgur.com/7cMUBOj.gif" width="200px"></img>
![Imgur](https://i.imgur.com/h7fP8iq.gif)

## Building the plugin

The plugin is built using Webpack, which creates the compiled code in `/dist`. A JPL archive will also be created at the root, which can use to distribute the plugin.

To build the plugin, simply run `npm run dist`.

The project is setup to use TypeScript, although you can change the configuration to use plain JavaScript.

## Updating the plugin framework

To update the plugin framework, run `npm run update`.

In general this command tries to do the right thing - in particular it's going to merge the changes in package.json and .gitignore instead of overwriting. It will also leave "/src" as well as README.md untouched.

The file that may cause problem is "webpack.config.js" because it's going to be overwritten. For that reason, if you want to change it, consider creating a separate JavaScript file and include it in webpack.config.js. That way, when you update, you only have to restore the line that include your file.
