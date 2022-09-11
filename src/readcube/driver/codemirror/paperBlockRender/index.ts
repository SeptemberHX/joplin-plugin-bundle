import {LineHandle} from "codemirror";
import {CMBlockMarkerHelperV2} from "../../../utils/CMBlockMarkerHelperV2";
import {debounce} from "ts-debounce";
import {buildPaperCard} from "../../../utils/paperCardGenerator";
import {findLineWidgetAtLine} from "../../../utils/cm-utils";
import {PAPER_ID_REG} from "../../../utils/reg";

const ENHANCEMENT_PAPER_BLOCK_SPAN_MARKER_CLASS = 'enhancement-paper-block-marker';
const ENHANCEMENT_PAPER_BLOCK_SPAN_MARKER_LINE_CLASS = 'enhancement-paper-block-marker-line';


module.exports = {
    default: function (_context) {
        return {
            plugin: function (CodeMirror) {
                CodeMirror.defineOption("readcubePaperRender", [], async function (cm, val, old) {
                    // Block Katex Math Render
                    const blockPaperHelper = new CMBlockMarkerHelperV2(cm, null, /^\s*```paper\s*$/, /^\s*```\s*$/, (beginMatch, endMatch, content: string, fromLine, toLine) => {
                        let divElement = document.createElement("div");

                        const idMatch = PAPER_ID_REG.exec(content);
                        if (idMatch) {
                            _context.postMessage({type: 'queryPaper', content: idMatch[1]}).then((item) => {
                                divElement.innerHTML = buildPaperCard(item, null);
                                const lineWidget = findLineWidgetAtLine(cm, toLine, ENHANCEMENT_PAPER_BLOCK_SPAN_MARKER_CLASS + '-line-widget');
                                if (lineWidget) {
                                    setTimeout(() => {
                                        lineWidget.changed()
                                    }, 50);
                                }
                            })
                        }

                        return divElement;
                    }, () => {
                        const span = document.createElement('span');
                        span.textContent = '===> Folded Papers Block <===';
                        span.style.cssText = 'color: lightgray; font-size: smaller; font-style: italic;';
                        return span;
                    }, ENHANCEMENT_PAPER_BLOCK_SPAN_MARKER_CLASS, true, false, null, (content, e) => {
                        const match = PAPER_ID_REG.exec(content);
                        if (match) {
                            _context.postMessage({
                                type: 'openPaper',
                                content: match[1]
                            });
                        }
                    });

                    cm.on('renderLine', (editor, line: LineHandle, element: Element) => {
                        if (element.getElementsByClassName(ENHANCEMENT_PAPER_BLOCK_SPAN_MARKER_CLASS).length > 0) {
                            element.classList.add(ENHANCEMENT_PAPER_BLOCK_SPAN_MARKER_LINE_CLASS);
                        }
                    })

                    function process() {
                        cm.startOperation();
                        blockPaperHelper.process(true);
                        cm.endOperation();
                    }

                    const debounceProcess = debounce(process, 100);
                    cm.on('change', async function (cm, changeObjs) {
                        if (changeObjs.origin === 'setValue') {
                            process();
                            // this.unfoldAtCursor();
                        } else if (changeObjs.origin === 'undo' || changeObjs.origin === 'redo') {
                            await debounceProcess();
                        }
                    });
                    cm.on('cursorActivity', debounceProcess);
                    cm.on('viewportChange', debounceProcess);
                });
            },
            codeMirrorOptions: {
                'readcubePaperRender': true,
            },
            assets: function () {
                return [
                    { name: 'paperLineWidget.css' }
                ]
            }
        }
    },
}
