export default class CommandsBridge {
    constructor(private readonly editor) {
    }

    private readonly doc = this.editor.getDoc();

    scrollToLine(line: number): void {
        // temporary fix: sometimes the first coordinate is incorrect,
        // resulting in a difference about +- 10 px,
        // call the scroll function twice fixes the problem.
        this.editor.scrollTo(null, this.editor.charCoords({ line: line, ch: 0 }, 'local').top);
        this.editor.scrollTo(null, this.editor.charCoords({ line: line, ch: 0 }, 'local').top);
    }
}
