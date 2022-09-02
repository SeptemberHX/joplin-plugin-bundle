import {TaggedSentence} from "./common";

export async function panelHtml(items: TaggedSentence[]) {
    let results = [];
    results.push(`<ul class="list-group">`);

    for (const item of items) {
        results.push(`<li class="list-group-item">${item.text}`);
        for (const tag of item.tags) {
            results.push(`<span class="badge rounded-pill text-bg-light">${tag}</span>`);
        }
        results.push(`</li>`);
    }

    results.push(`</ul>`)
    return results.join('');
}
