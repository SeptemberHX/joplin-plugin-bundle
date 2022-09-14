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
