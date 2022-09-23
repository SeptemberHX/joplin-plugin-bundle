import {colorMap} from "../../../utils/paperCardGenerator";
import {AnnotationItem} from "../../../lib/base/paperType";

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
        const annotationLinks: string = options[2];
        const selections = this.doc.listSelections();
        if (annotations.length == 0 || !selections || selections.length == 0) {
            return;
        }
        const currSelection = selections[0];

        let insertedText = "";
        let i = 0;
        for (const anno of annotations) {
            insertedText += '\n';
            if (anno.text && anno.text.length > 0) {
                insertedText += `> [📜](${annotationLinks[i]}) ${anno.text.replace('\n', ' ')}`;
                if (enableEnhanced) {
                    insertedText += ` [color=${anno.color_id < 0 ? anno.color : colorMap[anno.color_id]}][name=${anno.user_name}][date=${new Date(anno.modified).toLocaleString()}]`;
                }
                insertedText += '\n';
            }

            if (anno.note && anno.note.length > 0) {
                insertedText += `> [🎶](${annotationLinks[i]}) ${anno.note.replace('\n', ' ')}`;
                insertedText += '\n';
            }
            i += 1;
        }
        this.doc.replaceRange(insertedText, currSelection.to());
        this.editor.focus();
    }
}
