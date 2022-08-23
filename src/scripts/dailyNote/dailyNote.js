function calendarCellClicked(dateStr) {
    webviewApi.postMessage({
        name: 'sidebar_dailynote_day_clicked',
        id: dateStr
    })
}
