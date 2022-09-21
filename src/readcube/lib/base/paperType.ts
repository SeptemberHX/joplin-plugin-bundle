/**
 * API utils for Readcube PapersLib. All the apis are analyzed from the web application.
 */


export class PaperReference {
    title: string;
    ordinal: number;
    authors: string[];
    year: string;
    pagination: string;
    label: string;
    doi: string;
    article_url: string;
    journal: string;
    reader_url: string;
}

export class PaperFigure {
    url: string;
    thumb: string;
    download_url: string;
    caption: string;
}

export class PaperMetadata {
    references: PaperReference[];
    figures: PaperFigure[];
}

export class PaperItem {
    title: string;
    journal: string;
    authors: string[];
    tags: string[];
    rating: number;
    abstract: string;
    collection_id: string;
    year: number;
    id: string;
    notes: string;
    annotations: [];
    issn: string;
    volume: string;
    url: string;
    pagination: string;
    journal_abbrev: string;
    doi: string;

    // zotero can have multiple notes for each paper
    zoteroNotes: string[];
}

export type CollectionItem = {
    id: string;
}
export type AnnotationItem = {
    id: string;
    type: string;
    text: string;
    note: string;
    color_id: number;
    page: number;
    item_id: string;  // collection_id:paper_id
    user_name: string;
    modified: string;
    color: string;    // if color_id < 0, color is used instead
}
