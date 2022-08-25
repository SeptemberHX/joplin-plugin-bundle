import {Summary} from "./types";
import * as chrono from 'chrono-node';
var md = require('markdown-it')();


const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}

const emptyTaskCheer = () => {
    return `
            <div class="no-task-cheer">
                <i class="fas fa-glass-cheers no-task-icon"></i>
                <p class="no-task-text">All Done. Good Work!</p>
            </div>
        `;
}

export default async function panelHtml(summary: Summary, activedTab: number) {
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

    const todayItems = [];
    const scheduledItems = [];
    const inboxItems = [];
    for (const todoItem of todoItems) {
        if (todoItem.date && todoItem.date.length > 0) {
            const todoItemDate = chrono.parseDate(todoItem.date);
            if (todoItemDate) {
                if (isToday(todoItemDate)) {
                    todayItems.push(todoItem);
                } else {
                    scheduledItems.push(todoItem);
                }
            } else {
                inboxItems.push(todoItem);
            }
        } else {
            inboxItems.push(todoItem);
        }
    }

    let result = `<div class="inline-todo-div">`;
    result += `
      <ul class="nav nav-pills mb-3 justify-content-center" id="pills-tab" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="position-relative nav-link ${activedTab === 0 ? 'active' : ''}" onclick="todoTypeTabItemClicked(0);" id="pills-today-tab" data-bs-toggle="pill" data-bs-target="#pills-today" type="button" role="tab" aria-controls="pills-today" aria-selected="true">
          <i class="fas fa-star"></i>
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger ${todayItems.length === 0 ? 'invisible' : ''}">
            ${todoItems.length}
            <span class="visually-hidden">unread messages</span>
          </span>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="position-relative nav-link ${activedTab === 1 ? 'active' : ''}" onclick="todoTypeTabItemClicked(1);" id="pills-scheduled-tab" data-bs-toggle="pill" data-bs-target="#pills-scheduled" type="button" role="tab" aria-controls="pills-scheduled" aria-selected="false">
          <i class="fas fa-calendar-day"></i>
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger ${scheduledItems.length === 0 ? 'invisible' : ''}">
            ${scheduledItems.length}
            <span class="visually-hidden">unread messages</span>
          </span>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="position-relative nav-link ${activedTab === 2 ? 'active' : ''}" onclick="todoTypeTabItemClicked(2);" id="pills-inbox-tab" data-bs-toggle="pill" data-bs-target="#pills-inbox" type="button" role="tab" aria-controls="pills-inbox" aria-selected="false">
          <i class="fas fa-inbox"></i>
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger ${inboxItems.length === 0 ? 'invisible' : ''}">
            ${inboxItems.length}
            <span class="visually-hidden">unread messages</span>
          </span>
        </button>
      </li>
    </ul>
    `;

    result += `<div class="tab-content" id="pills-tabContent">`;

    // ====> build today tab div <====
    result += `<div class="tab-pane fade show ${activedTab === 0 ? 'active' : ''}" id="pills-today" role="tabpanel" aria-labelledby="pills-today-tab" tabindex="0"><ul class="list-group">`;
    let scheduledDiv = `<div class="tab-pane fade show ${activedTab === 1 ? 'active' : ''}" id="pills-scheduled" role="tabpanel" aria-labelledby="pills-scheduled-tab" tabindex="0"><ul class="list-group">`;
    let inboxDiv = `<div class="tab-pane fade show ${activedTab === 2 ? 'active' : ''}" id="pills-inbox" role="tabpanel" aria-labelledby="pills-inbox-tab" tabindex="0"><ul class="list-group">`;

    for (const todoItem of todayItems) {
        result += createHTMLForTodoItem(todoItem);
    }

    for (const inboxItem of inboxItems) {
        inboxDiv += createHTMLForTodoItem(inboxItem);
    }

    for (const scheduledItem of scheduledItems) {
        scheduledDiv += createHTMLForTodoItem(scheduledItem);
    }

    if (todayItems.length === 0) {
        result += emptyTaskCheer();
    }

    if (scheduledItems.length === 0) {
        scheduledDiv += emptyTaskCheer();
    }

    if (inboxItems.length === 0) {
        inboxDiv += emptyTaskCheer();
    }

    inboxDiv += `</ul></div>`;
    scheduledDiv += `</ul></div>`;
    result += `</ul></div>`;
    result += scheduledDiv + inboxDiv;
    // ====> today tab div building ends <===


    result += `</div></div>`;
    return result;
}

function createHTMLForTodoItem(todoItem) {
    let result = `
            <li class="list-group-item">
                <input class="form-check-input me-1" type="checkbox" value="" id="${todoItem.note}-${todoItem.index}" onchange="todoItemChanged(this.id, this.checked)">
                <p class="form-check-label" for="${todoItem.note}-${todoItem.index}" onclick="todoItemClicked('${todoItem.note}-${todoItem.index}')">${md.renderInline(todoItem.msg)}</p>
        `;

    result += `<div class="task-badge">`
    if (todoItem.date) {
        result += `<span class="badge rounded-pill bg-primary">${todoItem.date}</span>`
    }

    if (todoItem.tags) {
        for (const tag of todoItem.tags){
            result += `<span class="badge rounded-pill bg-success">${tag}</span>`;
        }
    }
    result += `</div></li>`;
    return result;
}
