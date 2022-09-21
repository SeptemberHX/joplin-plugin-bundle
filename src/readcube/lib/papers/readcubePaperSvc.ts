import fetch from 'node-fetch';
import {AnnotationItem, CollectionItem, PaperFigure, PaperItem, PaperMetadata, PaperReference} from "../base/paperType";
import {PaperSvc} from "../base/paperSvc";


export class ReadcubePaperSvc extends PaperSvc {
    cookie: string;
    defaultCollectionId: string;

    async init(settings) {
        this.cookie = settings.papersCookie;
        this.defaultCollectionId = await this.getDefaultCollectionId();
    }

    /**
     * Get all the collections
     */
    async getCollections() {
        const response = await fetch(`https://sync.readcube.com/collections/`,
            { headers: {cookie: this.cookie }}
        );
        let results: CollectionItem[] = [];
        const resJson = await response.json();
        if (resJson && resJson.status === 'ok') {
            for (let item of resJson.collections) {
                results.push({id: item.id});
            }
        }
        return results;
    }

    async getDefaultCollectionId() {
        const ids = await this.getCollections();
        if (ids.length === 0) {
            return undefined;
        }
        return ids[0].id;
    }

    /**
     * Get all the items in the given collection
     * @param collection_id
     */
    async getItems(collection_id: string) {
        let requestUrl = `https://sync.readcube.com/collections/${collection_id}/items?size=50`;
        let results: PaperItem[] = [];
        while (true) {
            console.log('Enhancement: In the fetching while-loop...');
            const response = await fetch(requestUrl, {headers: {cookie: this.cookie}});
            const resJson = await response.json();
            if (resJson.status === 'ok') {
                for (let item of resJson.items) {
                    results.push(this.parseItemJson(item, collection_id));
                }
                console.log(`Enhancement: ${results.length}/${resJson.total} were fetched`);
                if (resJson.items.length != 0) {
                    requestUrl = `https://sync.readcube.com/collections/${collection_id}/items?sort%5B%5D=title,asc&size=50&scroll_id=${resJson.scroll_id}`;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        return results;
    }

    /**
     * Get the description for one item
     * @param collection_id
     * @param item_id
     */
    async getItem(collection_id: string, item_id: string) {
        let requestUrl = `https://sync.readcube.com/collections/${collection_id}/items/${item_id}`;
        const response = await fetch(requestUrl, {headers: {cookie: this.cookie}});
        const resJson = await response.json();
        if (resJson.status === 'ok') {
            return this.parseItemJson(resJson.item, collection_id);
        } {
            return null;
        }
    }

    /**
     * Get the user annotations of specific paper item created through ReadCube Papers
     */
    async getAnnotation(paperItem: PaperItem) {
        let requestUrl = `https://sync.readcube.com/collections/${paperItem.collection_id}/items/${paperItem.id}/annotations`;
        let results: AnnotationItem[] = [];
        const response = await fetch(requestUrl, { headers: { cookie: this.cookie} });
        const resJson = await response.json();
        if (resJson.status === 'ok') {
            for (let anno of resJson.annotations) {
                results.push({
                    id: anno.id,
                    type: anno.type,
                    text: anno.text ? anno.text : "",
                    note: anno.note ? anno.note : "",
                    color_id: anno.color_id,
                    page: anno.page_start,
                    item_id: anno.item_id,
                    user_name: anno.user_name,
                    modified: anno.modified,
                    color: ''
                });
            }
        }
        return results;
    }

    async getMetadata(doi: string) {
        const requestUrl = `https://services.readcube.com/reader/metadata?doi=${doi}`;
        const response = await fetch(requestUrl, { headers: { cookie: this.cookie } });
        if (response) {
            const resJson = await response.json();
            if (resJson) {
                const metadata = new PaperMetadata();
                metadata.references = [];
                for (const ref of resJson['references']) {
                    const paperRef = new PaperReference();
                    paperRef.title = 'title' in ref ? ref.title : '';
                    paperRef.ordinal = 'ordinal' in ref ? ref.ordinal : 1;
                    paperRef.authors = 'authors' in ref ? ref.authors : [];
                    paperRef.year = 'year' in ref ? ref.year : '';
                    paperRef.pagination = 'pagination' in ref ? ref.pagination : '';
                    paperRef.label = 'label' in ref ? ref.label : '';
                    paperRef.doi = 'doi' in ref ? ref.doi : '';
                    paperRef.article_url = 'article_url' in ref ? ref.article_url : '';
                    paperRef.reader_url = 'reader_url' in ref ? ref.reader_url : '';
                    paperRef.journal = 'journal' in ref ? ref.journal : '';
                    metadata.references.push(paperRef);
                }

                metadata.figures = [];
                for (const figure of resJson['figures']) {
                    const paperFigure = new PaperFigure();
                    paperFigure.url = 'url' in figure ? figure.url : '';
                    paperFigure.thumb = 'thumb' in figure ? figure.thumb : '';
                    paperFigure.download_url = 'download_url' in figure ? figure.download_url : '';
                    paperFigure.caption = 'caption' in figure ? figure.caption : '';
                    metadata.figures.push(paperFigure);
                }
                return metadata;
            }
        }
        return null;
    }

    /**
     * Get all the paper items in the first collections
     */
    async getAllItems() {
        return await this.getItems(this.defaultCollectionId);
    }

    parseItemJson(itemData, collection_id) {
        const item: PaperItem = {
            title: 'title' in itemData.article ? itemData.article.title : '',
            journal: 'journal' in itemData.article ? itemData.article.journal : 'Unknown',
            authors: 'authors' in itemData.article ? itemData.article.authors : [],
            tags: 'tags' in itemData.user_data ? itemData.user_data.tags : [],
            rating: 'rating' in itemData.user_data ? itemData.user_data.rating ? itemData.user_data.rating : -1 : -1,
            abstract: 'abstract' in itemData.article ? itemData.article.abstract : '',
            collection_id: collection_id,
            id: itemData.id,
            notes: 'notes' in itemData.user_data ? itemData.user_data.notes : '',
            annotations: [],
            year: 'year' in itemData.article ? itemData.article.year : 1000,
            issn: 'issn' in itemData.article ? itemData.article.issn : '',
            volume: 'volume' in itemData.article ? itemData.article.volume : '',
            url: 'url' in itemData.article ? itemData.article.url : '',
            pagination: 'pagination' in itemData.article ? itemData.article.pagination : '',
            journal_abbrev: 'journal_abbrev' in itemData.article ? itemData.article.journal_abbrev : '',
            doi: 'doi' in itemData.ext_ids ? itemData.ext_ids.doi : '',
            zoteroNotes: []
        }
        return item;
    }
}