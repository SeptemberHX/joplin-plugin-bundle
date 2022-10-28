import relatedEngine, {NoteElement, RelationshipType} from "./engine";
import {SidebarStatus} from "./types";
import {htmlConvert} from "../utils/stringUtils";

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
    result.push('<ul class="list-group">');

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

    for (const related of sortedRelatedEls) {
        if (relatedEngine.getRelationShip(related.id).type === RelationshipType.MENTION && !status.mentionFilter) {
            continue;
        }

        if (relatedEngine.getRelationShip(related.id).type === RelationshipType.MENTIONED && !status.mentionedFilter) {
            continue;
        }

        if (relatedEngine.getRelationShip(related.id).type === RelationshipType.BIDIRECTION && !status.bidirectionFilter) {
            continue;
        }

        result.push('<li class="list-group-item">');
        result.push(`<div class="related-element">`);
        result.push(`<div class="related-element-title">`);
        result.push(`<span class="related-element-title" onclick="onRelatedTitleClicked('${related.id}', ${relatedEngine.getRelationShip(related.id).line})">${related.title}</span>`);
        result.push(`<span class="related-element-type" onclick="onRelatedArrowClicked('${related.id}', ${relatedEngine.getRelationShip(related.id).lineR})">${renderRelationshipType(related.id)}</span>`)
        result.push(`</div>`);

        let renderBodyLine = [];
        let nonEmptyLineCount = 0;
        for (const line of related.body.split('\n')) {
            if (line.trim().length > 0) {
                nonEmptyLineCount += 1;

                if (nonEmptyLineCount > 5) {
                    break;
                }
            }
            renderBodyLine.push(line);
        }

        result.push(`<div class="related-element-body">${htmlConvert(md.render(renderBodyLine.join('\n')))}</div>`);
        result.push(`<div class="related-element-info">`);
        result.push(`<span class="related-element-parent badge text-bg-primary"><i class="fas fa-folder-open"></i>${related.parentTitle}</span>`);
        result.push(`<span class="related-element-tags">`);
        for (const tag of related.tags) {
            result.push(`<span class="related-element-tag badge rounded-pill text-bg-info">${tag}</span>`);
        }
        result.push(`</span>`);
        result.push(`</div>`);
        result.push(`</div>`);
        result.push(`</li>`);
    }

    result.push(`</ul>`);
    result.push(`</div>`);
    return result.join("");
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
