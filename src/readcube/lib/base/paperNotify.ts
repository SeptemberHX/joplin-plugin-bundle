/**
 * Children should make sure the callbacks are called when note changes
 */
import {PaperConfig} from "../../common";

export abstract class PaperNotify {
    onPaperChangeListeners;
    settings: PaperConfig;

    protected constructor(config: PaperConfig) {
        this.settings = config;
        this.onPaperChangeListeners = [];
    }

    async onPaperChange(callback) {
        this.onPaperChangeListeners.push(callback);
    }
}
