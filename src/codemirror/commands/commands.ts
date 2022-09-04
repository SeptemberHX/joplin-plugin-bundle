export default class CommandsBridge {
    constructor(private readonly editor) {
    }

    private readonly doc = this.editor.getDoc();

    scrollToLine(line: number): void {
        this.editor.scrollIntoView({line :line, ch: 0}, 400);
    }
}
