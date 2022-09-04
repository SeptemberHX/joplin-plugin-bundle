import joplin from 'api';
import { SettingItem, SettingItemType } from 'api/types';

export interface HistSettings {
    currentLine: number;
    histNoteId: string;
    excludeNotes: Set<string>;
    excludeFolders: Set<string>;
    excludeTags: Set<string>;
    includeType: includeType;
    detectBacktrack: boolean;
    markCurrentLine: boolean;
    secBetweenItems: number;
    maxDays: number;
    panelTitle: string;
    panelTitleSize: number;
    panelTextSize: number;
    panelTextSpace: number;
    panelMaxItems: number;
    trailDisplay: number;
    trailRecords: number;
    trailBacklinks: boolean;
    trailLength: number;
    trailWidth: number;
    plotSize: number[];
    trailColors: string[];
    trailFormat: trailFormat;
    freqLoc: freqLoc;
    freqOpen: freqOpen;
    freqDisplay: number;
    freqScope: freqScope;
    userStyle: string;
}

export enum includeType {
    'both',
    'onlyNote',
    'onlyToDo',
}

export enum trailFormat {
    'beforeTitle',
    'afterTitle',
}

export enum freqScope {
    'today',
    'week',
    'month',
    'year',
    'all',
}

export enum freqLoc {
    'top',
    'bottom',
    'hide',
}

export enum freqOpen {
    'close',
    'open',
}

export async function updateSettings(settings: HistSettings) {
    settings.histNoteId = await joplin.settings.value('histNoteId');
    settings.excludeNotes = new Set((await joplin.settings.value('histExcludeNotes')).split(','));
    settings.excludeFolders = new Set((await joplin.settings.value('histExcludeFolders')).split(','));
    settings.excludeTags = new Set((await joplin.settings.value('histExcludeTags')).split(','));
    settings.includeType = (await joplin.settings.value('histIncludeType'));
    settings.detectBacktrack = (await joplin.settings.value('histDetectBacktrack'));
    settings.markCurrentLine = (await joplin.settings.value('histMarkCurrentLine'));
    settings.secBetweenItems = await joplin.settings.value('histSecBetweenItems');
    settings.maxDays = await joplin.settings.value('histMaxDays');
    settings.panelTitle = await joplin.settings.value('histPanelTitle');
    settings.panelTitleSize = await joplin.settings.value('histPanelTitleSizeRel') / 100;
    settings.panelTextSize = await joplin.settings.value('histPanelTextSizeRel') / 100;
    settings.trailDisplay = await joplin.settings.value('histTrailDisplay');
    settings.trailRecords = await joplin.settings.value('histTrailRecords');
    settings.trailBacklinks = await joplin.settings.value('histTrailBacklinks');
    settings.trailLength = await joplin.settings.value('histTrailLength');
    settings.trailWidth = await joplin.settings.value('histTrailWidthRel') / 50;
    settings.plotSize = [settings.trailWidth,
        settings.panelTextSize * settings.panelTextSpace];
    settings.trailColors = (await joplin.settings.value('histTrailColors')).split(',');
    settings.trailFormat = await joplin.settings.value('histTrailFormat');
    settings.freqDisplay = await joplin.settings.value('histFreqDisplay');
    settings.freqOpen = await joplin.settings.value('histFreqOpen');
    settings.freqLoc = await joplin.settings.value('histFreqLoc');
    settings.freqScope = await joplin.settings.value('histFreqScope');
    settings.userStyle = await joplin.settings.value('histUserStyle');
    console.log(settings)
};

