import joplin from "../../api";
import {DAILY_NOTE_ROOT_DIR_NAME, DAILY_NOTE_TEMPLATE} from "./settings";


export async function getDailyNoteByDate(dateStr) {
    const splits = dateStr.split('-');
    const noteIds = await getDailyNoteIdsByMonth(splits[0], splits[1]);
    if (splits[2] in noteIds) {
        return noteIds[splits[2]];
    }
    return null;
}

export async function getDailyNoteIdsByMonth(year, month) {
    const monthDirId = await getOrCreateMonthFolder(year, month, false);
    if (!monthDirId) {
        return {};
    }

    const noteIds = {};
    let page = 1;
    let notes = await joplin.data.get(['folders', monthDirId, 'notes'], {
        fields: ['id', 'title', 'body']
    });
    while (true) {
        for (let item of notes.items) {
            const splits = item.title.split('-');
            if (splits.length === 3) {
                noteIds[splits[2]] = item.id;
            }
        }

        if (notes.has_more) {
            page += 1;
            notes = await joplin.data.get(['folders', monthDirId, 'notes'], {
                fields: ['id', 'title', 'body'],
                page: page
            });
        } else {
            break;
        }
    }
    return noteIds;
}

export async function createDailyNoteByDate(dateStr: string) {
    const splits = dateStr.split('-');
    const monthDirId = await getOrCreateMonthFolder(splits[0], splits[1], true);

    const note = await joplin.data.post(['notes'], null, {
            title: dateStr,
            parent_id: monthDirId,
            body: (await joplin.settings.value(DAILY_NOTE_TEMPLATE)).split(`\\n`).join('\n'),
        }
    );
    return note.id;
}

async function getOrCreateMonthFolder(year, month, ifCreate) {
    const rootDirId = await getOrCreateDailyNoteRootDir(ifCreate);
    if (!rootDirId) {
        return null;
    }

    const subDirMap = await getOrCreateSubFolder(rootDirId, [year], ifCreate);
    if (!(year in subDirMap)) {
        return null;
    }
    const yearDirId = subDirMap[year];
    const monthDirMap = await getOrCreateSubFolder(yearDirId, [month], ifCreate);
    if (!(month in monthDirMap)) {
        return null;
    }

    return monthDirMap[month];
}

async function getOrCreateDailyNoteRootDir(ifCreate) {
    let rootDirName = await joplin.settings.value(DAILY_NOTE_ROOT_DIR_NAME);
    if (rootDirName.length === 0) {
        rootDirName = 'Daily Note';
    }
    const folders = await joplin.data.get(['folders']);
    let folder_id;
    for (let folder of folders.items) {
        if (folder.parent_id === '' && folder.title === rootDirName) {
            folder_id = folder.id;
            break;
        }
    }

    if (!folder_id && ifCreate) {
        const folder = await joplin.data.post(['folders'], null, {title: rootDirName, parent_id: ''});
        folder_id = folder.id;
    }

    return folder_id;
}

async function getOrCreateSubFolder(parentFolderId, subFolderNames, ifCreate) {
    const folders = await joplin.data.get(['folders']);
    let nameFolderIds = {}
    for (let folder of folders.items) {
        if (folder.parent_id === parentFolderId) {
            nameFolderIds[folder.title] = folder.id
        }
    }

    for (let folderName of subFolderNames) {
        if (folderName in nameFolderIds) {
            continue;
        } else if (ifCreate) {
            const subFolder = await joplin.data.post(['folders'], null, {title: folderName, parent_id: parentFolderId});
            nameFolderIds[folderName] = subFolder.id;
        }
    }
    return nameFolderIds;
}
