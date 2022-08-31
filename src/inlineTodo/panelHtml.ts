import {Summary} from "./types";
import * as chrono from 'chrono-node';
import dateFormat  from "dateformat";

var md = require('markdown-it')()
            .use(require('markdown-it-mark'));

const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}

export const allProjectsStr = 'All Projects';
export const allTagsStr = 'All Tags';

// https://stackoverflow.com/a/7763654/5513120
function daysDifference(d0, d1) {
    const diff = new Date(+d1).setHours(12) - new Date(+d0).setHours(12);
    return Math.round(diff / 8.64e7);
}

const emptyTaskCheer = () => {
    return `
            <div class="no-task-cheer">
                <i class="fas fa-glass-cheers no-task-icon"></i>
                <p class="no-task-text">All Done. Good Work!</p>
            </div>
        `;
}

export default async function panelHtml(summary: Summary, activedTab: number, selectedProject, selectedTag) {
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
            const r = a.date.localeCompare(b.date);
            if (r !== 0) {
                return r;
            }  else {
                if (a.priority < b.priority) {
                    return -1;
                } else if (a.priority > b.priority) {
                    return 1;
                } else {
                    return a.msg.localeCompare(b.msg);
                }
            }
        } else {
            if (a.priority < b.priority) {
                return -1;
            } else if (a.priority > b.priority) {
                return 1;
            } else {
                return a.msg.localeCompare(b.msg);
            }
        }
    });

    const todayItems = [];
    const scheduledItems = [];
    const scheduledExpiredItems = [];
    const scheduledIn7DaysItems = [];
    const scheduledOtherItems = [];
    const inboxItems = [];
    for (const todoItem of todoItems) {
        if (todoItem.date && todoItem.date.length > 0) {
            const todoItemDate = chrono.parseDate(todoItem.date);
            if (todoItemDate) {
                if (isToday(todoItemDate)) {
                    todayItems.push(todoItem);
                } else {
                    scheduledItems.push(todoItem);

                    const diffs = daysDifference(new Date(), todoItemDate);
                    if (diffs < 0) {
                        scheduledExpiredItems.push(todoItem);
                    } else if (diffs <= 7) {
                        scheduledIn7DaysItems.push(todoItem);
                    } else {
                        scheduledOtherItems.push(todoItem);
                    }
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
        <button class="position-relative nav-link ${activedTab === 3 ? 'active' : ''}" onclick="todoTypeTabItemClicked(3);" id="pills-today-tab" data-bs-toggle="pill" data-bs-target="#pills-today" type="button" role="tab" aria-controls="pills-today" aria-selected="true">
          <i class="fas fa-star"></i>
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger ${todayItems.length === 0 ? 'invisible' : ''}">
            ${todayItems.length}
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
      <li class="nav-item" role="presentation">
        <button class="position-relative nav-link ${activedTab === 4 ? 'active' : ''}" onclick="todoTypeTabItemClicked(4);" id="pills-filter-tab" data-bs-toggle="pill" data-bs-target="#pills-filter" type="button" role="tab" aria-controls="pills-inbox" aria-selected="false">
          <i class="fas fa-filter"></i>
        </button>
      </li>
    </ul>
    `;

    result += `<div class="tab-content" id="pills-tabContent">`;

    // ====> build today tab div <====
    result += `<div class="tab-pane fade show ${activedTab === 3 ? 'active' : ''}" id="pills-today" role="tabpanel" aria-labelledby="pills-today-tab" tabindex="0"><ul class="list-group">`;
    let scheduledDiv = `<div class="tab-pane fade show ${activedTab === 1 ? 'active' : ''}" id="pills-scheduled" role="tabpanel" aria-labelledby="pills-scheduled-tab" tabindex="0">`;
    let inboxDiv = `<div class="tab-pane fade show ${activedTab === 2 ? 'active' : ''}" id="pills-inbox" role="tabpanel" aria-labelledby="pills-inbox-tab" tabindex="0"><ul class="list-group">`;
    let filterDiv = `<div class="tab-pane fade show ${activedTab === 4 ? 'active' : ''}" id="pills-filter" role="tabpanel" aria-labelledby="pills-filter-tab" tabindex="0">`;

    for (const todoItem of todayItems) {
        result += createHTMLForTodoItem(todoItem);
    }

    for (const inboxItem of inboxItems) {
        inboxDiv += createHTMLForTodoItem(inboxItem);
    }

    function createTaskCollapse(typeStr: string, displayText, items: any[]) {
        let result = `
          <div class="accordion-item" id="accordion${typeStr}">
            <h2 class="accordion-header">
              <button class="accordion-button show" onclick="this.blur();" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${typeStr}" aria-expanded="true" aria-controls="collapseOne">
                ${displayText}
              </button>
            </h2>
            <div id="collapse${typeStr}" class="accordion-collapse collapse show" aria-labelledby="headingOne">
              <div class="accordion-body">
        `;

        result += `<ul class="list-group">`;
        for (const item of items) {
            result += createHTMLForTodoItem(item);
        }
        result += `</ul></div></div></div>`;
        return result;
    }

    if (scheduledItems.length > 0) {
        scheduledDiv += `<div class="accordion" id="scheduledTasksAccordion">`
        if (scheduledExpiredItems.length > 0) {
            scheduledDiv += createTaskCollapse('ExpiredTask', 'Expired', scheduledExpiredItems);
        }

        if (scheduledIn7DaysItems.length > 0) {
            scheduledDiv += createTaskCollapse('In7Days', 'In 7 Days', scheduledIn7DaysItems);
        }

        if (scheduledOtherItems.length > 0) {
            scheduledDiv += createTaskCollapse('Future', 'Future', scheduledOtherItems);
        }

        scheduledDiv += `</div>`
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

    filterDiv += createFilterPanel(todoItems, selectedProject, selectedTag);

    inboxDiv += `</ul></div>`;
    scheduledDiv += `</div>`;
    filterDiv += `</div>`;
    result += `</ul></div>`;
    result += scheduledDiv + inboxDiv + filterDiv;

    result += `</div></div>`;
    return result;
}

function createFilterPanel(items: any[], selectedProject, selectedTag) {
    let result = `<div id="taskSelectorsDiv">`;
    let assigneeSelector = `<select id="assignee-selector" class="form-select" onchange="onFilterProjectChanged()" aria-label="Assignee Selector">`;
    let tagSelector = `<select id="tag-selector" class="form-select" onchange="onFilterTagChanged()" aria-label="Tag Selector">`;

    const existAssignee = new Set<string>();
    const existTag = new Set<string>();
    for (const item of items) {
        if (item.assignee && item.assignee.length > 0) {
            existAssignee.add(item.assignee);
        }

        if (item.tags) {
            for (const tag of item.tags) {
                existTag.add(tag);
            }
        }
    }

    const sortedAssignees = Array.from(existAssignee).sort();
    const sortedTags = Array.from(existTag).sort();

    assigneeSelector += `<option value="${allProjectsStr}">${allProjectsStr}</option>`;
    for (const assignee of sortedAssignees) {
        assigneeSelector += `<option value="${assignee}" ${assignee === selectedProject ? 'selected' : ''}>${assignee}</option>`;
    }
    tagSelector += `<option value="${allTagsStr}">${allTagsStr}</option>`;
    for (const tag of sortedTags) {
        tagSelector += `<option value="${tag}" ${tag === selectedTag ? 'selected' : ''}>${tag}</option>`;
    }

    assigneeSelector += `</select>`;
    tagSelector += `</select>`;

    return result + assigneeSelector + tagSelector + `</div>` + createFilterPanelBody(selectedProject, selectedTag, items);
}

function createFilterPanelBody(project: string, tag: string, items: any[]) {
    let result = '<ul class="list-group">';
    for (const item of items) {
        if (project !== allProjectsStr && item.assignee && item.assignee !== project) {
            continue;
        }

        if (!item.assignee && project !== allProjectsStr) {
            continue;
        }

        if (tag !== allTagsStr && item.tags && !item.tags.includes(tag)) {
            continue;
        }

        if (!item.tags && tag !== allTagsStr) {
            continue;
        }

        result += createHTMLForTodoItem(item);
    }
    result += `</ul>`;
    return result;
}

function createHTMLForTodoItem(todoItem) {
    let result = `
            <li class="list-group-item priority-${todoItem.priority}">
                <input class="form-check-input me-1" type="checkbox" value="" id="${todoItem.note}-${todoItem.index}" onchange="todoItemChanged(this.id, this.checked)">
                <p class="form-check-label" for="${todoItem.note}-${todoItem.index}" onclick="todoItemClicked('${todoItem.note}-${todoItem.index}')">${md.renderInline(todoItem.msg)}</p>
        `;

    result += `<div class="task-badge">`

    if (todoItem.tags) {
        for (const tag of todoItem.tags){
            result += `<span class="badge rounded-pill bg-info">${tag}</span>`;
        }
    }

    if (todoItem.assignee && todoItem.assignee.length > 0) {
        result += `<span class="badge assignee">${todoItem.assignee}</span>`;
    }

    if (todoItem.date) {
        const todoItemDate = chrono.parseDate(todoItem.date);
        let dateString = todoItem.date;
        if (todoItemDate) {
            dateString = dateFormat(todoItemDate, 'mm-dd');
        }
        result += `<span class="badge bg-primary">${dateString}</span>`
    }

    result += `</div></li>`;
    return result;
}
