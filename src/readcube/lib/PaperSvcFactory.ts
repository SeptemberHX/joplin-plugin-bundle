import {PaperSvc} from "./base/paperSvc";
import {PaperConfig, PaperServiceType} from "../common";
import {ReadcubePaperSvc} from "./papers/readcubePaperSvc";
import {AnnotationItem, PaperItem, PaperMetadata} from "./base/paperType";
import { PaperNotify } from "./base/paperNotify";
import {PapersWS} from "./papers/papersWS";
import {ZoteroPaperSvc} from "./zotero/zoteroPaperSvc";
import {ZoteroWS} from "./zotero/zoteroWS";
import {PaperExtend} from "./base/paperExtend";

class PaperSvcFactory extends PaperSvc {
    paperSvc: PaperSvc;
    paperNotify: PaperNotify;
    paperExtend: PaperExtend;

    async init(settings: PaperConfig) {
        console.log('Papers: Init paper service...');
        switch (settings.type) {
            case PaperServiceType.READCUBE:
                this.paperSvc = new ReadcubePaperSvc();
                this.paperNotify = new PapersWS(settings);
                break;
            case PaperServiceType.ZOTERO:
                this.paperSvc = new ZoteroPaperSvc();
                this.paperNotify = new ZoteroWS(settings);
                break;
            default:
                break;
        }

        if (settings.papersCookie && settings.papersCookie.length > 0) {
            this.paperExtend = new PaperExtend();
            this.paperExtend.init(settings);
        }

        await this.paperSvc.init(settings);
    }

    externalLink(paperItem: PaperItem): String {
        return this.paperSvc.externalLink(paperItem);
    }

    getSvc(): PaperSvc{
        return this.paperSvc;
    }

    async onPaperChange(callback) {
        if (this.paperNotify) {
            this.paperNotify.onPaperChangeListeners.push(callback);
        }
    }

    async getAllItems(): Promise<PaperItem[]> {
        console.log('Papers: Get all items...');
        return await this.paperSvc.getAllItems();
    }

    async getAnnotation(paperItem: PaperItem): Promise<AnnotationItem[]> {
        return await this.paperSvc.getAnnotation(paperItem);
    }

    async getMetadata(doi: string): Promise<PaperMetadata> {
        if (this.paperExtend) {
            return await this.paperExtend.getMetadata(doi);
        }
        return null;
    }

    async extractNotes(paperItem: PaperItem): Promise<string[]> {
        return await this.paperSvc.extractNotes(paperItem);
    }
}


const paperSvc = new PaperSvcFactory();
export default paperSvc;
