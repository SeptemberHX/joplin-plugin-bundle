import CommandsBridge from "./commands";

module.exports = {
    default: function(_context) {
        return {
            plugin: function (CodeMirror) {
                CodeMirror.defineOption("sidebar_cm_commands", [], async function(cm, val, old) {
                    const commandBridge = new CommandsBridge(cm);
                    CodeMirror.defineExtension('sidebar_cm_scrollToLine', commandBridge.scrollToLine.bind(commandBridge));
                });
            },
            codeMirrorOptions: {
                'sidebar_cm_commands': true,
            },
            assets: function() {
                return [ ];
            }
        }
    },
}
