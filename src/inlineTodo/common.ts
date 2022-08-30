// To add a new regex simple define one below
// The title is what will appear in the settings menu
// The regex is what will identify a todo line
// The query is what will identify a note with a todo in it (Joplin search syntax)
// The assignee is a function that extracts the assignee from the todo
// The date is a function that extracts the date from the todo
// The tags is a function that extracts the tags from the todo
// The msg is a function that extracts the message from the todo
export const regexes = {
    list: {
        title: 'Confluence Style',
        regex: /^\s*- \[ \]\s.*(?<=\s)(?:(@[^\s]+)|(\/\/[^\s]+)|(\+[^\s]+)|(![1234](?=\s))|())(?:[^\n]*)?$/gm,
        query: '/"- [ ]"',
        assignee: (todo: string[]) => {
            const result = todo[0].match(/(?<=\s@)([^\s]+)/);
            return result ? result[0] : '';
        },
        date: (todo: string[]) => {
            const result = todo[0].match(/(?<=\s\/\/)([^\s]+)/);
            return result ? result[0] : '';
        },
        tags: (todo: string[]) => {
            // the /g is important to get multiple results instead of a single match
            const result = todo[0].match(/(?<=\s\+)[^\s]+/g);
            return result ? result : [];
        },
        msg: (todo: string[]) => {
            let result = todo[0].split(/\s@[^\s]+/).join('');
            result = result.split(/\s\/\/[^\s]+/).join('');
            result = result.split(/\s\+[^\s]+/).join('');
            result = result.split(/- \[ \]/).join('');
            result = result.split(/(?<=\s)![1234]/).join('');

            return result.trim();
        },
        priority: (todo: string[]) => {
            const result = todo[0].match(/(?<=\s!)([1234])/g);
            return result ? Number(result[0]) : 4;
        },
        toggle: { open: '- [ ]', closed: '- [x]' },
    }
}
