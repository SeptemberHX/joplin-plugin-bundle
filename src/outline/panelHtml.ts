import {settingValue} from "./settings";
var md = require('markdown-it')();

const uslug = require('uslug');

// From https://stackoverflow.com/a/6234804/561309
function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function getHeaderPrefix(level: number) {
    /* eslint-disable no-return-await */
    return await settingValue(`h${level}Prefix`);
}

export default async function panelHtml(headers: any[]) {
    // Settings
    const showNumber = await settingValue('showNumber');
    const headerDepth = await settingValue('headerDepth');
    const numberStyle = await settingValue('numberStyle');

    const slugs: any = {};
    const itemHtml = [];
    const headerCount: number[] = [0, 0, 0, 0, 0, 0];

    for (const header of headers) {
        // header depth
        /* eslint-disable no-continue */
        if (header.level > headerDepth) {
            continue;
        }

        // get slug
        const s = uslug(header.text);
        const num = slugs[s] ? slugs[s] : 1;
        const output = [s];
        if (num > 1) output.push(num);
        slugs[s] = num + 1;
        const slug = output.join('-');

        headerCount[header.level - 1] += 1;
        for (let i = header.level; i < 6; i += 1) {
            headerCount[i] = 0;
        }

        let numberPrefix = '';
        if (showNumber) {
            for (let i = 0; i < header.level; i += 1) {
                numberPrefix += headerCount[i];
                if (i !== header.level - 1) {
                    numberPrefix += '.';
                }
            }
        }

        /* eslint-disable no-await-in-loop */
        itemHtml.push(`
      <a id="toc-item-link" class="toc-item-link" href="javascript:;"
      data-slug="${escapeHtml(slug)}" data-lineno="${header.lineno}"
      onclick="tocItemLinkClicked(this.dataset)"
      oncontextmenu="copyInnerLink(this.dataset, this.innerText)"
      style="display: block; padding-left:${(header.level - 1) * 15}px;">
        <span>${await getHeaderPrefix(header.level)}</span>
        <i style="${numberStyle}">${numberPrefix}</i>
        <span>${md.renderInline(header.text)}</span>
      </a>`);
    }

    if (itemHtml.length === 0) {
        itemHtml.push(`
            <div class="no-toc-warn">
                <i class="fas fa-scroll no-toc-warn-icon"></i>
                <p class="no-toc-warn-text">No table of contents</p>
            </div>
        `);
    }

    return `
    <div class="outline-content">
      <div class="container">
        ${itemHtml.join('\n')}
      </div>
    </div>`;
}
