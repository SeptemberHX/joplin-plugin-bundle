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
            console.log(cond);
            if (cond.startsWith('@')) {
                if (cond.length > 1 && (!item.assignee || (item.assignee && item.assignee !== cond.substr(1)))) {
                    passed = false;
                    break;
                } else if (item.assignee && item.assignee.length > 0) {
                    passed = false;
                    break;
                }
            } else if (cond.startsWith('+')) {
                if (cond.length > 1 && (!item.tags || !item.tags.includes(cond.substr(1)))) {
                    passed = false;
                    break;
                } else if (item.tags && item.tags.length > 0) {
                    passed = false;
                    break;
                }
            } else if (cond.startsWith('//')) {
                if (cond.length > 2) {
                    const searchDate = chrono.parseDate(cond.substr(2));
                    if (searchDate && (!item.fromDate || item.fromDate !== searchDate)) {
                        passed = false;
                        break;
                    }
                } else if (item.fromDate) {
                    passed = false;
                    break;
                }
            } else if (cond.startsWith('!')) {
                if (cond.length > 1 && item.priority !== Number(cond.substr(1))) {
                    passed = false;
                    break;
                }
            } else {
                if (!item.msg.includes(cond)) {
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
