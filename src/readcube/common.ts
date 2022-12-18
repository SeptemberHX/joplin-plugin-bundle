export const PAPERS_COOKIE = 'PapersPluginCookie';
export const PAPERS_FOLDER_NAME = 'Papers';
export const CITATION_POPUP_ID = 'enhancement_citation_popup_id';
export const PAPERS_NOTEID_TO_PAPERID_TITLE = 'papers.db';
export const SOURCE_URL_PAPERS_PREFIX = 'papers_';
export const SOURCE_URL_DIDA_PREFIX = 'dida_';
export const ENABLE_CUSTOM_STYLE = 'PapersPluginEnableCustomStyle';
export const ENABLE_ENHANCED_BLOCKQUOTE = 'PapersPluginEnableEnhancedQuote';
export const ZOTERO_USER_ID = 'PapersZoteroUserId';
export const ZOTERO_USER_API_KEY = 'PapersZoteroUserApiKey';
export const PAPERS_SERVICE_PROVIDER = 'PapersServiceProvider';
export const PAPERS_CREATE_PAPER_NOTE_IN_CURRENT_FOLDER = 'PapersCreateNotePaperInCurrentFolder';

export enum PaperServiceType {
    READCUBE,
    ZOTERO,
}


export class PaperConfig {
    type: PaperServiceType;
    papersCookie: string;
    zoteroUserId: number;
    zoteroApiKey: string;
    paperNoteInCurrFolder: boolean;
}


export function extractInfo(data: string) {
    const splitResults = data.split(':');
    let info = {};
    for (const result of splitResults) {
        if (result.startsWith(SOURCE_URL_PAPERS_PREFIX)) {
            info[SOURCE_URL_PAPERS_PREFIX] = result.substr(SOURCE_URL_PAPERS_PREFIX.length);
        } else if (result.startsWith(SOURCE_URL_DIDA_PREFIX)) {
            info[SOURCE_URL_DIDA_PREFIX] = result.substr(SOURCE_URL_DIDA_PREFIX.length);
        }
    }
    return info;
}

export function updateInfo(raw, prefix, data) {
    let info = extractInfo(raw);
    info[prefix] = data;

    let newInfoStrs = [];
    for (let prefix in info) {
        newInfoStrs.push(`${prefix}${info[prefix]}`);
    }
    return newInfoStrs.join(':');
}
