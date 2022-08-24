function calendarCellClicked(dateStr) {
    webviewApi.postMessage({
        name: 'sidebar_dailynote_day_clicked',
        id: dateStr
    })
}

function showCalendarFor(year, month) {
    webviewApi.postMessage({
        name: 'sidebar_dailynote_show_calendar_for',
        id: {
            year: year,
            month: month
        }
    })
}
