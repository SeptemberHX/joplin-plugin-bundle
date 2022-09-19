import {PaperSvc} from "./base/paperSvc";
import {PaperConfig, PaperServiceType} from "../common";
import {ReadcubePaperSvc} from "./papers/readcubePaperSvc";
import {AnnotationItem, PaperItem, PaperMetadata} from "./base/paperType";
import { PaperNotify } from "./base/paperNotify";
import {PapersWS} from "./papers/papersWS";

class PaperSvcFactory extends PaperSvc {
    paperSvc: PaperSvc;
    paperNotify: PaperNotify;

    async init(settings: PaperConfig) {
        switch (settings.type) {
            case PaperServiceType.READCUBE:
                this.paperSvc = new ReadcubePaperSvc();
                this.paperNotify = new PapersWS();
                break;
            case PaperServiceType.ZOTERO:
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
        this.paperNotify.onPaperChangeListeners.push(callback);
    }

    async getAllItems(): Promise<PaperItem[]> {
        return await this.paperSvc.getAllItems();
    }

    async getAnnotation(paperItem: PaperItem): Promise<AnnotationItem[]> {
        return await this.paperSvc.getAnnotation(paperItem);
    }

    async getMetadata(doi: string): Promise<PaperMetadata> {
        return await this.paperSvc.getMetadata(doi);
    }
}


const paperSvc = new PaperSvcFactory();
export default paperSvc;
