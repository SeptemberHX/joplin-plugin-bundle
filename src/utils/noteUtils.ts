import joplin from "../../api";


export async function searchNoteByUpdatedDate(date: string) {
    let page = 0;
    let results = [];
    let r;
    do {
        page += 1;
        // I don't know how the basic search is implemented, it could be that it runs a regex
        // query on each note under the hood. If that is the case and this behaviour crushed
        // some slow clients, I should consider reverting this back to searching all notes
        // (with the rate limiter)
        r = await joplin.data.get(['search'], {
            query: `updated:${date}`,
            fields: ['id', 'body', 'title', 'parent_id', 'is_conflict', 'updated_time'],
            page: page
        });
        if (r.items) {
            results = results.concat(r.items);
        }
    } while(r.has_more);
    return results;
}


export async function getAllNotes() {
    let page = 1;
    let results = [];
    let notes;
    do {
        notes = await joplin.data.get(['notes'], {
            fields: ['id', 'title', 'body', 'parent_id'],
            page: page
        });
        if (notes.items) {
            results = results.concat(notes.items);
        }
        page += 1;
    } while (notes.has_more);
    return results;
}


export async function getNoteTags(noteId) {
    let page = 1;
    let results = [];
    let searchResults;
    do {
        searchResults = await joplin.data.get(['notes', noteId, 'tags'], {
            fields: ['id', 'title'],
            page: page
        });
        if (searchResults.items) {
            results = results.concat(searchResults.items);
        }
        page += 1;
    } while (searchResults.has_more);
    return results;
}


export async function getFolder(folderId) {
    return await joplin.data.get(['folders', folderId], { fields: ['title', 'id'] });;
}
