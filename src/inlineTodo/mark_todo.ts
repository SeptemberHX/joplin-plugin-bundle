import joplin from "api";
import {Settings, Todo} from "./types";


export async function set_origin_todo(todo: Todo, settings: Settings): Promise<boolean> {
    const origin = await joplin.data.get(['notes', todo.note], { fields: ['body'] });
    let lines = origin.body.split('\n');
    const parser = settings.todo_type;

    let match: RegExpExecArray;
    for (let i = 0; i < lines.length; i++) {
        parser.regex.lastIndex = 0;
        match = parser.regex.exec(lines[i] + '\n');
        if (match === null) { continue; }

        if (!((parser.msg(match) == todo.msg) &&
            (parser.date(match) == todo.date) &&
            (parser.assignee(match) == todo.assignee) &&
            (JSON.stringify(parser.tags(match)) == JSON.stringify(todo.tags)))) {
            continue;
        }

        lines[i] = lines[i].replace(parser.toggle.open, parser.toggle.closed);

        // edit origin note
        await joplin.data.put(['notes', todo.note], null, { body: lines.join('\n') });

        return true;
    }

    return false
}
