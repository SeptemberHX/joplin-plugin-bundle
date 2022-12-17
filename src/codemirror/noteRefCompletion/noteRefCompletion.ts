// implemented according to https://github.com/ylc395/joplin-plugin-note-link-system/blob/main/src/driver/codeMirror/QuickLinker.ts

import {Editor, Position} from "codemirror";
import CodeMirror from "codemirror";

const TRIGGER_SYMBOL = '@ref';
const HINT_ITEM_CLASS = 'quick-commands-hint';
const HINT_ITEM_PATH_CLASS = 'quick-commands-hint-path';

// @see https://codemirror.net/doc/manual.html#addon_show-hint
export interface Hint {
    text: string;
    displayText?: string;
    className?: string;
    description?: string;
    render?: (container: Element, completion: Completion, hint: Hint) => void;
    // hint?: (cm: typeof CodeMirror, completion: Completion, hint: Hint) => void;
    inline: boolean;
}

interface Completion {
    from: Position;
    to: Position;
    list: Hint[];
    selectedHint?: number;
}

export type ExtendedEditor = {
    showHint(options: {
        completeSingle: boolean;
        closeCharacters: RegExp;
        closeOnUnfocus: boolean;
        hint: (cm: Editor) => Completion | undefined | Promise<Completion | undefined>;
    }): void;
};

export default class NoteRefCompletion {
    constructor(private readonly context, private readonly editor: ExtendedEditor & Editor, private readonly cm: typeof CodeMirror) {
        this.editor.on('cursorActivity', this.triggerHints.bind(this));
        setTimeout(this.init.bind(this), 100);
    }

    private async init() {

    }

    private readonly doc = this.editor.getDoc();
    private symbolRange?: { from: Position; to: Position };

    private triggerHints() {
        const pos = this.doc.getCursor();
        const symbolRange = [{ line: pos.line, ch: pos.ch - TRIGGER_SYMBOL.length }, pos] as const;
        const chars = this.doc.getRange(...symbolRange);

        if ((chars === TRIGGER_SYMBOL)
                && !/\S/.test(this.doc.getRange(pos, {line: pos.line, ch: pos.ch + 1}))) {
            this.symbolRange = { from: symbolRange[0], to: symbolRange[1] };
            this.editor.showHint({
                closeCharacters: /[()\[\]{};:>,/ ]/,
                closeOnUnfocus: true,
                completeSingle: false,
                hint: this.getCommandCompletion.bind(this, chars),
            });
        }
    }

    private async getCommandCompletion(symbols: string) : Promise<Completion | undefined> {
        if (!this.symbolRange) {
            throw new Error('no symbolRange');
        }

        const { line, ch } = this.symbolRange.to;
        const { line: cursorLine, ch: cursorCh } = this.doc.getCursor();

        if (cursorLine < line || cursorCh < ch) {
            return;
        }

        const keyword = this.doc.getRange({ line, ch }, { line: cursorLine, ch: cursorCh });
        const { from: completionFrom } = this.symbolRange;
        const completionTo = { line, ch: ch + keyword.length };
        const completion: Completion = {
            from: completionFrom,
            to: completionTo,
            list: await this.getCommandHints(
                symbols,
                keyword,
                this.doc.getRange({line: cursorLine, ch: 0}, {line: cursorLine, ch: cursorCh - 1}) // string before '/'
            ),
        };
        return completion;
    }

    private async getCommandHints(symbols: string, keyword: string, indent: string) : Promise<Hint[]> {
        let hints = [];

        let results = await this.context.postMessage({
            type: 'cm_note_ref_completion'
        });

        // add indent when there exists 'tab' before or add a new line for non-inline hints
        for (let noteItem of results) {
            // filter the hints by keyword
            if (noteItem.title.includes(keyword)) {
                hints.push({
                    text:  `[${noteItem.title}](:/${noteItem.id})`,
                    displayText: noteItem.title,
                    className: HINT_ITEM_CLASS,
                    render(container) {
                        container.innerHTML = noteItem.title;
                    },
                    updateTime: noteItem.updated_time
                })
            }
        }

        return hints.sort((h1, h2) => {
            if (h1.updateTime > h2.updateTime) {
                return -1;
            } else if (h1.updateTime < h2.updateTime) {
                return 1;
            } else {
                return 0;
            }
        });
    }
}
