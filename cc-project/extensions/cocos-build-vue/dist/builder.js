"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.unload = exports.load = void 0;
function load() { }
exports.load = load;
function unload() { }
exports.unload = unload;
exports.configs = {
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
