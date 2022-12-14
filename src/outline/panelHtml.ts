import {settingValue} from "./settings";
var md = require('markdown-it')()
            .use(require('markdown-it-mark'));

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

export default async function panelHtml(headers: any[], currentHead) {
    // Settings
    const showNumber = await settingValue('showNumber');
    const headerDepth = await settingValue('headerDepth');
    const numberStyle = await settingValue('numberStyle');
    const disableLinewrap = await settingValue('disableLinewrap');

    let linewrapStyle = '';
    if (disableLinewrap) {
        linewrapStyle += `
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;`;
    }

    const slugs: any = {};
    const itemHtml = [];
    const headerCount: number[] = [0, 0, 0, 0, 0, 0];

    let headerN = 0;
    for (const header of headers) {
        // header depth
        /* eslint-disable no-continue */
        if (header.level > headerDepth) {
            continue;
        }

        const isCurrentHeader = currentHead ? (header.text === currentHead.text && header.lineno === currentHead.lineno) : headerN === 0;

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
      <a class="toc-item-link ${isCurrentHeader ? 'current-header' : ''}" href="javascript:;"
      data-slug="${escapeHtml(slug)}" data-lineno="${header.lineno}"
      onclick="tocItemLinkClicked(this.dataset)"
      oncontextmenu="copyInnerLink(this.dataset, this.innerText)"
      style="display: block; padding-left:${(header.level) * 15}px; ${linewrapStyle}">`);

        const prefix = await getHeaderPrefix(header.level);
        if (prefix && prefix.length > 0) {
            itemHtml.push(`<span>${prefix}</span>`);
        }

        itemHtml.push(`
        <i style="${numberStyle}">${numberPrefix}</i>
        <span>${md.renderInline(header.text)}</span>
      </a>`);

        headerN += 1;
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
