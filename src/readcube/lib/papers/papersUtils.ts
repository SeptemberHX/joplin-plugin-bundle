import joplin from "../../../../api";
import {PAPERS_COOKIE, PAPERS_FOLDER_NAME, SOURCE_URL_PAPERS_PREFIX, updateInfo} from "../../common";
import {
    createRecord, deleteRecord,
    getAllRecords,
    getNoteId2PaperId, getNoteIdByPaperId, getPaperItemByNoteIdOrTitle, removeInvalidSourceUrlByAllItems,
    updateRecord
} from "../base/paperDB";
import {PaperItem} from "../base/paperType";
import paperSvc from "../PaperSvcFactory";

export async function createNewNotesForPapers(selectedItemIds: string[], paperItems: PaperItem[]) {
    let noteId2PaperId = await getNoteId2PaperId();
    let paperId2NoteId = {};
    for (let noteId in noteId2PaperId) {
        paperId2NoteId[noteId2PaperId[noteId]] = noteId;
    }

    let paperId2Items = {};
    for (let item of paperItems) {
        paperId2Items[item.id] = item;
    }

    const rootPathId = await getOrCreatePaperRootFolder();
    let noteIds = [];
    for (let itemId of selectedItemIds) {
        if (itemId in paperId2NoteId) {
            noteIds.push(paperId2NoteId[itemId]);
        } else {
            const yearDirs = await getOrCreatePaperYearFolder(rootPathId, [paperId2Items[itemId].year.toString()])
            const targetYearDir = yearDirs[paperId2Items[itemId].year.toString()];
            const note = await joplin.data.post(['notes'], null, {
                    title: paperId2Items[itemId].title,
                    parent_id: targetYearDir,
                    body: createPaperBlockContent(paperId2Items[itemId]),
                    source_url: `${updateInfo('', SOURCE_URL_PAPERS_PREFIX, itemId)}`
                }
            );
            noteIds.push(note.id);
        }
    }
    return noteIds;
}

export async function syncAllPaperItems() {
    console.log('Enhancement: In syncAllPaperItems...');
    const allRemotePapers = await paperSvc.getSvc().getAllItems();
    let exitedPaperItemIds = new Set();
    const existedPapers = await getAllRecords();
    for (let paperItem of existedPapers) {
        exitedPaperItemIds.add(paperItem.id);
    }

    let remotePaperIds = new Set();
    for (let remotePaper of allRemotePapers) {
        remotePaperIds.add(remotePaper.id);
        if (exitedPaperItemIds.has(remotePaper.id)) {
            await updateRecord(remotePaper.id, remotePaper);
        } else {
            await createRecord(remotePaper.id, remotePaper);
        }
    }

    for (let localPaperId of exitedPaperItemIds) {
        if (!remotePaperIds.has(localPaperId)) {
            console.log('Enhancement: delete non-exist paper', localPaperId);
            await deleteRecord(localPaperId);
        }
    }

    await removeInvalidSourceUrlByAllItems(allRemotePapers);
    console.log('Enhancement: syncAllPaperItems finished');
    return;
}

export async function buildCitationForItem(item: PaperItem, noteId) {
    return buildCitation(
        item,
        item.title,
        item.authors,
        item.journal,
        item.volume,
        item.pagination,
        item.year,
        item.id,
        item.collection_id
    );
}

export async function buildRefName(item: PaperItem) {
    let name = item.authors[0].split(/\s/)[0];
    name += item.year;
    for (const t of item.journal.split(/\s/)) {
        if (t[0] >= 'A' && t[0] <= 'Z') {
            name += t[0];
        }
    }
    return name;
}

async function buildCitation(item, title, authors, from, volume, page, year, itemId, collectionId) {
    let showText = "";
    showText += authors.slice(0, authors.length - 1).join(', ') + `, and ${authors[authors.length - 1]}.`;
    showText += ` "[${title}](${paperSvc.externalLink(item)})."`;

    if (from.length > 0) {
        showText += ` In *${from}*.`;
    }

    if (volume.length > 0) {
        showText += ` vol. ${volume}.`;
    }

    if (page.length > 0) {
        showText += ` pp. ${page}.`;
    }

    if (year.length > 0) {
        showText += ` ${year}.`;
    }

    const noteId = await getNoteIdByPaperId(itemId);
    if (noteId) {
        showText += ` [🗒](:/${noteId}).`;
    }

    return showText;
}

export async function getOrCreatePaperRootFolder() {
    const folders = await joplin.data.get(['folders']);
    let folder_id;
    for (let folder of folders.items) {
        if (folder.parent_id === '' && folder.title === PAPERS_FOLDER_NAME) {
            folder_id = folder.id;
            break;
        }
    }

    if (!folder_id) {
        const folder = await joplin.data.post(['folders'], null, {title: PAPERS_FOLDER_NAME, parent_id: ''});
        folder_id = folder.id;
    }

    return folder_id;
}

async function getOrCreatePaperYearFolder(rootFolderId, subFolderNames) {
    const folders = await joplin.data.get(['folders']);
    let nameFolderIds = {}
    for (let folder of folders.items) {
        if (folder.parent_id === rootFolderId) {
            nameFolderIds[folder.title] = folder.id
        }
    }

    for (let folderName of subFolderNames) {
        if (folderName in nameFolderIds) {
            continue;
        }

        const subFolder = await joplin.data.post(['folders'], null, {title: folderName, parent_id: rootFolderId});
        nameFolderIds[folderName] = subFolder.id;
    }
    return nameFolderIds;
}

export async function appendPaperBlockIfMissing() {
    const rootFolderId = await getOrCreatePaperRootFolder();
    const folders = await joplin.data.get(['folders']);
    for (let folder of folders.items) {
        if (folder.parent_id === rootFolderId) {
            let page = 1;
            let notes = await joplin.data.get(['folders', folder.id, 'notes'], {
                fields: ['id', 'title', 'body']
            });
            while (true) {
                for (let item of notes.items) {
                    const paperItem = await getPaperItemByNoteIdOrTitle(item.id, item.title);
                    if (paperItem) {
                        const reg = new RegExp(`id:\\s*${paperItem.id}`);
                        if (!reg.test(item.body)) {
                            const modifiedBody = item.body + '\n' + createPaperBlockContent(paperItem);
                            await joplin.data.put(['notes', item.id], null, {body: modifiedBody})
                        }
                    }
                }

                if (notes.has_more) {
                    page += 1;
                    notes = await joplin.data.get(['folders', folder.id, 'notes'], {
                        fields: ['id', 'title', 'body'],
                        page: page
                    });
                } else {
                    break;
                }
            }
        }
    }
}

function createPaperBlockContent(paperItem: PaperItem) {
    return `
\`\`\`paper
id: ${paperItem.id}
\`\`\``
}
