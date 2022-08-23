import joplin from "../../api";

const DAILY_NOTE_ROOT_DIR_NAME = 'Daily Note';

export async function getDailyNoteByDate(dateStr) {
    const splits = dateStr.split('-');
    const noteIds = await getDailyNoteIdsByMonth(splits[0], splits[1]);
    if (splits[2] in noteIds) {
        return noteIds[splits[2]];
    }
    return null;
}

export async function getDailyNoteIdsByMonth(year, month) {
    const monthDirId = await getOrCreateMonthFolder(year, month);

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
    const monthDirId = await getOrCreateMonthFolder(splits[0], splits[1]);

    const note = await joplin.data.post(['notes'], null, {
            title: dateStr,
            parent_id: monthDirId,
            body: '',
        }
    );
    return note.id;
}

async function getOrCreateMonthFolder(year, month) {
    const rootDirId = await getOrCreateDailyNoteRootDir();
    const subDirMap = await getOrCreateSubFolder(rootDirId, [year]);
    const yearDirId = subDirMap[year];

    const monthDirMap = await getOrCreateSubFolder(yearDirId, [month]);
    return monthDirMap[month];
}

async function getOrCreateDailyNoteRootDir() {
    const folders = await joplin.data.get(['folders']);
    let folder_id;
    for (let folder of folders.items) {
        if (folder.parent_id === '' && folder.title === DAILY_NOTE_ROOT_DIR_NAME) {
            folder_id = folder.id;
            break;
        }
    }

    if (!folder_id) {
        const folder = await joplin.data.post(['folders'], null, {title: DAILY_NOTE_ROOT_DIR_NAME, parent_id: ''});
        folder_id = folder.id;
    }

    return folder_id;
}

async function getOrCreateSubFolder(parentFolderId, subFolderNames) {
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
        }

        const subFolder = await joplin.data.post(['folders'], null, {title: folderName, parent_id: parentFolderId});
        nameFolderIds[folderName] = subFolder.id;
    }
    return nameFolderIds;
}