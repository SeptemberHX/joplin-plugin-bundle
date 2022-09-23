import {AnnotationItem, PaperItem, PaperMetadata} from "./paperType";
import {PaperConfig} from "../../common";

export abstract class PaperSvc {
    /**
     * Return all papers
     */
    async getAllItems(): Promise<PaperItem[]> {
        return [];
    }

    /**
     * Return all annotations of given paper
     * @param paperItem
     */
    async getAnnotation(paperItem: PaperItem): Promise<AnnotationItem[]> {
        return [];
    }

    async init(settings: PaperConfig): Promise<void> { }

    async extractNotes(paperItem: PaperItem): Promise<string[]> {
        console.log("PaperSvc: Extracting notes");
        return [];
    }

    externalLink(paperItem: PaperItem): String {
        return null;
    }
}
