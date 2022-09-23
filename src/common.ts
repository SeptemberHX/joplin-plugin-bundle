export const ENABLE_OUTLINE = 'bundle_enable_outline';
export const ENABLE_TODO = 'bundle_enable_todo';
export const ENABLE_DAILY_NOTE = 'bundle_enable_daily_note';
export const ENABLE_WRITING_MARKER = 'bundle_enable_writing_marker';
export const ENABLE_HISTORY = 'bundle_enable_history';
export const ENABLE_READCUBE_PAPERS = 'bundle_enable_readcube_papers';
export const PAPERS_DEFAULT_OPEN_DIRS = 'bundle_papers_default_open_dirs';
export const ENABLE_RELATED_NOTES = 'bundle_enable_related_notes';
export const RELATED_NOTES_DEFAULT_OPEN_DIRS = 'bundle_related_notes_default_open_dirs';
export const LAST_NOTE_UPDATE_DATE = 'bundle_last_note_update_date';
export const ENABLE_CHAR_COUNT = 'bundle_status_enable_char_count';


export const PAPERS_PLUGIN_ID = 'papers';
export const RELATED_NOTE_PLUGIN_ID = 'relatedNotesPlugin';

export enum MsgType {
    SCROLL_CHANGE,
    CURSOR_CHANGE,
}


export class SideBarConfig {
    outline: boolean;
    inlineTodo: boolean;
    dailyNote: boolean;
    writingMarker: boolean;
    history: boolean;
    readcube: boolean;
    papersDefaultDirs: string[];
    relatedNotes: boolean;
    relatedNotesDefaultDirs: string[];
    charCount: boolean;
}
