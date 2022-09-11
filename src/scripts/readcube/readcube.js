function paperTabClicked(id) {
    webviewApi.postMessage({
        name: 'sidebar_paper_tab_item_clicked',
        id: id
    });
}
