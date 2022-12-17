import NoteRefCompletion from "./paperCiteCompletion";

module.exports = {
    default: function(_context) {
        return {
            plugin: function (CodeMirror) {
                CodeMirror.defineOption("cm_paper_cite_completion", [], async function(cm, val, old) {
                    new NoteRefCompletion(_context, cm, CodeMirror);
                });
            },
            codeMirrorOptions: {
                'cm_paper_cite_completion': true
            },
            assets: function() {
                return [ ];
            }
        }
    },
}
