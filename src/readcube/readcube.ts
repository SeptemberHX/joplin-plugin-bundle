import {ContentScriptType, MenuItem, MenuItemLocation, ToolbarButtonLocation} from "../../api/types";
import joplin from "../../api";
import {getAllRecords, getPaperItemByNoteIdOrTitle, setupDatabase} from "./lib/papers/papersDB";
import {
    buildCitationForItem,
    buildRefName,
    createNewNotesForPapers,
    syncAllPaperItems
} from "./lib/papers/papersUtils";
import {selectAnnotationPopup, selectPapersPopup} from "./ui/citation-popup";
import {AnnotationItem, PaperItem, PapersLib} from "./lib/papers/papersLib";
import {PapersWS} from "./lib/papers/papersWS";
import {ENABLE_ENHANCED_BLOCKQUOTE, PAPERS_COOKIE} from "./common";

export async function initPapers() {
    // init the database
    const papers_cookie = await joplin.settings.value(PAPERS_COOKIE);
    if (!papers_cookie || papers_cookie.length === 0) {
        return;
    }

    await setupDatabase();
    await PapersLib.init(papers_cookie);
    new PapersWS();

    await joplin.contentScripts.onMessage(
        'enhancement_paper_fence_renderer',
        async () => {
            const currNote = await joplin.workspace.selectedNote();
            if (currNote) {
                return await getPaperItemByNoteIdOrTitle(currNote.id, currNote.title);
            }
            return undefined;
        }
    );

    const dialogs = joplin.views.dialogs;
    const beforeHandle = await dialogs.create('BeforeSyncDialog');
    await dialogs.setHtml(beforeHandle, '<p>You are trying to sync with your papers library.</p>' +
        '<p>Click "Ok" button to begin the synchronization</p>' +
        '<p>After clicking the "Ok" button, this dialog disappears, and the dialog will show again when the synchronization is finished.</p>' +
        '<p>It can spend several minutes, depending on your library size and network condition.</p>' +
        '<p><mark>Please DO NOT try to sync again until next dialog appears again!</mark></p>');
    await dialogs.setButtons(beforeHandle, [{id: 'ok'}, {id: 'cancel'}]);

    const errHandle = await dialogs.create('errSyncDialog');
    await dialogs.setHtml(errHandle, '<p>Error happens during sync with your Papers library. Please check your papers cookie and network connection.</p>');
    await dialogs.setButtons(errHandle, [{id: 'ok'}]);

    const finishHandle = await dialogs.create('finishSyncDialog');
    await dialogs.setHtml(finishHandle, '<p>Syncing with your Papers library finished.</p>')
    await dialogs.setButtons(finishHandle, [{id: 'ok'}]);

    const copyErrHandle = await dialogs.create('copyErrDialog');
    await dialogs.setHtml(copyErrHandle, '<p>Ops. It seems you tried to operate on a non-paper note!</p>');
    await dialogs.setButtons(copyErrHandle, [{id: 'ok'}]);

    await joplin.contentScripts.register(
        ContentScriptType.CodeMirrorPlugin,
        'enhancement_autoCitation',
        './readcube/driver/codemirror/autoCitation/index.js'
    );

    await joplin.contentScripts.register(
        ContentScriptType.MarkdownItPlugin,
        'enhancement_paper_fence_renderer',
        './readcube/driver/markdownItRenderer/paperFence/index.js'
    );

    await joplin.commands.register({
        name: "enhancement_papers_syncAll",
        label: "Sync All Files from Papers",
        execute: async () => {
            try {
                const result = await dialogs.open(beforeHandle);
                if (result.id === 'ok') {
                    await syncAllPaperItems();
                    await dialogs.open(finishHandle);
                }
            } catch (err) {
                if (err.message.code === 'ETIMEDOUT') {
                    console.log("ETIMEDOUT in syncAllPaperItems()");
                }
                console.log(err);
                await dialogs.open(errHandle);
                return;
            }
        },
    });

    await joplin.commands.register({
        name: "enhancement_papers_createNoteForPaper",
        label: "Create notes for papers",
        iconName: "fas fa-notes",
        execute: async () => {
            const items: PaperItem[] = await getAllRecords();
            let paperId2Item = {};
            for (let index in items) {
                paperId2Item[items[index].id] = items[index];
            }

            const selectedRefsIDs: string[] = await selectPapersPopup(items);

            if (selectedRefsIDs.length > 0) {
                const noteIds = await createNewNotesForPapers(selectedRefsIDs, items);
                await joplin.commands.execute('openNote', noteIds[0]);
            }
        }
    });

    await joplin.commands.register({
        name: 'enhancement_cite_papers',
        label: 'Cite your papers',
        iconName: 'fa fa-graduation-cap',
        execute: async () => {
            const items: PaperItem[] = await getAllRecords();
            let paperId2Item = {};
            for (let index in items) {
                paperId2Item[items[index].id] = items[index];
            }

            const selectedRefsIDs: string[] = await selectPapersPopup(items);
            const refNames = [];
            const citations = [];
            for (const id of selectedRefsIDs) {
                refNames.push(await buildRefName(paperId2Item[id]));
                citations.push(await buildCitationForItem(paperId2Item[id], ""));
            }
            await joplin.commands.execute('editor.execCommand', {
                name: 'enhancement_insertCitation',
                args: [[citations, refNames]]
            });
        }
    });

    await joplin.commands.register({
        name: 'enhancement_cite_paper_annotations',
        label: 'Cite your paper annotations',
        iconName: 'fa fa-quote-left',
        execute: async () => {
            const currNote = await joplin.workspace.selectedNote();
            if (currNote) {
                const paper = await getPaperItemByNoteIdOrTitle(currNote.id, currNote.title);
                if (paper) {
                    const annotations: AnnotationItem[] = await PapersLib.getAnnotation(paper.collection_id, paper.id);
                    let annoId2Anno = {};
                    for (let index in annotations) {
                        annoId2Anno[annotations[index].id] = annotations[index];
                    }

                    const annoIds = await selectAnnotationPopup(annotations);
                    const annos = [];
                    for (const id of annoIds) {
                        annos.push(annoId2Anno[id]);
                    }
                    await joplin.commands.execute('editor.execCommand', {
                        name: 'enhancement_insertAnnotation',
                        args: [[annos, await joplin.settings.value(ENABLE_ENHANCED_BLOCKQUOTE)]]
                    });
                } else {
                    await dialogs.open(copyErrHandle);
                }
            }
        }
    });

    const commandsSubMenu: MenuItem[] = [
        {
            commandName: 'enhancement_papers_syncAll',
            label: 'Sync All Files from Papers'
        },
        {
            commandName: 'enhancement_papers_createNoteForPaper',
            label: 'Create notes for papers'
        },
    ];
    await joplin.views.menus.create('enhancementToolMenu', 'Enhancement', commandsSubMenu, MenuItemLocation.Tools);

    await joplin.views.toolbarButtons.create(
        'enhancementCitePapers',
        'enhancement_cite_papers',
        ToolbarButtonLocation.EditorToolbar
    );

    await joplin.views.toolbarButtons.create(
        'enhancementCitePaperAnnotation',
        'enhancement_cite_paper_annotations',
        ToolbarButtonLocation.EditorToolbar
    );
}
