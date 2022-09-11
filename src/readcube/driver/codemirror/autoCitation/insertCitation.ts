import {AnnotationItem} from "../../../lib/papers/papersLib";

const colorMap = {
    1: '#ffd638',
    2: '#94ed96',
    3: '#feb6c1',
    4: '#dba1da',
    5: '#fe0013',
    6: '#001df8',
    7: '#ffa42c'
};

export default class InsertCitation {
    constructor(private readonly editor) {}
    private readonly doc = this.editor.getDoc();

    insertPaperCitations(options) {
        const itemCitations: string[] = options[0];
        const itemRefNames: string[] = options[1];
        const selections = this.doc.listSelections();
        if (itemCitations.length == 0 || !selections || selections.length == 0) {
            return;
        }
        const currSelection = selections[0];

        let appendRefsText = '';
        let insertRefNames = [];
        let text = this.doc.getValue();
        for (const index in itemCitations) {
            const refText = `[^${itemRefNames[index]}]: ${itemCitations[index]}`;
            if (text.indexOf(refText) < 0) {
                appendRefsText += refText + '\n';
            }
            insertRefNames.push(`[^${itemRefNames[index]}]`);
        }

        if (appendRefsText.length > 0) {
            if (text[text.length - 1] != '\n') {
                text += '\n\n\n';
            }
            text += appendRefsText;
        }

        this.doc.setValue(text);
        this.doc.replaceRange(insertRefNames.join(''), currSelection.to());
        // this.doc.setSelection(currSelection);
        this.editor.focus();
    }

    insertAnnotationCitations(options) {
        const annotations: AnnotationItem[] = options[0];
        const enableEnhanced: boolean = options[1];
        const selections = this.doc.listSelections();
        if (annotations.length == 0 || !selections || selections.length == 0) {
            return;
        }
        const currSelection = selections[0];

        let insertedText = "";
        for (const anno of annotations) {
            insertedText += '\n';
            if (anno.text && anno.text.length > 0) {
                insertedText += `> [📜](https://www.readcube.com/library/${anno.item_id}#annotation:${anno.id}) ${anno.text.replace('\n', ' ')}`;
                if (enableEnhanced) {
                    insertedText += ` [color=${colorMap[anno.color_id]}][name=${anno.user_name}][date=${new Date(anno.modified).toLocaleString()}]`;
                }
                insertedText += '\n';
            }

            if (anno.note && anno.note.length > 0) {
                insertedText += `> [🎶](https://www.readcube.com/library/${anno.item_id}#annotation:${anno.id}) ${anno.note.replace('\n', ' ')}`;
                insertedText += '\n';
            }
        }
        this.doc.replaceRange(insertedText, currSelection.to());
        this.editor.focus();
    }
}
