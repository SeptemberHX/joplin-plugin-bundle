import {Summary} from "./types";
var md = require('markdown-it')();


export default async function panelHtml(summary: Summary) {
    let todoItems = [];
    for (const noteId in summary) {
        for (const todoItem of summary[noteId]) {
            todoItems.push(todoItem);
        }
    }

    // order all tasks by date and message
    todoItems = todoItems.sort((a, b) => {
        if (a.date && !b.date) {
            return -1;
        } else if (!a.date && b.date) {
            return 1;
        } else if (a.date && b.date) {
            return a.date.localeCompare(b.date);
        } else {
            return a.msg.localeCompare(b.msg);
        }
    });

    let result = `<div class="inline-todo-div">`;
    result += `<ul class="list-group">`;

    for (const todoItem of todoItems) {
        result += `
            <li class="list-group-item">
                <input class="form-check-input me-1" type="checkbox" value="" id="${todoItem.note}-${todoItem.index}" onchange="todoItemChanged(this.id, this.checked)">
                <p class="form-check-label" for="${todoItem.note}-${todoItem.index}" onclick="todoItemClicked('${todoItem.note}-${todoItem.index}')">${md.renderInline(todoItem.msg)}</p>
        `;

        if (todoItem.date) {
            result += `<span class="badge rounded-pill bg-primary">${todoItem.date}</span>`
        }

        if (todoItem.tags) {
            for (const tag of todoItem.tags){
                result += `<span class="badge rounded-pill bg-success">${tag}</span>`;
            }
        }

        result += `</li>`;
    }

    result += `</ul>`;
    result += `</div>`;
    return result;
}
