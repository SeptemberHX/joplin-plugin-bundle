function tabItemClicked(id) {
    webviewApi.postMessage({
        name: 'sidebar_tab_item_clicked',
        id: id
    });
}

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
