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

function onSorterChanged() {
    var x = document.getElementById("related-notes-sorter-selector").value;
    webviewApi.postMessage({
        name: 'sidebar_related_notes_sorter_changed',
        id: x
    });
}

function onFilterChanged() {
    webviewApi.postMessage({
        name: 'sidebar_related_notes_filter_changed',
        id: event.currentTarget.checked,
        type: event.currentTarget.name
    });
}