export function getSettingsSection(settings: HistSettings): Record<string, SettingItem> {
    return {
        'histSecBetweenItems': {
            value: settings.secBetweenItems,
            type: SettingItemType.Int,
            minimum: 0,
            section: 'HistoryPanel',
            public: true,
            label: 'History: Min seconds between items',
        },

        'histMaxDays': {
            value: settings.maxDays,
            type: SettingItemType.Int,
            minimum: 0,
            section: 'HistoryPanel',
            public: true,
            label: 'History: Days of history to keep',
            description: 'Enter 0 for eternity',
        },

        'histIncludeType': {
            value: settings.includeType,
            type: SettingItemType.Int,
            section: 'HistoryPanel',
            isEnum: true,
            public: true,
            label: 'History: Types of notes to include',
            options: {
                '0': 'All',
                '1': 'Notes',
                '2': 'To-Dos',
            }
        },

        'histDetectBacktrack': {
            value: settings.detectBacktrack,
            type: SettingItemType.Bool,
            section: 'HistoryPanel',
            public: true,
            label: 'History: Detect backtracking',
            description: 'i.e., browsing in history',
        },

        'histMarkCurrentLine': {
            value: settings.markCurrentLine,
            type: SettingItemType.Bool,
            section: 'HistoryPanel',
            public: true,
            label: 'Panel: Highlight clicked item',
            description: 'Backtracking must be activated'
        },

        'histPanelTitle': {
            value: settings.panelTitle,
            type: SettingItemType.String,
            section: 'HistoryPanel',
            public: true,
            label: 'Panel: Title',
        },

        'histPanelTitleSizeRel': {
            value: 100*settings.panelTitleSize,
            type: SettingItemType.Int,
            minimum: 1,
            section: 'HistoryPanel',
            public: true,
            label: 'Panel: Title font size (%)',
        },

        'histPanelTextSizeRel': {
            value: 100*settings.panelTextSize,
            type: SettingItemType.Int,
            minimum: 1,
            section: 'HistoryPanel',
            public: true,
            label: 'Panel: Text font size (%)',
        },

        'histTrailDisplay': {
            value: settings.trailDisplay,
            type: SettingItemType.Int,
            minimum: 0,
            maximum: 10,
            section: 'HistoryPanel',
            public: true,
            label: 'Trails: No. of trails (note links) levels to display',
            description: 'Enter 0 to hide',
        },

        'histTrailRecords': {
            value: settings.trailRecords,
            type: SettingItemType.Int,
            minimum: 0,
            maximum: 10,
            section: 'HistoryPanel',
            public: true,
            label: 'Trails: No. of trails levels to record in logs',
        },

        'histTrailBacklinks': {
            value: settings.trailBacklinks,
            type: SettingItemType.Bool,
            section: 'HistoryPanel',
            public: true,
            label: 'Trails: Include backlinks',
        },

        'histTrailLength': {
            value: settings.trailLength,
            type: SettingItemType.Int,
            minimum: 0,
            maximum: 100,
            section: 'HistoryPanel',
            public: true,
            label: 'Trails: Max trail length (no. of items)',
        },

        'histTrailWidthRel': {
            value: 200*settings.trailWidth,
            type: SettingItemType.Int,
            minimum: 0,
            section: 'HistoryPanel',
            public: true,
            label: 'Trails: Plot width (%)',
        },

        'histTrailFormat': {
            value: settings.trailFormat,
            type: SettingItemType.Int,
            section: 'HistoryPanel',
            isEnum: true,
            public: true,
            label: 'Trails: Markdown format',
            options: {
                '0': 'Before note title',
                '1': 'After note title',
            }
        },

        'histFreqLoc': {
            value: settings.freqLoc,
            type: SettingItemType.Int,
            section: 'HistoryPanel',
            isEnum: true,
            public: true,
            label: 'Frequent notes: Location',
            options: {
                '0': 'Top of panel',
                '1': 'Bottom of panel',
                '2': 'Hidden',
            }
        },

        'histFreqOpen': {
            value: settings.freqOpen,
            type: SettingItemType.Int,
            section: 'HistoryPanel',
            isEnum: true,
            public: true,
            label: 'Frequent notes: Panel section default state',
            options: {
                '0': 'Closed',
                '1': 'Open',
            }
        },

        'histFreqDisplay': {
            value: settings.freqDisplay,
            minimum: 0,
            maximum: 100,
            type: SettingItemType.Int,
            section: 'HistoryPanel',
            public: true,
            label: 'Frequent notes: No. of items',
        },

        'histFreqScope': {
            value: settings.freqScope,
            type: SettingItemType.Int,
            section: 'HistoryPanel',
            isEnum: true,
            public: true,
            label: 'Frequent notes: Statistics time period',
            options: {
                '0': 'Today',
                '1': 'Last 7 days',
                '2': 'This month',
                '3': 'This year',
                '4': 'All',
            }
        },

        'histNoteId': {
            advanced: true,
            value: settings.histNoteId,
            type: SettingItemType.String,
            section: 'HistoryPanel',
            public: true,
            label: 'History: Note ID',
        },

        'histExcludeNotes': {
            advanced: true,
            value: Array(...settings.excludeNotes).toString(),
            type: SettingItemType.String,
            section: 'HistoryPanel',
            public: true,
            label: 'History: Excluded notes',
            description: 'Comma-separated note IDs. Use Tools->History->Exclude note from history.'
        },

        'histExcludeFolders': {
            advanced: true,
            value: Array(...settings.excludeFolders).toString(),
            type: SettingItemType.String,
            section: 'HistoryPanel',
            public: true,
            label: 'History: Excluded notebooks',
            description: 'Comma-separated notebook IDs. Use Tools->History->Exclude notebook from history.'
        },

        'histExcludeTags': {
            advanced: true,
            value: Array(...settings.excludeTags).toString(),
            type: SettingItemType.String,
            section: 'HistoryPanel',
            public: true,
            label: 'History: Excluded tags',
            description: 'Comma-separated tags (no #)'
        },

        'histTrailColors': {
            advanced: true,
            value: settings.trailColors.join(','),
            type: SettingItemType.String,
            section: 'HistoryPanel',
            public: true,
            label: 'Trails: Color map',
            description: 'Comma-separated colors'
        },

        'histUserStyle': {
            advanced: true,
            value: settings.userStyle,
            type: SettingItemType.String,
            section: 'HistoryPanel',
            public: true,
            label: 'Panel: Stylesheet',
        },
    };
}

export async function setFolders(exclude: boolean, folderId: string, params: HistSettings) {
    params.excludeFolders.delete('');  // left when settings field is empty
    const T = await getFolderTree();  // folderId: childrenIds
    let q = ['root'];
    let folder: string;
    let found = false;

    // breadth-first search
    while (q.length) {
        folder = q.shift();
        if (folderId == folder){
            // restart queue and start accumulating
            found = true;
            q = [];
        }
        if (T.has(folder))
            q.push(...T.get(folder));

        if (!found)
            continue

        if (exclude) {
            params.excludeFolders.add(folder);
        } else {
            params.excludeFolders.delete(folder);
        }
    }

    await joplin.settings.setValue('histExcludeFolders',
        Array(...params.excludeFolders).toString());
}

async function getFolderTree(): Promise<Map<string, string[]>> {
    let T = new Map() as Map<string, string[]>;  // folderId: childrenIds
    let pageNum = 1;
    let hasMore = true;

    while (hasMore) {
        const { items, has_more } = await joplin.data.get(
            ['folders'], { page: pageNum++ });
        hasMore = has_more;

        for (const folder of items) {
            if (!folder.id)
                continue
            if (!folder.parent_id)
                folder.parent_id = 'root';

            if (!T.has(folder.parent_id)) {
                T.set(folder.parent_id, [folder.id]);
            } else {
                T.get(folder.parent_id).push(folder.id);
            }
        }
    }
    return T;
}
