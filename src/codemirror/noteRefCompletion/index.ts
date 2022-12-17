import NoteRefCompletion from "./noteRefCompletion";

module.exports = {
    default: function(_context) {
        return {
            plugin: function (CodeMirror) {
                CodeMirror.defineOption("cm_note_ref_completion", [], async function(cm, val, old) {
                    new NoteRefCompletion(_context, cm, CodeMirror);
                });
            },
            codeMirrorOptions: {
                'cm_note_ref_completion': true
            },
            assets: function() {
                return [ ];
            }
        }
    },
}
