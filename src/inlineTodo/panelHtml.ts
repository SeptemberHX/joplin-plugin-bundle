import {Summary} from "./types";


export default async function panelHtml(summary: Summary) {
    let result = `<div class="inline-todo-div">`;
    result += `<ul class="list-group">`;

    for (const noteId in summary) {
        let count = 0;
        for (const todoItem of summary[noteId]) {
            result += `
                <a class="list-group-item list-group-item-action">
                    <input class="form-check-input me-1" type="checkbox" value="" id="${noteId}-${count}">
                    <span class="form-check-label" for="${noteId}-${count}" onclick="todoItemClicked('${noteId}-${count}')">${todoItem.msg}</span>
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
            count += 1;
        }
    }

    result += `</ul>`;
    result += `</div>`;
    return result;
}
