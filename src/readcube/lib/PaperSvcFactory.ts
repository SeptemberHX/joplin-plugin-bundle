import {PaperSvc} from "./base/paperSvc";
import {PaperConfig, PaperServiceType} from "../common";
import {ReadcubePaperSvc} from "./papers/readcubePaperSvc";
import {AnnotationItem, PaperItem, PaperMetadata} from "./base/paperType";

class PaperSvcFactory extends PaperSvc{
    paperSvc: PaperSvc;

    async init(settings: PaperConfig) {
        switch (settings.type) {
            case PaperServiceType.READCUBE:
                this.paperSvc = new ReadcubePaperSvc();
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
