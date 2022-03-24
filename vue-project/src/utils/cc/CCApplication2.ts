import { addClass } from '../elementClass';
import { loadJSFile, loadJsList, loadModulePacks, topLevelImport } from './CCTools';
const global = window as any;

/**
 * 游戏引擎适配器
 */
export interface Adapter {
    canvas: HTMLCanvasElement | null;
    container: HTMLDivElement | null;
    frame: Record<string, unknown> | null;
}
/**
 * cc game engine App
 */
export default class CCApplication2 {
    private _canvas!: HTMLCanvasElement;
    /**
     * gameName 必须要个 public 目录下的名字一致
     */
    constructor(private rootId: string, public gameName: string, public settings: Record<string, any>) {
        this.settings.server = gameName + '/';
    }

    public startUp() {
        let debug = this.settings.debug;
        let splash = document.getElementById('splash');
        splash && (splash.style.display = 'block');
        loadJSFile(debug ? 'cocos2d-js.js' : 'cocos2d-js-min.a1a7e.js', this.settings.server).then(() => {
            //@ts-ignore
            if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
                loadJSFile(debug ? 'physics.js' : 'physics-min.ce5ee.js', this.settings.server).then(() => {
                    this.boot();
                });
            }
            else {
                this.boot();
            }
        })

    }

    loadScript(moduleName: string, cb: Function) {
        let scriptLoaded = () => {
            document.body.removeChild(domScript);
            domScript.removeEventListener('load', scriptLoaded, false);
            cb && cb();
        };
        var domScript = document.createElement('script');
        domScript.async = true;
        domScript.src = moduleName;
        domScript.addEventListener('load', scriptLoaded, false);
        document.body.appendChild(domScript);
    }

    boot() {
        let cc = global.cc;
        let settings = this.settings;
        this.initEngineIntercept();
        var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
        var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
        var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;


        var option = {
            id: 'GameCanvas',
            debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
            showFPS: settings.debug,
            frameRate: 60,
            groupList: settings.groupList,
            collisionMatrix: settings.collisionMatrix,
        };

        cc.assetManager.init({
            bundleVers: settings.bundleVers,
            remoteBundles: settings.remoteBundles,
            server: settings.server
        });

        var bundleRoot = [INTERNAL];
        settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

        var count = 0;
        const cb = (err: any) => {
            if (err) return console.error(err.message, err.stack);
            count++;
            if (count === bundleRoot.length + 1) {
                let main = `./${this.settings.server}assets/${MAIN}`
                console.log(main);
                cc.assetManager.loadBundle(main, (err: any) => {
                    if (!err) {
                        cc.game.run(option, ()=>{
                            this.onGameStarted();
                        });
                    }
                });
            }
        }

        cc.assetManager.loadScript(settings.jsList.map((x: string) => {
            return `${this.settings.server}src/${x}`;
        }), cb);
        for (var i = 0; i < bundleRoot.length; i++) {
            let path = `./${this.settings.server}assets/${bundleRoot[i]}`
            console.log(path);
            cc.assetManager.loadBundle(path, cb);
        }
    }
    private onGameStarted() {
        let cc = global.cc;
        let settings = this.settings;
        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (cc.sys.isBrowser) {

        }

        if (cc.sys.isMobile) {
            if (settings.orientation === 'landscape') {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            }
            else if (settings.orientation === 'portrait') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
            cc.view.enableAutoFullScreen([
                cc.sys.BROWSER_TYPE_BAIDU,
                cc.sys.BROWSER_TYPE_BAIDU_APP,
                cc.sys.BROWSER_TYPE_WECHAT,
                cc.sys.BROWSER_TYPE_MOBILE_QQ,
                cc.sys.BROWSER_TYPE_MIUI,
                cc.sys.BROWSER_TYPE_HUAWEI,
                cc.sys.BROWSER_TYPE_UC,
            ].indexOf(cc.sys.browserType) < 0);
        }

        // Limit downloading max concurrent task to 2,
        // more tasks simultaneously may cause performance draw back on some android system / browsers.
        // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.assetManager.downloader.maxConcurrency = 2;
            cc.assetManager.downloader.maxRequestsPerFrame = 2;
        }

        var launchScene = settings.launchScene;
        var bundle = cc.assetManager.bundles.find(function (b: any) {
            return b.getSceneInfo(launchScene);
        });

        bundle.loadScene(launchScene, null, null,
            function (err, scene) {
                if (!err) {
                    cc.director.runSceneImmediate(scene);
                    if (cc.sys.isBrowser) {
                        // show canvas
                        var canvas = document.getElementById('GameCanvas');
                        canvas && (canvas.style.visibility = '');
                        var div = document.getElementById('GameDiv');
                        if (div) {
                            div.style.backgroundImage = '';
                        }
                        console.log('Success to load scene: ' + launchScene);
                    }
                }
            }
        );

    }

     /**
     * 释放当前场景并且暂停cc所有事件和心跳
     */
      public pauseAndRelease() {
        const cc = this.cc;
        if (cc && cc.director.getScene()) {
            const afterDrawPromise = new Promise<void>(
                (resolve) => cc.director.once(cc.Director.EVENT_AFTER_DRAW, resolve) as void,
            );
            afterDrawPromise.then(() => {
                for (const id in cc.game._persistRootNodes) {
                    cc.game.removePersistRootNode(cc.game._persistRootNodes[id]);
                }

                cc.director.getScene().destroy();
                cc.Object._deferredDestroy();
                cc.director.reset();
                cc.game.pause();
                cc.director.pause();

                // cc.assetManager.builtins.init(() => {
                //     cc.game.onStart();
                //     cc.game.emit(cc.game.EVENT_RESTART);
                // });
            });
        }
    }

    /**
     * 恢复所有事件和心跳，重新加载场景
     */
    public resumeAndRestart() {
        const cc = this.cc;
        if (cc) {
            cc.game._prepareFinished(()=>{
                cc.director.resume();
                cc.game.resume();
                cc.game.emit(cc.game.EVENT_RESTART);
            })

            // this.setGlobalSettings();
           
            // return .then(() => {
               
            // });
        }
    }

    /**
     * 初始化引擎拦截器
     * 暴力拦截浏览器 onshow onhide，避免keep-alive缓存场景执行启动游戏逻辑
     */
     private initEngineIntercept() {
        const cc = this.cc;
        const onShow = cc.game._onShow;
        const onHide = cc.game._onHide;
        cc.game._onShow = () => {
            console.log('cc game 拦截 onshow');
            if (cc.director.isPaused()) {
                return;
            }

            onShow.call(cc.game);
        };

        cc.game._onHide = () => {
            console.log('cc game 拦截 onhide');
            if (cc.director.isPaused()) {
                return;
            }

            onHide.call(cc.game);
        };
    }



    public get cc(): any {
        return global.cc;
    }
}

// export const ccApp = new CCApplication('GameCanvas');
