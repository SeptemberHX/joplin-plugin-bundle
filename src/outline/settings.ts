import { SettingItemType } from 'api/types';
import joplin from 'api';

export async function registerSettings() {
    await joplin.settings.registerSection('outline.settings', {
        label: 'Outline',
        iconName: 'fas fa-bars',
    });

    await joplin.settings.registerSettings({
        headerDepth: {
            type: SettingItemType.Int,
            value: 6,
            description: 'Header depth',
            section: 'outline.settings',
            public: true,
            label: 'Header Depth',
        },
        disableLinewrap: {
            type: SettingItemType.Bool,
            value: false,
            description: 'Disable the linewrap',
            section: 'outline.settings',
            public: true,
            label: 'Disable Linewrap',
        },
        showNumber: {
            type: SettingItemType.Bool,
            value: false,
            description: 'show numbered headers',
            section: 'outline.settings',
            public: true,
            label: 'Show Number',
        },
        numberStyle: {
            type: SettingItemType.String,
            value: 'font-weight: normal; font-style: normal',
            description: 'font-weight: normal; font-style: normal',
            section: 'outline.settings',
            public: true,
            label: 'Number <i> Style',
            advanced: true,
        },
        h1Prefix: {
            type: SettingItemType.String,
            value: '',
            section: 'outline.settings',
            public: true,
            label: 'H1 Prefix',
            advanced: true,
        },
        h2Prefix: {
            type: SettingItemType.String,
            value: '',
            section: 'outline.settings',
            public: true,
            label: 'H2 Prefix',
            advanced: true,
        },
        h3Prefix: {
            type: SettingItemType.String,
            value: '',
            section: 'outline.settings',
            public: true,
            label: 'H3 Prefix',
            advanced: true,
        },
        h4Prefix: {
            type: SettingItemType.String,
            value: '',
            section: 'outline.settings',
            public: true,
            label: 'H4 Prefix',
            advanced: true,
        },
        h5Prefix: {
            type: SettingItemType.String,
            value: '',
            section: 'outline.settings',
            public: true,
            label: 'H5 Prefix',
            advanced: true,
        },
        h6Prefix: {
            type: SettingItemType.String,
            value: '',
            section: 'outline.settings',
            public: true,
            label: 'H6 Prefix',
            advanced: true,
        },
    });
}

export function settingValue(key: string) {
    return joplin.settings.value(key);
}
