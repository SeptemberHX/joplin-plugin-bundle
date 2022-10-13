export function lineOfString(target: string, lines: string[]) : number {
    let lineNumber = 0;
    for (const line of lines) {
        lineNumber += 1;
        if (line.includes(target)) {
            return lineNumber;
        }
    }
    return 0;
}
