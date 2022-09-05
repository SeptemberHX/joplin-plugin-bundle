import CommandsBridge from "./commands";
import {debounce} from "ts-debounce";
import wordsCount from 'words-count';

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
                            totalLineCount: cm.getDoc().lineCount(),
                            currentLineNumber: cm.getDoc().getCursor().line + 1,
                            totalWordCount: wordsCount(cm.getDoc().getValue()),
                            selectedWordCount: selectedWordCount
                        });
                    }, 100);
                    cm.on('cursorActivity', changeDebounce);
                });
            },
            codeMirrorOptions: {
                'sidebar_cm_commands': true,
                'cursorChangeNotification': true
            },
            assets: function() {
                return [ ];
            }
        }
    },
}
