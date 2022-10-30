export interface SidebarStatus {
    mentionFilter: true,
    mentionedFilter: true,
    bidirectionFilter: true,
    sortFilter: string,
    tabIndex: number,
    settings: RelatedNoteSettings,
}


export class RelatedNoteSettings {
    collapsed: boolean = true;
}
