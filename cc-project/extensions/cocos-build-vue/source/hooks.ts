import { IBuildTaskOption } from '../@types';
import { IBuildResult } from '../@types';
import fs from 'fs-extra';
import path from 'path';

interface IOptions {
    public: string;
    outputName: string;
    publicSettings: string;
    outputSettingName: string;
}

const PACKAGE_NAME = 'cocos-build-vue';

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        'cocos-build-vue': IOptions;
    };
}

function buildlog(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

let allAssets = [];

export const throwError = true;

export async function load() {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request('asset-db', 'query-assets');
}

export async function onBeforeBuild(options: ITaskOptions) {
    // Todo some thing
    buildlog('onBeforeBuild options:', options);
}

export async function onBeforeCompressSettings(options: ITaskOptions, result: IBuildResult) {}

export async function onAfterCompressSettings(options: ITaskOptions, result: IBuildResult) {}

export async function onAfterBuild(options: ITaskOptions, result: IBuildResult) {
    buildlog('onAfterBuild:', options, result);
    const vueOption = options.packages['cocos-build-vue'];
    buildlog('onAfterBuild vueOption:', vueOption);

    const { public: vue_public_dir, outputName, outputSettingName, publicSettings } = vueOption; // vue项目public文件夹
    if (!vue_public_dir) {
        buildlog('未填写public，无需移动文件');
        return true;
    }

    if (!outputName) {
        buildlog('未填写outputName，无需移动文件');
        return true;
    }

    const vue_public_game = path.join(vue_public_dir, outputName); // vue项目public文件夹下的game
    const project_game_dir = result.dest;
    buildlog('vue_public_game:', vue_public_game, project_game_dir);

    move(project_game_dir, vue_public_game);
    const delete_list = [
        { fileName: 'application', fileExt: '.js' },
        { fileName: 'index', fileExt: '.js' },
        { fileName: 'index', fileExt: '.html' },
        { fileName: 'style', fileExt: '.css' },
    ];
    removeFiles(vue_public_game, delete_list, false);

    if (!outputSettingName) {
        buildlog('未填写outputSettingName，无需移动settings文件');
        return true;
    }

    if (!publicSettings) {
        buildlog('未填写publicSettings，无需移动settings文件');
        return true;
    }
    const vue_settings = path.join(publicSettings, outputSettingName + '.json'); // game描述文件
    buildlog('vue_settings:', vue_settings);
    const settings = findFile(vue_public_game, { fileName: 'settings', fileExt: '.json' });
    if (settings) {
        move(settings, vue_settings);
    }
}

function move(from: string, to: string) {
    buildlog('清除文件夹', to);
    clearDir(to);
    buildlog(`移动文件夹 ${from} -> ${to}`);
    fs.renameSync(from, to);
}

/**
 * 清除目录、文件
 */
function clearDir(targetPath: string) {
    if (!fs.existsSync(targetPath)) {
        return;
    }

    if (fs.statSync(targetPath).isFile()) {
        fs.removeSync(targetPath);
        return;
    }

    const list = fs.readdirSync(targetPath);
    for (const file of list) {
        const filePath = path.resolve(targetPath, file);
        clearDir(filePath);
    }

    fs.rmdirSync(targetPath);
}

/**
 * 在指定文件夹内寻找一个文件
 * @param {*} targetPath
 * @param {*} param1
 * @param {*} deep 是否深度遍历
 */
const findFile = (targetPath: string, { fileName, fileExt }, deep = true) => {
    if (!fs.existsSync(targetPath)) {
        throw new Error('findFile targetPath：' + targetPath + ' 不存在');
    }

    const list = fs.readdirSync(targetPath);
    for (const file of list) {
        const filePath = path.resolve(targetPath, file);
        if (fs.statSync(filePath).isFile()) {
            const { name, ext } = path.parse(filePath);
            if (name.indexOf(fileName) > -1 && ext === fileExt) {
                return filePath;
            }
        } else if (deep) {
            const res = findFile(filePath, { fileName, fileExt }, deep);
            if (res) {
                return res;
            }
        }
    }
};

/**
 * 在指定文件夹内删除 files deep：是否深度遍历
 * @param {string} targetPath
 * @param {Array<{ fileName, fileExt }>} files
 * @param {boolean} deep
 */
const removeFiles = (targetPath: string, files: Array<{ fileName: string; fileExt: string }>, deep = true) => {
    if (!fs.existsSync(targetPath)) {
        throw new Error('findFile targetPath：' + targetPath + ' 不存在');
    }

    const list = fs.readdirSync(targetPath);
    for (const file of list) {
        const filePath = path.resolve(targetPath, file);
        if (fs.statSync(filePath).isFile()) {
            const { name, ext } = path.parse(filePath);
            const fileIndex = files.findIndex((file) => name.indexOf(file.fileName) > -1 && ext === file.fileExt);
            if (fileIndex === -1) {
                continue;
            }

            files.splice(fileIndex, 1)[0];
            fs.removeSync(filePath);
        } else if (deep) {
            const res = removeFiles(filePath, files, deep);
            if (res) {
                return res;
            }
        }
    }
};

export function unload() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
