/**
 * Children should make sure the callbacks are called when note changes
 */
export abstract class PaperNotify {
    onPaperChangeListeners;

    protected constructor() {
        this.onPaperChangeListeners = [];
    }

    async onPaperChange(callback) {
        this.onPaperChangeListeners.push(callback);
    }
}
