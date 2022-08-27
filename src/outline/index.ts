import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { registerSettings, settingValue } from './settings';
import mdHeaders from './mdHeaders';
import panelHtml from './panelHtml';
import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";


class OutlinePlugin extends SidebarPlugin {
    sidebars: Sidebars;

    constructor() {
        super();

        this.id = 'outline';
        this.name = 'Outline';
        this.icon = 'fas fa-list';
        this.styles = [
            './scripts/outline/webview.css'
        ];
        this.scripts = [
            './scripts/outline/webview.js'
        ];
    }

    public async panelMsgProcess(message: any) {
        if (message.name === 'scrollToHeader') {
            const editorCodeView = await joplin.settings.globalValue('editor.codeView');
            const noteVisiblePanes = await joplin.settings.globalValue('noteVisiblePanes');
            if (editorCodeView && noteVisiblePanes.includes('editor')) {
                // scroll in raw markdown editor
                await joplin.commands.execute('editor.execCommand', {
                    name: 'scrollToLine',
                    args: [message.lineno],
                });
            } else {
                // scroll in WYSIWYG editor or viewer
                await joplin.commands.execute('scrollToHash', message.hash);
            }
            return true;
        } else if (message.name === 'contextMenu') {
            const noteId = (await joplin.workspace.selectedNoteIds())[0];
            const noteTitle = (await joplin.data.get(['notes', noteId], { fields: ['title'] })).title;
            const innerLink = `[${noteTitle}#${message.content}](:/${noteId}#${message.hash})`;

            const input = document.createElement('input');
            input.setAttribute('value', innerLink);
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            return true;
        }
        return false;
    }

    public async init(sidebars: Sidebars) {
        this.sidebars = sidebars;
        await registerSettings();

        await joplin.contentScripts.register(
            ContentScriptType.CodeMirrorPlugin,
            'codeMirrorScroller',
            './outline/codeMirrorScroller.js',
        );

        await joplin.workspace.onNoteSelectionChange(() => {
            this.updateTocView();
        });
        await joplin.workspace.onNoteChange(() => {
            this.updateTocView();
        });
        await joplin.settings.onChange(() => {
            this.updateTocView();
        });

        await this.updateTocView();
    }

    private async updateTocView() {
        const note = await joplin.workspace.selectedNote();

        let headers;
        if (note) {
            headers = mdHeaders(note.body);
        } else {
            headers = [];
        }

        const htmlText = await panelHtml(headers);
        await this.sidebars.updateHtml(this.id, htmlText);
    }
}

const outlinePlugin = new OutlinePlugin();
export default outlinePlugin;
