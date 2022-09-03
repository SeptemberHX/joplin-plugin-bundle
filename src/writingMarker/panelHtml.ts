import {TaggedSentence} from "./common";
var md = require('markdown-it')()
    .use(require('markdown-it-mark'));


export async function panelHtml(items: TaggedSentence[]) {
    let results = [];
    results.push(`<div class="tagged-sentences">`)
    results.push(`<ul class="list-group">`);

    for (const item of items) {
        results.push(`<li class="list-group-item">${md.renderInline(item.text)}`);
        results.push(`<div class="tag-badge">`);
        for (const tag of item.tags) {
            results.push(`<span class="badge rounded-pill text-bg-light">${tag}</span>`);
        }
        results.push(`</div>`);
        results.push(`</li>`);
    }

    results.push(`</ul>`);
    results.push(`</div>`);
    return results.join('');
}
