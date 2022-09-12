import {Todo} from "./types";
import * as chrono from 'chrono-node';

export function filterItemsBySearchStr(items: Todo[], searchStr: string) {
    const conditions = searchStr.split(' ');
    const results = [];
    for (const item of items) {
        let passed = true;
        for (const cond of conditions) {
            if (cond.length === 0) {
                continue;
            }
            if (cond.startsWith('@')) {
                if (cond.length > 1 && (!item.assignee || (item.assignee && item.assignee !== cond.substr(1)))) {
                    passed = false;
                    break;
                } else if (cond.length === 1 && item.assignee && item.assignee.length > 0) {
                    passed = false;
                    break;
                }
            } else if (cond.startsWith('+')) {
                if (cond.length > 1 && (!item.tags || !item.tags.includes(cond.substr(1)))) {
                    passed = false;
                    break;
                } else if (cond.length === 1 && item.tags && item.tags.length > 0) {
                    passed = false;
                    break;
                }
            } else if (cond.startsWith('//')) {
                if (cond.length > 2) {
                    const searchDate = chrono.parseDate(cond.substr(2));
                    console.log(searchDate, item.fromDate, item.toDate);
                    if (searchDate && (!item.fromDate
                        || (!item.toDate && daysDifference(item.fromDate, searchDate) !== 0)
                        || (item.toDate && (daysDifference(item.fromDate, searchDate) < 0 || daysDifference(item.toDate, searchDate) > 0)))) {
                        passed = false;
                        break;
                    }
                } else if (cond.length === 2 && item.fromDate) {
                    passed = false;
                    break;
                }
            } else if (cond.startsWith('!')) {
                if (cond.length > 1 && item.priority !== Number(cond.substr(1))) {
                    passed = false;
                    break;
                }
            } else {
                if (!item.msg.toLowerCase().includes(cond.toLowerCase())) {
                    passed = false;
                    break;
                }
            }
        }

        if (passed) {
            results.push(item);
        }
    }
    return results;
}

// https://stackoverflow.com/a/7763654/5513120
export function daysDifference(d0, d1) {
    const diff = new Date(+d1).setHours(12) - new Date(+d0).setHours(12);
    return Math.round(diff / 8.64e7);
}

export function isTodayIncluded(fromDate, toDate) {
    return durationComparedToToday(fromDate, toDate) === 0;
}

/**
 * Return 0 if today is included; -1 if today is earlier, otherwise 1 is returned.
 */
export function durationComparedToToday(fromDate, toDate) {
    const today = new Date();
    const fromDiff = daysDifference(fromDate, today);
    const toDiff = daysDifference(today, toDate);

    if (fromDiff >= 0 && toDiff >= 0) {
        return 0;
    } else if (fromDiff < 0) {
        return -1;
    } else {
        return 1;
    }
}
