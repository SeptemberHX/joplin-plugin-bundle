import * as moment from "moment";
import {getDailyNoteIdsByMonth} from "./utils";
import {DailyNoteConfig} from "./settings";
import {cellInnerHtml} from "./htmlGenerator";

function createCell(monthClass: string, hasNote: boolean, isToday: boolean, date, finishedTaskCount?: number, config?: DailyNoteConfig, wordCount?: number) {
    return `<td class="${monthClass}" onclick="calendarCellClicked('${date.format('YYYY-MM-DD')}')">
        ${cellInnerHtml(monthClass, hasNote, isToday, date, finishedTaskCount, config, wordCount)}
    </td>`;
}

function createCalendarTable(year, month, noteDaysInfo, config: DailyNoteConfig) {
    const currMonth = moment({year: year, month: month});
    const lastMonth = moment({year: year, month: month}).add(-1, 'day');
    const nextMonth = moment({year: year, month: month}).add(1, 'month');
    let offset = config.mondayAsFirst ? 1 : 0;

    let table = `
        <div class="month-container btn-group" role="group">
            <button type="button" class="btn button-previous btn-light" onclick="this.blur(); showCalendarFor(${lastMonth.year()}, ${lastMonth.month()});"><</button>
            <button type="button" class="btn button-current btn-light btn-lg" onclick="this.blur(); showCalendarFor(${moment().year()}, ${moment().month()});">${currMonth.format('YYYY-MM')}</button>
            <button type="button" class="btn button-next btn-light" onclick="this.blur(); showCalendarFor(${nextMonth.year()}, ${nextMonth.month()});">></button>
        </div>
        <table class="dailynote-table">
            <thead>
                <tr>`;
    if (offset === 0) {
        table += `
                    <td>Su</td>
                    <td>Mo</td>
                    <td>Tu</td>
                    <td>We</td>
                    <td>Th</td>
                    <td>Fr</td>
                    <td>Sa</td>`;
    } else {
        table += `
                    <td>Mo</td>
                    <td>Tu</td>
                    <td>We</td>
                    <td>Th</td>
                    <td>Fr</td>
                    <td>Sa</td>
                    <td>Su</td>`;
    }
    table += `</tr></thead><tbody>`

    while (lastMonth.weekday() >= 1 + offset && lastMonth.weekday() <= 5 + offset) {
        lastMonth.add(-1, 'day');
    }
    if (lastMonth.weekday() === 0 + offset) {
        table += `
                <tr>`;
        while (lastMonth < currMonth) {
            table += createCell('prev-month', false, false, lastMonth);
            lastMonth.add(1, 'day');
        }
        while (currMonth.weekday() !== 0 + offset) {
            const hasNote = currMonth.format('DD') in noteDaysInfo;
            const noteInfo = noteDaysInfo[currMonth.format('DD')];
            table += createCell('curr-month', hasNote,
                currMonth.date() === moment().date() && currMonth.year() === moment().year() && currMonth.month() === moment().month(),
                currMonth, hasNote ? noteInfo.finishedTaskCount : null, config, noteInfo ? noteInfo.wordCount : null);
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
                const hasNote = currMonth.format('DD') in noteDaysInfo;
                const noteInfo = noteDaysInfo[currMonth.format('DD')];
                table += createCell('curr-month', hasNote,
                    currMonth.date() === moment().date() && currMonth.year() === moment().year() && currMonth.month() === moment().month(),
                    currMonth, hasNote ? noteInfo.finishedTaskCount : null, config, noteInfo ? noteInfo.wordCount : null);
            } else {
                table += createCell('next-month', false,
                    currMonth.date() === moment().date() && currMonth.year() === moment().year() && currMonth.month() === moment().month(),
                    currMonth);
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

export async function createCalendar(year, month, config: DailyNoteConfig) {
    const yearStr = `${year}`;
    let monthStr = `${month + 1}`;
    if (monthStr.length === 1) {
        monthStr = `0${monthStr}`;
    }
    const t = await getDailyNoteIdsByMonth(yearStr, monthStr);
    return createCalendarTable(year, month, t, config);
}
