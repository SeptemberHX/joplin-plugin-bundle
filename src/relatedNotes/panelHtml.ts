import {RelatedElement} from "./engine";

export function panelHtml(relatedEls: RelatedElement[]) {
    let result = [];
    result.push(`<div class="related-notes-div">`);
    result.push('<ul class="list-group">');

    for (const related of relatedEls) {
        result.push('<li class="list-group-item">');
        result.push(`<div class="related-element">`);
        result.push(`<span class="related-element-title">${related.title}</span>`);
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
