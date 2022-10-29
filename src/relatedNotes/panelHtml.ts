import relatedEngine, {NoteElement, RelationshipType} from "./engine";
import {SidebarStatus} from "./types";
import {htmlConvert} from "../utils/stringUtils";
import RelatedNotes from "./index";
import {generatePaperInfoPage} from "../readcube/panelHtml";

var md = require('markdown-it')()
    .use(require('markdown-it-mark'));

export function panelHtml(relatedEls: NoteElement[], status: SidebarStatus) {
    let result = [];
    result.push(`<div class="related-notes-div">`);
    result.push(`<div class="related-notes-option">`);
    result.push(`<div class="related-notes-option-filter">
                    <input class="form-check-input" type="checkbox" onchange="onFilterChanged()" id="left-check" name="mention" value="something" ${status.mentionFilter ? 'checked' : ''}>
                    <label class="form-check-label"><i class="fas fa-arrow-left"></i></label>
                    
                    <input class="form-check-input" type="checkbox" onchange="onFilterChanged()" id="right-check" name="mentioned" value="something" ${status.mentionedFilter ? 'checked' : ''}>
                    <label class="form-check-label"><i class="fas fa-arrow-right"></i></label>
                    
                    <input class="form-check-input" type="checkbox" onchange="onFilterChanged()" id="bidirection-check" name="bidirection" value="something" ${status.bidirectionFilter ? 'checked' : ''}>
                    <label class="form-check-label"><i class="fas fa-arrows-alt-h"></i></label>
                 </div>
                 <div class="related-notes-option-sorter">
                    <select id="related-notes-sorter-selector" onchange="onSorterChanged()" class="form-select form-select-sm" aria-label="Sorter Selector">;
                        <option value="Default" ${status.sortFilter === 'Default' ? 'selected' : ''}>Default</option>
                        <option value="Alphabet" ${status.sortFilter === 'Alphabet' ? 'selected' : ''}>Alphabet</option>
                    </select>
                 </div>
    `);
    result.push(`</div>`);

    const sortedRelatedEls = [...relatedEls];
    if (status.sortFilter === 'Alphabet') {
        sortedRelatedEls.sort((a, b) => {
            if (a.title > b.title) {
                return 1;
            } else if (a.title < b.title) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    let currTabIndex = 1;
    result.push(`<ul class="nav nav-pills mb-1 justify-content-center" id="pills-related-notes-tab" role="tablist">`);
    result.push(`
      <li class="nav-item" role="presentation">
        <button class="position-relative nav-link ${currTabIndex === 1 ? 'active' : ''}" onclick="paperTabClicked(1)" id="pills-related-0-tab" data-bs-toggle="pill" data-bs-target="#pills-related-0" type="button" role="tab" aria-controls="pills-related-0" aria-selected="true">
          <i class="fas fa-hand-point-left"></i>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="position-relative nav-link ${currTabIndex === 2 ? 'active' : ''}" onclick="paperTabClicked(2)" id="pills-related-1-tab" data-bs-toggle="pill" data-bs-target="#pills-related-1" type="button" role="tab" aria-controls="pills-related-1" aria-selected="true">
          <i class="fas fa-arrow-left"></i>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="position-relative nav-link ${currTabIndex === 3 ? 'active' : ''}" onclick="paperTabClicked(3)" id="pills-related-2-tab" data-bs-toggle="pill" data-bs-target="#pills-related-2" type="button" role="tab" aria-controls="pills-related-2" aria-selected="true">
          <i class="fas fa-hand-point-right"></i>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="position-relative nav-link ${currTabIndex === 4 ? 'active' : ''}" onclick="paperTabClicked(4)" id="pills-related-3-tab" data-bs-toggle="pill" data-bs-target="#pills-related-3" type="button" role="tab" aria-controls="pills-related-3" aria-selected="true">
          <i class="fas fa-arrow-right"></i>
        </button>
      </li>
    `);
    result.push('</ul>');

    result.push(`<div class="tab-content" id="pills-relatedNoteTabContent">`);
    result.push(`<div class="tab-pane fade show ${currTabIndex === 1 ? 'active' : ''}" id="pills-related-0" role="tabpanel" aria-labelledby="pills-related-0-tab" tabindex="0">`);
    result.push(renderItemAccordions('relatedNoteList0', sortedRelatedEls, 0));
    result.push('</div>');
    result.push(`<div class="tab-pane fade show ${currTabIndex === 2 ? 'active' : ''}" id="pills-related-1" role="tabpanel" aria-labelledby="pills-related-1-tab" tabindex="0">`);
    result.push(renderItemAccordions('relatedNoteList1', sortedRelatedEls, 1));
    result.push('</div>');
    result.push(`<div class="tab-pane fade show ${currTabIndex === 3 ? 'active' : ''}" id="pills-related-2" role="tabpanel" aria-labelledby="pills-related-2-tab" tabindex="0">`);
    result.push(renderItemAccordions('relatedNoteList2', sortedRelatedEls, 2));
    result.push('</div>');
    result.push(`<div class="tab-pane fade show ${currTabIndex === 4 ? 'active' : ''}" id="pills-related-3" role="tabpanel" aria-labelledby="pills-related-3-tab" tabindex="0">`);
    result.push(renderItemAccordions('relatedNoteList3', sortedRelatedEls, 3));
    result.push('</div>');
    result.push('</div>');
    result.push('</div>');

    result.push(`</div>`);
    return result.join("");
}

/*
 * type:
 *   0: current note id appears in other notes
 *   1: current note title appears in other notes
 *   2: other note id appears in current note
 *   3: other note title appears in current note
 */
function renderItemAccordions(accordionId: string, relatedEls: NoteElement[], type: number) {
    const result = [`<div class="accordion relatedNoteList" id="${accordionId}">`];
    let index = 0;
    let hasElements = false;
    for (const relatedEl of relatedEls) {
        const ship = relatedEngine.getRelationShip(relatedEl.id);
        let contexts = [];
        switch (type) {
            case 0:
                contexts = ship.mentionIdContexts;
                break;
            case 1:
                contexts = ship.mentionTitleContexts;
                break;
            case 2:
                contexts = ship.mentionedIdContexts;
                break;
            case 3:
                contexts = ship.mentionedTitleContexts;
                break;
            default:
                break;
        }

        if (contexts.length === 0) {
            continue;
        }
        const h2Id = `${accordionId}-${index}`;
        const collapseName = `${accordionId}-${index}-collapse`;

        result.push(`<div class="accordion-item">`);
        hasElements = true;
        result.push(`
            <h2 class="accordion-header" id="${h2Id}">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseName}" aria-expanded="true" aria-controls="${collapseName}">
                <span class="badge rounded-pill text-bg-secondary">${contexts.length}</span>
                ${relatedEl.title}
              </button>
            </h2>
            <div id="${collapseName}" class="accordion-collapse collapse show" aria-labelledby="${collapseName}">
              <div class="accordion-body related-element-contexts">
        `);


        if (contexts.length > 0) {
            result.push('<ul class="list-group">');
            for (const context of contexts) {
                result.push('<li class="list-group-item">');
                result.push(`<div class="related-item-context">`);
                result.push(context[1]);
                result.push(`</div>`);
                result.push('</li>');
            }
            result.push('</ul>');
        }

        result.push(`
              </div>
            </div>
        `);
        result.push(`</div>`);

        index += 1;
    }
    result.push(`</div>`);

    if (hasElements) {
        return result.join('');
    } else {
        return '';
    }
}

function renderRelationshipType(relatedId) {
    const ship = relatedEngine.getRelationShip(relatedId);
    if (ship) {
        switch (ship.type) {
            case RelationshipType.MENTION:
                return `<i class="fas fa-arrow-left"></i>`;
            case RelationshipType.MENTIONED:
                return `<i class="fas fa-arrow-right"></i>`;
            case RelationshipType.BIDIRECTION:
                return `<i class="fas fa-arrows-alt-h"></i>`;
            default:
                break;
        }
    }
    return `<i class="fas fa-question"></i>`;
}
