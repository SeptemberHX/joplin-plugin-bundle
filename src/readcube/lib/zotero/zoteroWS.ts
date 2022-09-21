import {PaperNotify} from "../base/paperNotify";
import ReconnectingWebSocket from "reconnecting-websocket";
import {PaperConfig} from "../../common";
import paperSvc from "../PaperSvcFactory";
import {createRecord, deleteRecord, getRecord, removeInvalidSourceUrlByItemId, updateRecord} from "../base/paperDB";
import {ZoteroPaperSvc} from "./zoteroPaperSvc";

const options = {
    WebSocket: WebSocket, // custom WebSocket constructor
    connectionTimeout: 30000,
    maxReconnectInterval: 5000
};

export class ZoteroWS extends PaperNotify {
    ws: ReconnectingWebSocket;
    papers: ZoteroPaperSvc;
    firstBoot = true;

    constructor(config: PaperConfig) {
        super(config);
        this.ws = new ReconnectingWebSocket('wss://stream.zotero.org', [], options);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    /**
     * Not sure why we need to repeat the subscription. Just do the same as observed in the webapp.
     * @param collectionId
     */
    sendSubscribe(): void {
        this.ws.send(`{
            "action": "createSubscriptions",
            "subscriptions": [
                {
                    "apiKey": "${this.settings.zoteroApiKey}",
                    "topics": [
                        "/users/${this.settings.zoteroUserId}"
                    ]
                }
            ]
        }`);
    }

    async onOpen() {
        if (this.settings.zoteroApiKey.length === 0) {
            alert('Empty cookie for Papers. Please set it in the preferences.');
            return;
        }

        this.papers = <ZoteroPaperSvc>paperSvc.getSvc();
        this.sendSubscribe();
    }

    async onMessage(event: any) {
        const messages = JSON.parse(event.data);
        console.log('PapersWebSocket: Receive ', event.data);
        if (!['topicUpdated', 'topicAdded', 'topicRemoved'].includes(messages.event)) {
            return;
        }

        const oldItemIds = new Set();
        for (const item of this.papers.cachedItems()) {
            oldItemIds.add(item.id);
        }

        const items =  await this.papers.getAllItems();
        let papersChanged = false;
        const newItemIds = new Set();
        for (const item of items) {
            papersChanged = true;
            newItemIds.add(item.id);
            if (oldItemIds.has(item.id)) {
                await updateRecord(item.id, item);
            } else {
                await createRecord(item.id, item);
            }
        }

        for (const oldItemId of oldItemIds) {
            if (!newItemIds.has(oldItemId)) {
                papersChanged = true;
                await deleteRecord(oldItemId);
                await removeInvalidSourceUrlByItemId(oldItemId);
            }
        }

        if (papersChanged) {
            for (const callback of this.onPaperChangeListeners) {
                await callback();
            }
        }
    }

    onClose(event): void {
        console.log('PapersWebSocket: Connection Closed.');
    }

    onError(): void {
        console.log('PapersWebSocket: Error happened');
    }
}
