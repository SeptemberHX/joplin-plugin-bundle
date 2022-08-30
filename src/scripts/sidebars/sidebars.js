function tabItemClicked(id) {
    webviewApi.postMessage({
        name: 'sidebar_tab_item_clicked',
        id: id
    });
}
