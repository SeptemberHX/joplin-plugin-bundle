import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";
import {
    freqLoc,
    freqOpen,
    freqScope,
    getSettingsSection,
    HistSettings,
    includeType,
    setFolders,
    trailFormat, updateSettings
} from "./settings";
import joplin from "../../api";
import updateHistView from "./panel";
import {MenuItemLocation, ToolbarButtonLocation} from "../../api/types";
import addHistItem from "./history";

const settings: HistSettings = {
    currentLine: 0,
    histNoteId: '',
    excludeNotes: new Set(),
    excludeFolders: new Set(),
    excludeTags: new Set(['exclude.from.history']),
    includeType: includeType.both,
    detectBacktrack: true,
    markCurrentLine: false,
    secBetweenItems: 0,
    maxDays: 90,
    panelTitle: 'HISTORY',
    panelTitleSize: 1,
    panelTextSize: 0.8,
    panelTextSpace: 1.4,
    panelMaxItems: 1000,
    trailDisplay: 3,
    trailRecords: 6,
    trailBacklinks: true,
    trailLength: 10,
    trailWidth: 1,
    plotSize: [20, 16],
    trailColors: ['#e07a5f', '#81b29a', '#f2cc8f', '#6083c5', '#8e646b', '#858935'],
    trailFormat: trailFormat.beforeTitle,
    freqDisplay: 5,
    freqOpen: freqOpen.close,
    freqLoc: freqLoc.top,
    freqScope: freqScope.week,
    userStyle: '',
}

class HistoryPlugin extends SidebarPlugin {

    sidebar: Sidebars;

    constructor() {
        super();

        this.id = "history-panel";
        this.name = "History";
        this.icon = "fas fa-hourglass";
        this.styles = [
            './scripts/history/history.css'
        ];
        this.scripts = [
            './scripts/history/history.js'
        ];
        this.html = '<div class="card"><div class="card-body">Init...</div></div>';
    }


    async init(sidebars: Sidebars): Promise<void> {
        this.sidebar = sidebars;
        await joplin.settings.registerSection('HistoryPanel', {
            label: 'History Panel',
            iconName: 'far fa-hourglass',
        });

        await joplin.settings.registerSettings(getSettingsSection(settings));

        await joplin.commands.register({
            name: 'setHistNote',
            label: 'Set history note',
            iconName: 'far fa-hourglass',
            execute: async () => {
                const note = await joplin.workspace.selectedNote();
                await joplin.settings.setValue('histNoteId', note.id);
                await this.sidebar.updateHtml(this.id, await updateHistView(settings, false));
            },
        });

        await joplin.commands.register({
            name: 'setHistExclude',
            label: 'Exclude note from history',
            execute: async () => {
                const note = await joplin.workspace.selectedNote();
                if (note == undefined) return;

                settings.excludeNotes.delete('');
                settings.excludeNotes.add(note.id);
                await joplin.settings.setValue('histExcludeNotes', Array(...settings.excludeNotes).toString())
            },
        });

        await joplin.commands.register({
            name: 'setHistInclude',
            label: 'Include note in history (un-exclude)',
            execute: async () => {
                const note = await joplin.workspace.selectedNote();
                if (note == undefined) return;

                settings.excludeNotes.delete(note.id);
                await joplin.settings.setValue('histExcludeNotes', Array(...settings.excludeNotes).toString())
            },
        });

        await joplin.commands.register({
            name: 'setHistExcludeFolder',
            label: 'Exclude notebook from history',
            execute: async () => {
                const folder = await joplin.workspace.selectedFolder();
                if (folder == undefined) return;

                setFolders(true, folder.id, settings);
            },
        });

        await joplin.commands.register({
            name: 'setHistIncludeFolder',
            label: 'Include notebook in history',
            execute: async () => {
                const folder = await joplin.workspace.selectedFolder();
                if (folder == undefined) return;

                setFolders(false, folder.id, settings);
            },
        });

        await joplin.views.menus.create('histMenu', 'History', [
            {
                label: 'menuHistNote',
                commandName: 'setHistNote',
            },
            {
                label: 'menuHistExclude',
                commandName: 'setHistExclude',
            },
            {
                label: 'menuHistInclude',
                commandName: 'setHistInclude',
            },
            {
                label: 'menuHistExcludeFolder',
                commandName: 'setHistExcludeFolder',
            },
            {
                label: 'menuHistIncludeFolder',
                commandName: 'setHistIncludeFolder',
            },
        ], MenuItemLocation.Tools);


        await joplin.settings.onChange(async () => {
            await updateSettings(settings);
            await this.sidebar.updateHtml(this.id, await updateHistView(settings, false));

        });

        await joplin.workspace.onNoteSelectionChange(async () => {
            await addHistItem(settings);
            await this.sidebar.updateHtml(this.id, await updateHistView(settings, false));

        });

        await joplin.workspace.onSyncComplete(async () =>  {
            await this.sidebar.updateHtml(this.id, await updateHistView(settings, false));
        });

        await updateSettings(settings);
        await this.sidebar.updateHtml(this.id, await updateHistView(settings, false));
    }

    async panelMsgProcess(message: any): Promise<boolean> {
        if (message.name === 'openHistory') {
            await joplin.commands.execute('openNote', message.hash);
            if (settings.markCurrentLine)
                settings.currentLine = Number(message.line) - 1;
            return true;
        } else if (message.name === 'loadHistory') {
            await this.sidebar.updateHtml(this.id, await updateHistView(settings, false));
            return true;
        }
        return false;
    }
}


const historyPlugin = new HistoryPlugin();
export default historyPlugin;
