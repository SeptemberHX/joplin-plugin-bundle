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
