import relatedEngine, {NoteElement, RelationshipType} from "./engine";

export function panelHtml(relatedEls: NoteElement[]) {
    let result = [];
    result.push(`<div class="related-notes-div">`);
    result.push('<ul class="list-group">');

    for (const related of relatedEls) {
        result.push('<li class="list-group-item">');
        result.push(`<div class="related-element">`);
        result.push(`<div class="related-element-title">`);
        result.push(`<span class="related-element-title" onclick="onRelatedTitleClicked('${related.id}')">${related.title}</span>`);
        result.push(`<span class="related-element-type">${renderRelationshipType(related.id)}</span>`)
        result.push(`</div>`);
        result.push(`<div class="related-element-body">${related.body.replace('\n', '<br>')}</div>`);
        result.push(`<div class="related-element-info">`);
        result.push(`<span class="related-element-parent badge text-bg-primary">${related.parentTitle}</span>`);
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
                return `<i class="fas fa-arrows-h"></i>`;
            default:
                break;
        }
    }
    return `<i class="fas fa-question"></i>`;
}
