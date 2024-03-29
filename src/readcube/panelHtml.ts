import {colorMap} from "./utils/paperCardGenerator";
import {AnnotationItem, PaperFigure, PaperItem, PaperMetadata, PaperReference} from "./lib/base/paperType";
import paperSvc from "./lib/PaperSvcFactory";
var md = require('markdown-it')()
    .use(require('markdown-it-mark'));


export function panelHtml(currItem: PaperItem, currAnnos: AnnotationItem[], paperList: PaperItem[], metadata: PaperMetadata, currNotes: string[], currTabIndex: number, annoSearchStr: string, refSearchStr: string) {
    let result = [];
    result.push(`<div class="readcube-paper-div">`);
    if (paperList.length > 1) {
        result.push(`<div class="paper-selector">`);
        result.push(`<select id="paper-selector" class="form-select form-select-sm" onchange="onPaperSelectorChanged()" aria-label="Paper Selector">`);
        for (const paper of paperList) {
            result.push(`<option value="${paper.id}" ${paper.id === currItem.id ? 'selected' : ''}>${paper.title}</option>`);
        }
        result.push(`</select></div>`);
    }
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
    `);
    if (metadata) {
        result.push(`<li class="nav-item" role="presentation">
            <button class="position-relative nav-link ${currTabIndex === 3 ? 'active' : ''}" onclick="paperTabClicked(3)" id="pills-paper-refs-tab" data-bs-toggle="pill" data-bs-target="#pills-paper-refs" type="button" role="tab" aria-controls="pills-paper-refs" aria-selected="true">
              <i class="fas fa-anchor"></i>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="position-relative nav-link ${currTabIndex === 4 ? 'active' : ''}" onclick="paperTabClicked(4)" id="pills-paper-figure-tab" data-bs-toggle="pill" data-bs-target="#pills-paper-figures" type="button" role="tab" aria-controls="pills-paper-figures" aria-selected="true">
              <i class="fas fa-images"></i>
            </button>
          </li>
        `);
    }
    result.push('</ul>')

    result.push(`<div class="tab-content" id="pills-tabContent">`);
    result.push(`<div class="tab-pane fade show ${currTabIndex === 1 ? 'active' : ''}" id="pills-paper-info" role="tabpanel" aria-labelledby="pills-paper-info-tab" tabindex="0"><ul class="list-group paper-list">`);
    result.push(generatePaperInfoPage(currItem, currNotes));
    result.push('</ul></div>');
    result.push(`<div class="tab-pane fade show ${currTabIndex === 2 ? 'active' : ''}" id="pills-paper-anno" role="tabpanel" aria-labelledby="pills-paper-anno-tab" tabindex="0">`);
    result.push(generateAnnoPage(currAnnos, annoSearchStr));
    result.push('</div>');
    if (metadata) {
        result.push(`<div class="tab-pane fade show ${currTabIndex === 3 ? 'active' : ''}" id="pills-paper-refs" role="tabpanel" aria-labelledby="pills-paper-refs-tab" tabindex="0">`);
        result.push(generateRefsPage(metadata.references, refSearchStr));
        result.push('</div>');
        result.push(`<div class="tab-pane fade show ${currTabIndex === 4 ? 'active' : ''}" id="pills-paper-figures" role="tabpanel" aria-labelledby="pills-paper-figures-tab" tabindex="0">`);
        result.push(generateFiguresPage(metadata.figures));
        result.push('</div>');
    }
    result.push('</div>');
    result.push('</div>');
    return result.join('');
}


function generateFiguresPage(figures: PaperFigure[]) {
    const result = ['<div class="paper-figures-list">'];
    result.push('<ul class="list-group">');

    for (const figure of figures) {
        result.push(`<li class="list-group-item">`);
        result.push('<figure class="paper-figure">');
        result.push(`<img src="${figure.url}" alt="${figure.caption}" onclick="onPaperFigureClicked()" loading="lazy">`);
        result.push(`<figcaption>${figure.caption}</figcaption>`);
        result.push('</figure>');
        result.push('</li>');
    }

    result.push('</ul>');
    result.push('</div>');
    return result.join('');
}


function generateRefsPage(refs: PaperReference[], searchStr: string) {
    const result = ['<div class="paper-refs-list">'];
    result.push(`<div class="input-group input-group-sm mb-2 search-input">
          <span class="input-group-text" id="ref-search-input"><i class="fas fa-search"></i></span>
          <input class="form-control" type="text" id="floatingPaperRefSearchInput" value="${searchStr}" onkeydown="onRefSearchPressed()">
        </div>`
    );
    result.push('<ul class="list-group">');

    for (const refItem of refs) {
        if (!(refItem.title.includes(searchStr) || refItem.authors.includes(searchStr) || refItem.ordinal.toString() === searchStr || refItem.journal.includes(searchStr))) {
            continue;
        }

        result.push('<li class="list-group-item" onmouseenter="refItemMouseOverAndOut(true)" onmouseleave="refItemMouseOverAndOut(false)">');
        result.push('<div class="ref-info-header">');
        result.push(`<span class="ref-info-ordinal badge text-bg-light">${refItem.ordinal}</span>`);
        result.push(`<span class="ref-info-buttons">
            <i class="fas fa-copy"></i>
            <i class="fas fa-quote-right"></i>
        </span>`);
        result.push(`<span class="ref-info-year badge text-bg-light">${refItem.year}</span>`);
        result.push(`</div>`);

        if (refItem.title.startsWith('<') && refItem.title.endsWith('>')) {
            result.push(`<span class="ref-info-title">${refItem.title.substr(1, refItem.title.length - 2)}</span>`);
        } else {
            result.push(`<span class="ref-info-title">${refItem.title}</span>`);
        }

        if (refItem.authors.length > 0) {
            result.push(`<span class="ref-info-authors">${refItem.authors.join(', ')}</span>`);
        }

        if (refItem.journal.length > 0) {
            result.push(`<span class="ref-info-journal">${refItem.journal}</span>`);
        }

        result.push('</li>');
    }
    result.push('</ul>');
    result.push('</div>');
    return result.join('');
}


function generatePaperListPage(paperList: PaperItem[]) {
    const result = ['<div class="paper-list">'];
    result.push('<ul class="list-group">');

    for (const paperItem of paperList) {
        result.push('<li class="list-group-item" onmouseenter="paperItemMouseOverAndOut(true)" onmouseleave="paperItemMouseOverAndOut(false)">');
        result.push('<div class="paper-info-header">');
        result.push(`<span class="paper-info-journal-year">${paperItem.journal ? paperItem.journal + ' ' + paperItem.year : ''}</span>`);
        result.push(`<span class="paper-info-buttons">
            <i class="fas fa-copy"></i>
            <i class="fas fa-quote-right"></i>
        </span>`);
        result.push('</div>');
        result.push(`<span class="paper-info-title">${paperItem.title}</span>`);
        result.push('<div class="paper-info-author-tag">');
        result.push(`<span class="paper-info-first-author badge text-bg-light">${paperItem.authors.length > 0 ? paperItem.authors[0] : ''}</span>`);
        result.push(`<div class="paper-info-tags">`);
        for (const tag of paperItem.tags) {
            result.push(`<span class="badge rounded-pill text-bg-info">${tag}</span>`);
        }
        result.push('</div>');
        result.push(`</div>`);
        result.push('</li>');
    }

    result.push('</ul>');
    result.push('</div>');
    return result.join('');
}


function generateAnnoPage(annos: AnnotationItem[], annoSearchStr: string) {
    let result = ['<div class="paper-annos">'];
    result.push(`<div class="input-group input-group-sm mb-2 search-input">
          <span class="input-group-text" id="basic-addon1"><i class="fas fa-search"></i></span>
          <input class="form-control" type="text" id="floatingPaperAnnoSearchInput" value="${annoSearchStr}" onkeydown="onSearchPressed()">
        </div>`
    );
    result.push('<ul class="list-group">');

    for (const annotation of annos) {
        if (annoSearchStr && annoSearchStr.length > 0) {
            if (!(annotation.text && annotation.text.includes(annoSearchStr) || annotation.note && annotation.note.includes(annoSearchStr))) {
                continue;
            }
        }

        result.push('<li class="list-group-item" onmouseenter="annotationMouseOverAndOut(true)" onmouseleave="annotationMouseOverAndOut(false)">');
        result.push('<div class="anno-info">');
        result.push(`<span class="anno-type">`);
        const colorName = annotation.color_id > 0 ? colorMap[annotation.color_id] : annotation.color;
        switch (annotation.type) {
            case 'underline':
                result.push(`<i class="fas fa-underline underline" style="color: ${colorName}"></i>`);
                break;
            case 'highlight':
                result.push(`<i class="fas fa-font highlight" style="background: ${colorName}; color: white;"></i>`);
                break;
            case 'strikethrough':
                result.push(`<i class="fas fa-strikethrough strikethrough" style="color: ${colorName}"></i>`);
                break;
            case 'note':
                result.push(`<i class="fas fa-sticky-note sticky-note" style="color: ${colorName}"></i>`);
                break;
            case 'image':
                result.push(`<i class="fas fa-image sticky-note" style="color: ${colorName}"></i>`);
                break;
            default:
                break;
        }
        result.push(`</span>`);
        result.push(`<span class="anno-buttons">
            <i class="fas fa-external-link-alt" onclick="annotationExternalLinkClicked('${paperSvc.externalAnnotationLink(annotation)}')"></i>
            <i class="fas fa-link" onclick="annotationCopyLinkClicked('${annotation.id}')"></i>
            <i class="fas fa-copy" onclick="annotationCopyClicked('${annotation.id}')"></i>
            <i class="fas fa-quote-right" onclick="annotationCiteClicked('${annotation.id}')"></i>
        </span>`);
        if (annotation.page) {
            result.push(`<span class="anno-page">Page: ${annotation.page}</span>`)
        }
        result.push('</div>');

        result.push(`<div class="anno-part">`);
        if (annotation.text) {
            result.push(`<span class="anno-text" lang="en" style="border-left: 3px solid ${colorName};">
                ${annotation.text}
            </span>`)
        }
        result.push(`</div>`);

        if (annotation.note) {
            result.push(`<div class="anno-note">${md.render(annotation.note)}</div>`)
        }
        result.push('</li>');
    }

    result.push('</ul>');
    result.push('</div>');
    return result.join('');
}


export function generatePaperInfoPage(item: PaperItem, currNotes: string[]) {
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
            result.push(`<div class="journal ${item.url ? 'with-url' : ''}" onclick="onPaperTitleClicked('${item.url}')">${item.journal} ${item.year && !item.journal.includes(item.year.toString()) ? item.year : ''}</div>`);
        }
        if (item.title) {
            result.push(`<div class="title" lang="en" onclick="onPaperTitleClicked('${paperSvc.externalLink(item)}')">${item.title}</div>`);
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

        if (currNotes.length > 0) {
            result.push(`<div class="notes"><div class="user-note-label">User Note</div>`);
            for (const note of currNotes) {
                if (note.includes('<div')) {
                    result.push(`<div class="note">${note}</div>`);
                } else {
                    result.push(`<div class="note">${md.render(note)}</div>`);
                }
            }
            result.push(`</div>`);
        }

        return result.join('');
    } else {
        return `<div class="non-paper-note">
            <i class="fas fa-info-circle non-paper-icon"></i>
            <div class="non-paper-text">No Paper related to current note</div>
        </div>`
    }
}
