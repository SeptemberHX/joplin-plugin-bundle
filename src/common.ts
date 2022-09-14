export const ENABLE_OUTLINE = 'bundle_enable_outline';
export const ENABLE_TODO = 'bundle_enable_todo';
export const ENABLE_DAILY_NOTE = 'bundle_enable_daily_note';
export const ENABLE_WRITING_MARKER = 'bundle_enable_writing_marker';
export const ENABLE_HISTORY = 'bundle_enable_history';
export const ENABLE_READCUBE_PAPERS = 'bundle_enable_readcube_papers';


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
}
