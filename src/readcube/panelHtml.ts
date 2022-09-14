import {PaperItem} from "./lib/papers/papersLib";
var md = require('markdown-it')()
    .use(require('markdown-it-mark'));


export function panelHtml(currItem: PaperItem, currTabIndex: number) {
    let result = [];
    result.push(`<div class="readcube-paper-div">`);
    result.push(`<ul class="nav nav-pills mb-1 justify-content-center" id="pills-paper-tab" role="tablist">`);
    result.push(`
      <li class="nav-item" role="presentation">
        <button class="position-relative nav-link ${currTabIndex === 1 ? 'active' : ''}" onclick="paperTabClicked(1)" id="pills-paper-info-tab" data-bs-toggle="pill" data-bs-target="#pills-paper-info" type="button" role="tab" aria-controls="pills-paper-info" aria-selected="true">
          <i class="fas fa-info-circle"></i>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="position-relative nav-link ${currTabIndex === 2 ? 'active' : ''}" onclick="paperTabClicked(2)" id="pills-paper-anno-tab" data-bs-toggle="pill" data-bs-target="#pills-paper-anno" type="button" role="tab" aria-controls="pills-paper-anno" aria-selected="true">
          <i class="fas fa-marker"></i>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="position-relative nav-link ${currTabIndex === 3 ? 'active' : ''}" onclick="paperTabClicked(3)" id="pills-paper-list-tab" data-bs-toggle="pill" data-bs-target="#pills-paper-list" type="button" role="tab" aria-controls="pills-paper-list" aria-selected="true">
          <i class="fas fa-book"></i>
        </button>
      </li>
    `)
    result.push('</ul>')

    result.push(`<div class="tab-content" id="pills-tabContent">`);
    result.push(`<div class="tab-pane fade show ${currTabIndex === 1 ? 'active' : ''}" id="pills-paper-info" role="tabpanel" aria-labelledby="pills-paper-info-tab" tabindex="0"><ul class="list-group">`);
    result.push(generatePaperInfoPage(currItem));
    result.push('</div>');
    result.push(`<div class="tab-pane fade show ${currTabIndex === 2 ? 'active' : ''}" id="pills-paper-anno" role="tabpanel" aria-labelledby="pills-paper-anno-tab" tabindex="0"><ul class="list-group">`);
    result.push('</div>');
    result.push(`<div class="tab-pane fade show ${currTabIndex === 3 ? 'active' : ''}" id="pills-paper-list" role="tabpanel" aria-labelledby="pills-paper-list-tab" tabindex="0"><ul class="list-group">`);
    result.push('</div>');

    result.push('</div>');
    result.push('</div>');
    return result.join('');
}


export function generatePaperInfoPage(item: PaperItem) {
    if (item) {
        let stars;
        switch (item.rating) {
            case 1:
                stars = '★☆☆☆☆';
                break;
            case 2:
                stars = '★★☆☆☆';
                break;
            case 3:
                stars = '★★★☆☆';
                break;
            case 4:
                stars = '★★★★☆';
                break;
            case 5:
                stars = '★★★★★';
                break;
            default:
                break;
        }
        let result = ['<div class="paper-info">'];
        if (item.journal) {
            result.push(`<div class="journal">${item.journal} ${item.year ? item.year : ''}</div>`);
        }
        if (item.title) {
            result.push(`<div class="title" lang="en">${item.title}</div>`);
        }
        if (item.authors && item.authors.length > 0) {
            result.push(`<div class="authors">`);
            for (const author of item.authors) {
                result.push(`<span class="badge text-bg-light">${author}</span>`);
            }
            result.push('</div>');
        }

        result.push('<div class="tag-rate">');
        result.push('<div class="tags">');
        if (item.tags && item.tags.length > 0) {
            for (const tag of item.tags) {
                result.push(`<span class="badge rounded-pill text-bg-info">${tag}</span>`);
            }
        }
        result.push('</div>');

        if (stars) {
            result.push(`<div class="rate">${stars}</div>`);
        }
        result.push('</div>');

        if (item.abstract) {
            result.push(`<div class="abstract" lang="en">${item.abstract}</div>`);
        }

        if (item.notes) {
            result.push(`<div class="notes">
                <div class="user-note-label">User Note</div>
                ${md.renderInline(item.notes)}
            </div>`);
        }

        return result.join('');
    } else {
        return `<div class="non-paper-note">
            <i class="fas fa-info-circle non-paper-icon"></i>
            <div class="non-paper-text">No Paper related to current note</div>
        </div>`
    }
}
