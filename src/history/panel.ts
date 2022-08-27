import joplin from 'api';
import {HistItem, parseItem} from './history';
import {HistSettings, freqScope, freqLoc, freqOpen} from './settings';

const DEBUG = false;

async function getHistHtml(maxItems: number, params: HistSettings): Promise<string> {
    let histNote;
    try {
        histNote = await joplin.data.get(['notes', params.histNoteId], {fields: ['body']});
    } catch {
        return 'Please set a history note (from the Tools menu) to start logging';
    }

    let itemMap = new Map<string, string>();

    const lines = histNote.body.split('\n')
    const [itemHtml, itemCounter] = getItemHtml(lines, itemMap, maxItems, params);

    let statsHtml = '';
    if (params.freqLoc != freqLoc.hide) {
        statsHtml = getStatsHtml(itemCounter, itemMap, params);
    }

    let allHtml: string[] = [
        `<div class="accordion" id="historyAccordion">`
    ];
    if (params.freqLoc == freqLoc.top)
        allHtml.push(statsHtml);
    allHtml = allHtml.concat(itemHtml);
    if (params.freqLoc == freqLoc.bottom)
        allHtml.push(statsHtml);

    if (maxItems < lines.length)
        allHtml.push(`<p class="hist-loader"><a class="hist-loader" href="#">Load more items</a><br><br></p>`);

    allHtml.push(`</div>`);

    return allHtml.join('\n')
}

function getItemHtml(lines: string[], itemMap: Map<string, string>, maxItems: number, params: HistSettings): [string[], Map<string, number>] {
    const dateScope = new Set(['today']);
    const activeTrail = new Set() as Set<number>;
    let itemCounter = new Map<string, number>();
    let itemHtml: string[] = [];
    const sectIndex: number[] = [];  // keep a tab on all array indices that contain sections
    const N = Math.min(maxItems, lines.length);

    itemHtml.push(`<div class="accordion-item" id="accordionToday">`)
    itemHtml.push(`
        <h2 class="accordion-header" id="headingFrequent">
          <button class="accordion-button show" onclick="this.blur();" type="button" data-bs-toggle="collapse" data-bs-target="#collapseToday" aria-expanded="true" aria-controls="collapseOne">
            Today
          </button>
        </h2>
    `);
    itemHtml.push(`
        <div id="collapseToday" class="accordion-collapse collapse show" aria-labelledby="headingOne">
          <div class="accordion-body">
    `);

    sectIndex.push(0);

    for (let i = 0; i < N; i++) {
        const [item, error] = parseItem(lines[i]);
        if (error) continue;
        const foldTag = getFoldTag(item, dateScope, sectIndex, i, params);
        const plotTag = getPlotTag(item.trails, activeTrail, params);
        const [backTagStart, backTagStop] = getBackTag(i, params);
        const todoTag = getTodoTag(item, params);

        if (params.freqLoc != freqLoc.hide)
            updateStats(item, itemCounter, itemMap, dateScope, params);

        itemHtml.push(`
            ${foldTag}
            <p class="hist-item">
              ${plotTag}
              ${backTagStart}
              <a class="hist-item" href="#" data-slug="${item.id}" data-line="${i}">
                ${todoTag}${escapeHtml(item.title)}
              </a>
              ${backTagStop}
            </p>
          `);
    }
    itemHtml.push('</div></div>');
    itemHtml.push('</div>');

    // close all sections except the one that contains currentLine
    for (let i = 0; i < sectIndex.length - 1; i++) {
        if (sectIndex[i + 1] > params.currentLine + 1)
            break
        itemHtml[sectIndex[i]] = itemHtml[sectIndex[i]].replace('collapse show', 'collapse collapsed');
        itemHtml[sectIndex[i]] = itemHtml[sectIndex[i]].replace('accordion-button show', 'accordion-button collapsed');
    }

    return [itemHtml, itemCounter];
}

function getFoldTag(item: HistItem, dateScope: Set<string>,
                    sectIndex: number[], currentInd: number, params: HistSettings): string {
    /* whenever we pass a threshold, we need to close the previous folding section
       and start a new one */
    const now = new Date();
    const dayDiff = getDateDay(now) - getDateDay(item.date);
    const state = (currentInd <= params.currentLine) ? 'open' : '';
    if (!dateScope.has('yesterday') && (dayDiff == 1)) {
        dateScope.add('yesterday');
        sectIndex.push(currentInd + 1);
        return `</details><details ${state} class="hist-section"><summary class="hist-section">Yesterday</summary>`;
    }
    if (!dateScope.has('week') &&
        (dayDiff > 1) && (dayDiff <= 6)) {
        dateScope.add('week');
        sectIndex.push(currentInd + 1);
        return `</details><details ${state} class="hist-section"><summary class="hist-section">Last 7 days</summary>`;
    }

    let strMonth = getMonthString(item.date);
    if (strMonth == getMonthString(now))
        strMonth = 'This month';
    if (!dateScope.has(strMonth) && (dayDiff > 6)) {
        dateScope.add(strMonth);
        sectIndex.push(currentInd + 1);
        return `</details><details ${state} class="hist-section"><summary class="hist-section">${strMonth}</summary>`;
    }

    return '';
}

