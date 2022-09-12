function todoItemClicked(id) {
    webviewApi.postMessage({
        name: 'sidebar_todo_item_clicked',
        id: id
    });
}

function todoItemChanged(id, checked) {
    if (checked) {
        webviewApi.postMessage({
            name: 'sidebar_todo_item_checked',
            id: id
        })
    }
}

function todoTypeTabItemClicked(id) {
    webviewApi.postMessage({
        name: 'sidebar_todo_type_tab_item_clicked',
        id: id
    });
}

function onFilterProjectChanged() {
    var x = document.getElementById("assignee-selector").value;
    webviewApi.postMessage({
        name: 'sidebar_todo_filter_project_changed',
        id: x
    });
}

function onFilterTagChanged() {
    var x = document.getElementById("tag-selector").value;
    webviewApi.postMessage({
        name: 'sidebar_todo_filter_tag_changed',
        id: x
    });
}

function onFilterDueChanged() {
    var x = document.getElementById("due-selector").value;
    webviewApi.postMessage({
        name: 'sidebar_todo_filter_due_changed',
        id: x
    });
}

function onSearchChanged() {
    if (event.keyCode === 13) {
        webviewApi.postMessage({
            name: 'sidebar_todo_search_changed',
            id: event.target.value ? event.target.value : ''
        });
    }
}
