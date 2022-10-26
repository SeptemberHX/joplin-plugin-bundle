import relatedEngine, {NoteElement, RelationshipType} from "./engine";

var md = require('markdown-it')()
    .use(require('markdown-it-mark'));

export function panelHtml(relatedEls: NoteElement[]) {
    let result = [];
    result.push(`<div class="related-notes-div">`);
    result.push(`<div class="related-notes-option">`);
    result.push(`<div class="related-notes-option-filter">
                    <input class="form-check-input" type="checkbox" id="left-check" name="Left" value="something" checked>
                    <label class="form-check-label"><i class="fas fa-arrow-left"></i></label>
                    
                    <input class="form-check-input" type="checkbox" id="right-check" name="Right" value="something" checked>
                    <label class="form-check-label"><i class="fas fa-arrow-right"></i></label>
                    
                    <input class="form-check-input" type="checkbox" id="bidirection-check" name="Left & Right" value="something" checked>
                    <label class="form-check-label"><i class="fas fa-arrows-alt-h"></i></label>
                 </div>
                 <div class="related-notes-option-sorter">
                    <select id="related-notes-sorter-selector" class="form-select form-select-sm" aria-label="Sorter Selector">;
                        <option value="Score">Score</option>
                        <option value="Alphabet">Alphabet</option>
                        <option value="LineNumber">LineNumber</option>
                    </select>
                 </div>
    `);
    result.push(`</div>`);
    result.push('<ul class="list-group">');

    for (const related of relatedEls) {
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

        result.push(`<div class="related-element-body">${md.render(renderBodyLine.join('\n'))}</div>`);
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
