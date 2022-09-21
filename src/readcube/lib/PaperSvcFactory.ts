import {PaperSvc} from "./base/paperSvc";
import {PaperConfig, PaperServiceType} from "../common";
import {ReadcubePaperSvc} from "./papers/readcubePaperSvc";
import {AnnotationItem, PaperItem, PaperMetadata} from "./base/paperType";
import { PaperNotify } from "./base/paperNotify";
import {PapersWS} from "./papers/papersWS";
import {ZoteroPaperSvc} from "./zotero/zoteroPaperSvc";
import {ZoteroWS} from "./zotero/zoteroWS";

class PaperSvcFactory extends PaperSvc {
    paperSvc: PaperSvc;
    paperNotify: PaperNotify;

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
        await this.paperSvc.init(settings);
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
        return await this.paperSvc.getMetadata(doi);
    }

    async extractNotes(paperItem: PaperItem): Promise<string[]> {
        return await this.paperSvc.extractNotes(paperItem);
    }
}


const paperSvc = new PaperSvcFactory();
export default paperSvc;
