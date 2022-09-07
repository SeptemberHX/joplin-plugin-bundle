export class MsgType {
    static ENABLE_OUTLINE_LABEL = 'ENABLE_OUTLINE_LABEL';
    static ENABLE_OUTLINE_DESCRIPTION = 'ENABLE_OUTLINE_DESCRIPTION';
}


export function localeString(msgType: string, locale: string): string {
    if (locale in LocaleMsg && msgType in LocaleMsg[locale]) {
        return LocaleMsg[locale][msgType];
    }
    return LocaleMsg['default'][msgType];
}


const LocaleMsg = {
    'zh_CN': {
        ENABLE_OUTLINE_LABEL: '启用 Outline 菜单子插件',
        ENABLE_OUTLINE_DESCRIPTION: '原插件地址：https://github.com/cqroot/joplin-outline，需要重启。'
    },
    'default': {
        ENABLE_OUTLINE_LABEL: 'Enable Outline in bundle',
        ENABLE_OUTLINE_DESCRIPTION: 'Forked from https://github.com/cqroot/joplin-outline. Requires restart'
    }
}

