const {debounce} = require("ts-debounce");

module.exports = {
    default: function(context) {
        return {
            plugin: function plugin(CodeMirror) {
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
                        return await context.postMessage({
                            from: cm.lineAtHeight(rect.top, "window"),
                            to: cm.lineAtHeight(rect.bottom, "window")
                        });
                    }, 100);
                    cm.on('scroll', headerChangeDebounce);
                });
            },
            codeMirrorOptions: { 'markdownHeaderChange': true },
        };
    },
};