function getPlotTag(trail: number[], activeTrail: Set<number>, params: HistSettings): string {
    const yDot = params.plotSize[1] / 2;  // connector pos
    const rDotMax = 0.5 * params.trailDisplay + 2;
    const xBase = params.plotSize[0] - rDotMax;
    const yControl = yDot;
    let plot = `<svg class="hist-plot" style="width: ${params.plotSize[0]}px; height: ${params.plotSize[1]}px">`;

    for (let i = 1; i <= params.trailDisplay; i++) {
        const color = params.trailColors[(i - 1) % params.trailColors.length];
        const xLevel = xBase * (1 - (i - 1) / (params.trailDisplay));
        const rLevel = rDotMax - (i - 1) / 2;

        if (trail.includes(i)) {
            if (activeTrail.has(i))  // continue trail
                plot += `
            <line x1="${xLevel}" y1="0" x2="${xLevel}" y2="${params.plotSize[1]}"
              style="stroke:${color};" />
          `;
            else {  // start trail
                activeTrail.add(i);
                plot += `
          <path d="M ${xBase} ${yDot} C ${xBase} ${yControl}, ${xLevel} ${yControl}, ${xLevel} ${params.plotSize[1]}"
            stroke="${color}" fill="none" />
          <circle cx="${xBase}" cy="${yDot}" r="${rLevel}"
            stroke="none" fill="${color}" />
          `;
            }
        } else if (activeTrail.has(i)) { // end trail
            activeTrail.delete(i);
            plot += `
          <path d="M ${xLevel} 0 C ${xLevel} ${yControl}, ${xBase} ${yControl}, ${xBase} ${yDot}"
            stroke="${color}" fill="none" />
          <circle cx="${xBase}" cy="${yDot}" r="${rLevel}"
            stroke="none" fill="${color}" />
          `;
        }
    }
    return plot + '</svg>';
}

function getBackTag(lineInd: number, params: HistSettings): [string, string] {
    if ((params.currentLine > 0) && (lineInd == params.currentLine))
        return ['<strong>', '</strong>'];
    return ['', ''];
}

function getTodoTag(item: HistItem, params: HistSettings) {
    if (item.is_todo)
        return '☑︎ ';
    return '';
}

function updateStats(item: HistItem, itemCounter: Map<string, number>,
                     itemMap: Map<string, string>, dateScope: Set<string>, params: HistSettings) {
    const now = new Date();
    const dayDiff = getDateDay(now) - getDateDay(item.date);
    if ((params.freqScope == freqScope.today) && (dayDiff > 0)) {
        return
    }
    if ((params.freqScope == freqScope.week) && (dayDiff > 6)) {
        return
    }
    if ((params.freqScope == freqScope.month) &&
        (getMonthString(item.date) != getMonthString(now))) {
        return
    }
    if ((params.freqScope == freqScope.year) &&
        (getYearString(item.date) != getYearString(now))) {
        return
    }
    if (!itemCounter.has(item.id)) {
        itemCounter.set(item.id, 0);
        itemMap.set(item.id, item.title);
    }
    itemCounter.set(item.id, itemCounter.get(item.id) + 1);
}

/**
 * Generate frequent notes element
 */
function getStatsHtml(itemCounter: Map<string, number>,
                      itemMap: Map<string, string>, params: HistSettings): string {
    const maxR = 0.9 * Math.min(params.panelTextSize, params.plotSize[0]) / 2;  // px, leaving 10% margin
    const minR = 1;
    const itemHtml: string[] = [];
    const noteOrder = new Map([...itemCounter.entries()].sort((a, b) => b[1] - a[1]));
    const maxCount = Math.max(...itemCounter.values());

    let strOpen = 'collapsed';
    if (params.freqOpen == freqOpen.open)
        strOpen = 'show';

    itemHtml.push(`<div class="accordion-item" id="accordionFrequent">`)
    itemHtml.push(`
        <h2 class="accordion-header" id="headingFrequent">
          <button class="accordion-button ${strOpen}" onclick="this.blur();" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFrequent" aria-expanded="true" aria-controls="collapseOne">
            Frequent Notes
          </button>
        </h2>
    `);
    itemHtml.push(`
        <div id="collapseFrequent" class="accordion-collapse collapse ${strOpen}" aria-labelledby="headingOne">
          <div class="accordion-body">
    `)

    let i = 0;
    noteOrder.forEach((count, id) => {
        i += 1;
        if (i > params.freqDisplay)
            return
        const r = Math.max(minR, maxR * count / maxCount);
        itemHtml.push(`
      <p class="hist-item">
      <svg class="hist-plot">
        <circle r="${r}" cx="${0.9 * params.plotSize[0] - maxR}"
            cy="${params.plotSize[1] / 2}"
            stroke="none" fill="${params.trailColors[0]}" />
      </svg>
      <a class="hist-item" href="#" data-slug="${id}">
        ${escapeHtml(`${itemMap.get(id)}`)}
      </a>
      </p>
    `);
    });
    itemHtml.push('</div></div>');
    itemHtml.push(`</div>`)
    return itemHtml.join('\n');
}

function getDateDay(date: Date): number {
    return Math.ceil((date.getTime() - 1000 * 60 * date.getTimezoneOffset()) / 86400000);
}

function getMonthString(date: Date): string {
    return date.toUTCString().split(' ')[2] + ' ' + getYearString(date);
}

function getYearString(date: Date): string {
    return date.toUTCString().split(' ')[3];
}

// From https://stackoverflow.com/a/6234804/561309
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export default async function updateHistView(params: HistSettings, loadAll: boolean) {
    const start = new Date().getTime();

    // First create the HTML for each history item:
    const N = (loadAll) ? Infinity : params.panelMaxItems;
    const itemHtml = await getHistHtml(N, params);

    // Finally, insert all the items in a container and set the webview HTML:
    const htmlResult = `
      <div class="history-container">
        ${itemHtml}
      </div>
  `;
    const finish = new Date().getTime();
    if (DEBUG) console.log('updateHistView: ' + (finish - start) + 'ms');
    return htmlResult;
}
