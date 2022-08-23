import * as moment from "moment";
import {getDailyNoteIdsByMonth} from "./utils";

function createCell(monthClass: string, hasNote: boolean, isToday: boolean, date) {
    return `<td class="${monthClass}" onclick="calendarCellClicked('${date.format('YYYY-MM-DD')}')">
        <div class="day ${hasNote ? 'hasNote' : 'noNote'} ${isToday ? 'curr-day' : ''}">
            ${date.date()}
            <div class="dot-container">
                <svg class="dot filled svelte-1widvzq" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg"><circle cx="3" cy="3" r="2"></circle></svg>
            </div>
        </div>
    </td>`;
}

function createCalendarTable(year, month, noteDays: string[]) {
    let table = `
        <table class="dailynote-table">
            <thead>
                <tr>
                    <td>Su</td>
                    <td>Mo</td>
                    <td>Tu</td>
                    <td>We</td>
                    <td>Th</td>
                    <td>Fr</td>
                    <td>Sa</td>
                </tr>
            </thead>
            <tbody>
    `;
    const currMonth = moment({year: year, month: month});
    const lastMonth = moment({year: year, month: month}).add(-1, 'day');
    const nextMonth = moment({year: year, month: month}).add(1, 'month');
    while (lastMonth.weekday() > 0 && lastMonth.weekday() <= 5) {
        lastMonth.add(1, 'day');
    }
    if (lastMonth.weekday() === 0) {
        table += `
                <tr>`;
        while (lastMonth < currMonth) {
            table += createCell('prev-month', false, false, lastMonth);
            lastMonth.add(1, 'day');
        }
        while (currMonth.weekday() > 0 && currMonth.weekday() <= 6) {
            table += createCell('curr-month', noteDays.includes(currMonth.format('DD')), currMonth.date() === moment().date(), currMonth);
            currMonth.add(1, 'day');
        }
        table += `
                </tr>`;
    }

    while (currMonth < nextMonth) {
        table += `
                <tr>`;
        for (let i = 0; i < 7; i++) {
            if (currMonth < nextMonth) {
                table += createCell('curr-month', noteDays.includes(currMonth.format('DD')), currMonth.date() === moment().date(), currMonth);
            } else {
                table += createCell('next-month', false, currMonth.date() === moment().date(), currMonth);
            }
            currMonth.add(1, 'day');
        }
        table += `
                </tr>`;
    }
    table += '</tbody>';
    table += '</table>';
    return table;
}

export async function createCalendar() {
    const year = moment().format('YYYY');
    const month = moment().format('MM');
    const t = await getDailyNoteIdsByMonth(year, month);
    return createCalendarTable(year, moment().month(), Object.keys(t));
}
