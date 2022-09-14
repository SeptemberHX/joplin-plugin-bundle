import CommandsBridge from "./commands";
import {debounce} from "ts-debounce";
import wordsCount from 'words-count';
import {MsgType} from "../../common";

module.exports = {
    default: function(_context) {
        return {
            plugin: function (CodeMirror) {
                CodeMirror.defineOption("sidebar_cm_commands", [], async function(cm, val, old) {
                    const commandBridge = new CommandsBridge(cm);
                    CodeMirror.defineExtension('sidebar_cm_scrollToLine', commandBridge.scrollToLine.bind(commandBridge));
                });

                CodeMirror.defineOption("cursorChangeNotification", [], async function(cm, val, old) {
                    const changeDebounce = debounce(async function() {
                        let selectedWordCount = 0;
                        for (const selected of cm.getDoc().getSelections()) {
                            selectedWordCount += wordsCount(selected);
                        }

                        return await _context.postMessage({
                            type: MsgType.CURSOR_CHANGE,
                            totalLineCount: cm.getDoc().lineCount(),
                            currentLineNumber: cm.getDoc().getCursor().line + 1,
                            totalWordCount: wordsCount(cm.getDoc().getValue()),
                            selectedWordCount: selectedWordCount
                        });
                    }, 100);
                    cm.on('cursorActivity', changeDebounce);
                });

                CodeMirror.defineExtension('scrollToLine', function scrollToLine(lineno) {
                    // temporary fix: sometimes the first coordinate is incorrect,
                    // resulting in a difference about +- 10 px,
                    // call the scroll function twice fixes the problem.
                    this.scrollTo(null, this.charCoords({ line: lineno, ch: 0 }, 'local').top);
                    this.scrollTo(null, this.charCoords({ line: lineno, ch: 0 }, 'local').top);
                });

                CodeMirror.defineOption("markdownHeaderChange", [], async function(cm, val, old) {
                    const headerChangeDebounce = debounce(async function() {
                        var rect = cm.getWrapperElement().getBoundingClientRect();
                        return await _context.postMessage({
                            type: MsgType.SCROLL_CHANGE,
                            from: cm.lineAtHeight(rect.top, "window"),
                            to: cm.lineAtHeight(rect.bottom, "window")
                        });
                    }, 10);
                    cm.on('scroll', headerChangeDebounce);
                    cm.on('change', function (cm, changeObjs) {
                        if (changeObjs.origin === 'setValue') {
                            headerChangeDebounce();
                        }
                    });
                });
            },
            codeMirrorOptions: {
                'sidebar_cm_commands': true,
                'cursorChangeNotification': true,
                'markdownHeaderChange': true
            },
            assets: function() {
                return [ ];
            }
        }
    },
}
