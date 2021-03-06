"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const PACKAGE_NAME = 'cocos-build-vue';
function buildlog(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
let allAssets = [];
exports.throwError = true;
function load() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
        allAssets = yield Editor.Message.request('asset-db', 'query-assets');
    });
}
exports.load = load;
function onBeforeBuild(options) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        buildlog('onBeforeBuild options:', options);
    });
}
exports.onBeforeBuild = onBeforeBuild;
function onBeforeCompressSettings(options, result) {
    return __awaiter(this, void 0, void 0, function* () { });
}
exports.onBeforeCompressSettings = onBeforeCompressSettings;
function onAfterCompressSettings(options, result) {
    return __awaiter(this, void 0, void 0, function* () { });
}
exports.onAfterCompressSettings = onAfterCompressSettings;
function onAfterBuild(options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        buildlog('onAfterBuild:', options, result);
        const vueOption = options.packages['cocos-build-vue'];
        buildlog('onAfterBuild vueOption:', vueOption);
        const { public: vue_public_dir, outputName, outputSettingName, publicSettings } = vueOption; // vue??????public?????????
        if (!vue_public_dir) {
            buildlog('?????????public?????????????????????');
            return true;
        }
        if (!outputName) {
            buildlog('?????????outputName?????????????????????');
            return true;
        }
        const vue_public_game = path_1.default.join(vue_public_dir, outputName); // vue??????public???????????????game
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
            buildlog('?????????outputSettingName???????????????settings??????');
            return true;
        }
        if (!publicSettings) {
            buildlog('?????????publicSettings???????????????settings??????');
            return true;
        }
        const vue_settings = path_1.default.join(publicSettings, outputSettingName + '.json'); // game????????????
        buildlog('vue_settings:', vue_settings);
        const settings = findFile(vue_public_game, { fileName: 'settings', fileExt: '.json' });
        if (settings) {
            move(settings, vue_settings);
        }
    });
}
exports.onAfterBuild = onAfterBuild;
function move(from, to) {
    buildlog('???????????????', to);
    clearDir(to);
    buildlog(`??????????????? ${from} -> ${to}`);
    fs_extra_1.default.renameSync(from, to);
}
/**
 * ?????????????????????
 */
function clearDir(targetPath) {
    if (!fs_extra_1.default.existsSync(targetPath)) {
        return;
    }
    if (fs_extra_1.default.statSync(targetPath).isFile()) {
        fs_extra_1.default.removeSync(targetPath);
        return;
    }
    const list = fs_extra_1.default.readdirSync(targetPath);
    for (const file of list) {
        const filePath = path_1.default.resolve(targetPath, file);
        clearDir(filePath);
    }
    fs_extra_1.default.rmdirSync(targetPath);
}
/**
 * ???????????????????????????????????????
 * @param {*} targetPath
 * @param {*} param1
 * @param {*} deep ??????????????????
 */
const findFile = (targetPath, { fileName, fileExt }, deep = true) => {
    if (!fs_extra_1.default.existsSync(targetPath)) {
        throw new Error('findFile targetPath???' + targetPath + ' ?????????');
    }
    const list = fs_extra_1.default.readdirSync(targetPath);
    for (const file of list) {
        const filePath = path_1.default.resolve(targetPath, file);
        if (fs_extra_1.default.statSync(filePath).isFile()) {
            const { name, ext } = path_1.default.parse(filePath);
            if (name.indexOf(fileName) > -1 && ext === fileExt) {
                return filePath;
            }
        }
        else if (deep) {
            const res = findFile(filePath, { fileName, fileExt }, deep);
            if (res) {
                return res;
            }
        }
    }
};
/**
 * ??????????????????????????? files deep?????????????????????
 * @param {string} targetPath
 * @param {Array<{ fileName, fileExt }>} files
 * @param {boolean} deep
 */
const removeFiles = (targetPath, files, deep = true) => {
    if (!fs_extra_1.default.existsSync(targetPath)) {
        throw new Error('findFile targetPath???' + targetPath + ' ?????????');
    }
    const list = fs_extra_1.default.readdirSync(targetPath);
    for (const file of list) {
        const filePath = path_1.default.resolve(targetPath, file);
        if (fs_extra_1.default.statSync(filePath).isFile()) {
            const { name, ext } = path_1.default.parse(filePath);
            const fileIndex = files.findIndex((file) => name.indexOf(file.fileName) > -1 && ext === file.fileExt);
            if (fileIndex === -1) {
                continue;
            }
            files.splice(fileIndex, 1)[0];
            fs_extra_1.default.removeSync(filePath);
        }
        else if (deep) {
            const res = removeFiles(filePath, files, deep);
            if (res) {
                return res;
            }
        }
    }
};
function unload() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
exports.unload = unload;
