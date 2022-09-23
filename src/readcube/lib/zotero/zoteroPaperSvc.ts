import {PaperSvc} from "../base/paperSvc";
import {AnnotationItem, PaperItem, PaperMetadata} from "../base/paperType";
import {PaperConfig} from "../../common";
const { default: api } = require('zotero-api-client');
import * as chrono from 'chrono-node';

export class ZoteroPaperSvc extends PaperSvc {
    userId: number;
    apiKey: string;
    myapi;
    version: number = 0;
    items: PaperItem[] = [];

    async extractNotes(paperItem: PaperItem): Promise<string[]> {
        console.log('Zotero: Extracting notes');
        return await this.getNotes(paperItem);
    }

    cachedItems() {
        return this.items;
    }

    externalLink(paperItem: PaperItem): String {
        return `zotero://select/items/1_${paperItem.id}`;
    }

    async getAllItems(): Promise<PaperItem[]> {
        console.log('Papers: Get all items in zotero...');
        const response = await this.myapi.version(this.version).items().top().get();

        if (!response.getVersion() || this.version === response.getVersion()) {
            ;
        } else {
            const items = [];
            for (const item of response.raw) {
                items.push(this.parseItemJson(item));
            }
            this.version = response.getVersion();
            this.items = items;
        }
        console.log('Papers:', this.items);
        return this.items;
    }

    async getAnnotation(paperItem: PaperItem): Promise<AnnotationItem[]> {
        let annotations: AnnotationItem[] = [];
        for (const item of (await this.myapi.items(paperItem.id).children().get()).raw) {
            if (item.data.itemType === 'attachment') {
                for (const subItem of (await this.myapi.items(item.key).children().get()).raw) {
                    if (subItem.data.itemType === 'annotation') {
                        subItem.data.annotationPosition
                        annotations.push({
                            id: subItem.data.key,
                            type: subItem.data.annotationType,
                            text: subItem.data.annotationText,
                            note: subItem.data.annotationComment,
                            color_id: -1,
                            color: subItem.data.annotationColor,
                            page: JSON.parse(subItem.data.annotationPosition).pageIndex,
                            item_id: subItem.data.parentItem,
                            user_name: '',
                            modified: subItem.data.dateModified
                        })
                    }
                }
            }
        }
        return annotations;
    }

    async getNotes(paperItem: PaperItem) {
        let notes = [];
        for (const item of (await this.myapi.items(paperItem.id).children().get()).raw) {
            if (item.data.itemType === 'note') {
                notes.push(item.data.note);
            }
        }
        return notes;
    }

    async init(settings: PaperConfig): Promise<void> {
        this.userId = settings.zoteroUserId;
        this.apiKey = settings.zoteroApiKey;
        this.myapi = api(settings.zoteroApiKey).library('user', settings.zoteroUserId);
    }

    parseItemJson(jsonObject) {
        const item = new PaperItem();
        item.id = jsonObject.key;
        item.doi = jsonObject.data.DOI;
        item.url = jsonObject.data.url;
        item.year = 0;
        if (jsonObject.data.date && jsonObject.data.date.length > 0) {
            const date = chrono.parseDate(jsonObject.data.date);
            if (date) {
                item.year = date.getFullYear();
            }
        }

        item.abstract = jsonObject.data.abstractNote;
        item.annotations = [];
        item.authors = [];
        for (const creator of jsonObject.data.creators) {
            item.authors.push(`${creator.firstName} ${creator.lastName}`)
        }
        item.collection_id = null;
        item.issn = jsonObject.data.ISSN;
        item.journal = jsonObject.data.publicationTitle;
        item.journal_abbrev = jsonObject.data.journalAbbreviation;
        item.tags = [];
        item.rating = -1;
        for (const tag of jsonObject.data.tags) {
            if (tag.tag.includes('★')) {
                item.rating = tag.tag.lastIndexOf('★') + 1;
            } else {
                item.tags.push(tag.tag);
            }
        }
        item.notes = '';
        item.pagination = jsonObject.data.pages;
        item.volume = jsonObject.data.volume;
        item.title = jsonObject.data.title;
        return item;
    }
}
