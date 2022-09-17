function onRelatedTitleClicked(noteId) {
    webviewApi.postMessage({
        name: 'sidebar_related_notes_item_clicked',
        id: noteId
    })
}
