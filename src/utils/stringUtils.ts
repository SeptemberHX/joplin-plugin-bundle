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


/*
 * Find all the appearance of target in lines
 */
export function contextOfAppearance(target: string, lines: string[]) {
    let lineNumber = 0;
    let results = [];
    for (const line of lines) {
        lineNumber += 1;
        let index = line.indexOf(target);
        while (index > 0) {
            results.push([lineNumber, line]);
            index = line.indexOf(target, index + target.length);
        }
    }
    return results;
}


/**
 * We need to replace href=":/noteId" with webapi calls
 * @param source
 */
export function htmlConvert(source: string) {
    let result = source;
    const noteIdHrefReg = /href="(:\/\w{32})"/g;
    const hrefReg = /href="(.*?)"/g;
    let match;
    while ((match = noteIdHrefReg.exec(result)) !== null) {
        noteIdHrefReg.lastIndex = 0;
        result = result.replace(match[0], `href="#" onclick="onJoplinNoteLinkClicked('${match[1]}')"`);
    }

    let lastIndex = 0;
    while ((match = hrefReg.exec(result)) !== null) {
        if (match[1] === '#') {
            lastIndex = match.lastIndex;
        } else {
            match.lastIndex = lastIndex;
            result = result.replace(match[0], `href="#" onclick="onJoplinNoteLinkClicked('${match[1]}')"`);
        }
    }
    return result;
}
