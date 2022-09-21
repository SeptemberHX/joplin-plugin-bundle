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

    /**
     * Get metadata for given paper
     * @param doi
     */
    async getMetadata(doi: string): Promise<PaperMetadata> {
        return null;
    }

    async init(settings: PaperConfig): Promise<void> { }
}