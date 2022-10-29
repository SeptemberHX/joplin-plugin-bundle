function onRelatedTitleClicked(noteId, line) {
    webviewApi.postMessage({
        name: 'sidebar_related_notes_item_clicked',
        id: noteId,
        line: line
    })
}

function onRelatedArrowClicked(noteId, lineR) {
    webviewApi.postMessage({
        name: 'sidebar_related_notes_arrow_clicked',
        id: noteId,
        lineR: lineR
    })
}

function relatedNoteTabClicked(id) {
    webviewApi.postMessage({
        name: 'sidebar_related_note_item_tab_clicked',
        id: id
    });
}

function jumpToNoteLine(noteId, lineNumber) {
    webviewApi.postMessage({
        name: 'sidebar_related_note_context_clicked',
        id: noteId,
        line: lineNumber - 1
    });
}
