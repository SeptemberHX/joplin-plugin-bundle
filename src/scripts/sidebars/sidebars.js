function tabItemClicked(id) {
    webviewApi.postMessage({
        name: 'sidebar_tab_item_clicked',
        id: id
    });
}

webviewApi.onMessage((data) => {
    if (data.message.type === 'update') {
        const element = document.getElementById(data.message.elementId);
        if (element) {
            element.innerHTML = data.message.html;
        }
    }
});
