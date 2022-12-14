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
            buttonsEle.style.opacity = over ? 1 : 0;
        }
    }
}

function paperItemMouseOverAndOut(over) {
    if (event.target) {
        const buttonsEle = event.target.querySelector('.paper-info-buttons');
        if (buttonsEle) {
            buttonsEle.style.opacity = over ? 1 : 0;
        }
    }
}

function refItemMouseOverAndOut(over) {
    if (event.target) {
        const buttonsEle = event.target.querySelector('.ref-info-buttons');
        if (buttonsEle) {
            buttonsEle.style.opacity = over ? 1 : 0;
        }
    }
}

function annotationExternalLinkClicked(annotation_link) {
    webviewApi.postMessage({
        name: 'sidebar_open_item',
        id: annotation_link
    });
}

function annotationCopyLinkClicked(annotation_id) {
    webviewApi.postMessage({
        name: 'sidebar_annotation_copy_link_clicked',
        id: annotation_id
    });
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

function onRefSearchPressed() {
    if (event.keyCode === 13) {
        webviewApi.postMessage({
            name: 'sidebar_papers_ref_search_changed',
            id: event.target.value ? event.target.value : ''
        });
    }
}

function onPaperTitleClicked(remote_url) {
    webviewApi.postMessage({
        name: 'sidebar_open_item',
        id: remote_url
    });
}

function onPaperFigureClicked() {
    if (event.target) {
        const img = event.target;
        if (img && img.width > 0 && img.height > 0) {
            var canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/png");
            webviewApi.postMessage({
                name: 'sidebar_copy_img_by_url',
                id: dataURL
            });
        }
    }
}

function onPaperSelectorChanged() {
    var x = document.getElementById("paper-selector").value;
    webviewApi.postMessage({
        name: 'sidebar_paper_selector_changed',
        id: x
    });
}
