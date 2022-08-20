function todoItemClicked(id) {
    webviewApi.postMessage({
        name: 'sidebar_todo_item_clicked',
        id: id
    });
}
