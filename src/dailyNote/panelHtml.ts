import * as moment from "moment";
import {getDailyNoteIdsByMonth} from "./utils";
import {DailyNoteConfig} from "./settings";

function createCell(monthClass: string, hasNote: boolean, isToday: boolean, date, finishedTaskCount?: number, config?: DailyNoteConfig) {
    return `<td class="${monthClass}" onclick="calendarCellClicked('${date.format('YYYY-MM-DD')}')">
        <div class="day ${hasNote ? 'hasNote' : 'noNote'} ${isToday ? 'curr-day' : ''} ${finishedTaskCount && finishedTaskCount >= 10 ? 'level-10' : `level-${finishedTaskCount}`} "
             ${finishedTaskCount && config.enableHeatmap ? `style="background-color: rgba(${config.heatmapColor}, 0.${finishedTaskCount})"`: ''}>
            <div class="day-number">
                ${date.date()}
            </div>
            <div class="dot-container">
                <svg class="dot filled svelte-1widvzq" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg"><circle cx="3" cy="3" r="2"></circle></svg>
            </div>
        </div>
    </td>`;
}

function createCalendarTable(year, month, noteDaysInfo, config: DailyNoteConfig) {
    const currMonth = moment({year: year, month: month});
    const lastMonth = moment({year: year, month: month}).add(-1, 'day');
    const nextMonth = moment({year: year, month: month}).add(1, 'month');

    let table = `
        <div class="month-container btn-group" role="group">
            <button type="button" class="btn button-previous btn-light" onclick="this.blur(); showCalendarFor(${lastMonth.year()}, ${lastMonth.month()});"><</button>
            <button type="button" class="btn button-current btn-light btn-lg" onclick="this.blur(); showCalendarFor(${moment().year()}, ${moment().month()});">${currMonth.format('YYYY-MM')}</button>
            <button type="button" class="btn button-next btn-light" onclick="this.blur(); showCalendarFor(${nextMonth.year()}, ${nextMonth.month()});">></button>
        </div>
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

    while (lastMonth.weekday() > 0 && lastMonth.weekday() <= 5) {
        lastMonth.add(-1, 'day');
    }
    if (lastMonth.weekday() === 0) {
        table += `
                <tr>`;
        while (lastMonth < currMonth) {
            table += createCell('prev-month', false, false, lastMonth);
            lastMonth.add(1, 'day');
        }
        while (currMonth.weekday() > 0 && currMonth.weekday() <= 6) {
            const hasNote = currMonth.format('DD') in noteDaysInfo;
            table += createCell('curr-month', hasNote,
                currMonth.date() === moment().date() && currMonth.year() === moment().year() && currMonth.month() === moment().month(),
                currMonth, hasNote ? noteDaysInfo[currMonth.format('DD')].finishedTaskCount : null, config);
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
                table += createCell('curr-month', hasNote,
                    currMonth.date() === moment().date() && currMonth.year() === moment().year() && currMonth.month() === moment().month(),
                    currMonth, hasNote ? noteDaysInfo[currMonth.format('DD')].finishedTaskCount : null, config);
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
