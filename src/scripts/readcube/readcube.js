function paperTabClicked(id) {
    webviewApi.postMessage({
        name: 'sidebar_paper_tab_item_clicked',
        id: id
    });
}

function annotationMouseOverAndOut(over) {
    if (event.target) {
        const buttonsEle = event.target.querySelector('.anno-buttons');
        if (buttonsEle) {
            buttonsEle.style.visibility = over ? 'visible' : 'hidden';
        }
    }
}

function paperItemMouseOverAndOut(over) {
    if (event.target) {
        const buttonsEle = event.target.querySelector('.paper-info-buttons');
        if (buttonsEle) {
            buttonsEle.style.visibility = over ? 'visible' : 'hidden';
        }
    }
}

function annotationCopyClicked(annotation_id) {
    webviewApi.postMessage({
        name: 'sidebar_annotation_copy_clicked',
        id: annotation_id
    });
}

function annotationCiteClicked(annotation_id) {
    webviewApi.postMessage({
        name: 'sidebar_annotation_cite_clicked',
        id: annotation_id
    });
}

function onSearchPressed() {
    if (event.keyCode === 13) {
        webviewApi.postMessage({
            name: 'sidebar_papers_anno_search_changed',
            id: event.target.value ? event.target.value : ''
        });
    }
}
