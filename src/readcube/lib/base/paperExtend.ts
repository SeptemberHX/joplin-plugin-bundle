import {PaperFigure, PaperMetadata, PaperReference} from "./paperType";
import {PaperConfig} from "../../common";
import fetch from 'node-fetch';

export class PaperExtend {
    papersCookie: string;

    init(settings: PaperConfig) {
        this.papersCookie = settings.papersCookie;
    }

    async getMetadata(doi: string): Promise<PaperMetadata> {
        const requestUrl = `https://services.readcube.com/reader/metadata?doi=${doi}`;
        const response = await fetch(requestUrl, { headers: { Cookie: this.papersCookie} });
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
}
