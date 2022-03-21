import { IBuildPlugin } from '../@types';

export function load() {}

export function unload() {}

export const configs: Record<string, IBuildPlugin> = {
    '*': {
        hooks: './hooks',
        options: {
            public: {
                label: 'vue静态资源目录',
                description: 'vue静态资源目录',
                default: '',
                render: {
                    ui: 'ui-file',
                    attributes: {
                        type: 'directory',
                    },
                },
            },
            outputName: {
                label: '游戏名字',
                description: '游戏名字',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        'show-clear': true,
                    },
                },
            },
            publicSettings: {
                label: 'settings.json目录',
                description: 'settings.json目录',
                default: '',
                render: {
                    ui: 'ui-file',
                    attributes: {
                        type: 'directory',
                    },
                },
            },
            outputSettingName: {
                label: 'settings.json新名字',
                description: 'settings.json新名字',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        'show-clear': true,
                    },
                },
            },
        },
    },
};
