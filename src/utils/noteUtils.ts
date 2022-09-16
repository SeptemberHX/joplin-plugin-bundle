import joplin from "../../api";

export async function getAllNotes() {
    let page = 1;
    let results = [];
    let notes;
    do {
        notes = await joplin.data.get(['notes'], {
            fields: ['id', 'title', 'body'],
            page: page
        });
        results = results.concat(notes.items);
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
        results = results.concat(searchResults.items);
        page += 1;
    } while (searchResults.has_more);
    return results;
}
