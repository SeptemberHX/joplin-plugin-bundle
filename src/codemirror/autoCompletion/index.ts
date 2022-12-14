import QuickCommands from "./quickCommands";

module.exports = {
    default: function(_context) {
        return {
            plugin: function (CodeMirror) {
                CodeMirror.defineOption("cm_auto_completion", [], async function(cm, val, old) {
                    new QuickCommands(_context, cm, CodeMirror);
                });
            },
            codeMirrorOptions: {
                'cm_auto_completion': true
            },
            assets: function() {
                return [ ];
            }
        }
    },
}
