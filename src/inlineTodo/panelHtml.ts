import {Summary} from "./types";


export default async function panelHtml(summary: Summary) {
    const noteIdMap = {};
    let todoItems = [];
    // calculate unique id for each task
    for (const noteId in summary) {
        let count = 0;
        for (const todoItem of summary[noteId]) {
            todoItems.push(todoItem);
            noteIdMap[`${noteId}-${count}`] = todoItem;
            count += 1;
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
            <a class="list-group-item list-group-item-action">
                <input class="form-check-input me-1" type="checkbox" value="" id="${noteIdMap[todoItem]}" onchange="todoItemChanged(this.id, this.checked)">
                <span class="form-check-label" for="${noteIdMap[todoItem]}" onclick="todoItemClicked('${noteIdMap[todoItem]}')">${todoItem.msg}</span>
        `;

        if (todoItem.date) {
            result += `<span class="badge rounded-pill bg-primary">${todoItem.date}</span>`
        }

        if (todoItem.tags) {
            for (const tag of todoItem.tags){
                result += `<span class="badge rounded-pill bg-success">${tag}</span>`;
            }
        }

        result += `</a>`;
    }

    result += `</ul>`;
    result += `</div>`;
    return result;
}
