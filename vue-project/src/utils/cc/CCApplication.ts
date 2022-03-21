import { addClass } from '../elementClass';
import { loadJsList, loadModulePacks, topLevelImport } from './CCTools';
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
export default class CCApplication {
    private _canvas!: HTMLCanvasElement;
    /**
     * gameName 必须要个 public 目录下的名字一致
     */
    constructor(private rootId: string, public gameName: string, public settings: Record<string, any>) {
        this.settings.server = gameName + '/';
    }

    public startUp() {
        topLevelImport('cc').then((_engine: unknown) => {
            const cc = this.cc;
            this.initEngineIntercept();
            return this.initGame()
                .then(() => {
                    if (this.settings.scriptPackages) {
                        return loadModulePacks(this.settings.scriptPackages);
                    }
                })
                .then(() => {
                    return loadJsList(this.settings.jsList);
                })
                .then(() => {
                    return this.loadAssetBundle();
                })
                .then(() => {
                    this.setGlobalSettings();
                    return cc.game.run(() => {
                        return this.onGameStarted();
                    });
                });
        });
    }

    private onGameStarted() {
        const cc = this.cc;
        this.setGlobalSettings(true);
        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (cc.sys.isMobile) {
            if (this.settings.orientation === 'landscape') {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            } else if (this.settings.orientation === 'portrait') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }

            cc.view.enableAutoFullScreen(false);
        }

        const launchScene = this.settings.launchScene; // load scene
        cc.director.loadScene(launchScene, null, function () {
            cc.view.setDesignResolutionSize(1024, 768, 4);
            console.log('Success to load scene: '.concat(launchScene));
        });
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

    private initGame() {
        const cc = this.cc;
        if (this.settings.macros) {
            for (const key in this.settings.macros) {
                cc.macro[key] = this.settings.macros[key];
            }
        }

        const gameOptions = this.getGameOptions();
        return Promise.resolve(cc.game.init(gameOptions));
    }

    /**
     * 游戏引擎启动 适配器
     * @returns
     */
    public getAdapter() {
        const canvas = this.canvas;
        if (!canvas || canvas.tagName !== 'CANVAS') {
            console.error('unknown canvas id:' + this.rootId);
        }

        const { width, height } = canvas,
            container = document.createElement('div');
        if (canvas && canvas.parentNode) {
            canvas.parentNode.insertBefore(container, canvas);
        }

        container.setAttribute('id', 'Cocos3dGameContainer');
        container.appendChild(canvas);
        const frame = container.parentNode === document.body ? document.documentElement : container.parentNode;
        addClass(canvas, 'gameCanvas');
        canvas.setAttribute('width', width + '' || '480');
        canvas.setAttribute('height', height + '' || '320');
        canvas.setAttribute('tabindex', '99');

        return {
            frame,
            canvas,
            container,
        };
    }

    /**
     * 组装游戏启动参数
     * @returns
     */
    public getGameOptions() {
        const cc = this.cc;
        // assetManager
        const assetOptions = {
            bundleVers: this.settings.bundleVers,
            remoteBundles: this.settings.remoteBundles,
            server: this.settings.server,
            subpackages: this.settings.subpackages,
        };
        const options = {
            debugMode: this.settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
            showFPS: !false && this.settings.debug,
            frameRate: 60,
            groupList: this.settings.groupList,
            collisionMatrix: this.settings.collisionMatrix,
            renderPipeline: this.settings.renderPipeline,
            adapter: this.getAdapter(),
            assetOptions: assetOptions,
            customJointTextureLayouts: this.settings.customJointTextureLayouts || [],
            physics: this.settings.physics,
        };

        return options;
    }

    /**
     * 下载项目启动必须bundle
     */
    public loadAssetBundle() {
        // 是否包含 resource startscene
        const { hasResourcesBundle, hasStartSceneBundle } = this.settings.hasResourcesBundle;
        const BuiltinBundleName = this.cc.AssetManager.BuiltinBundleName,
            MAIN = BuiltinBundleName.MAIN,
            RESOURCES = BuiltinBundleName.RESOURCES,
            START_SCENE = BuiltinBundleName.START_SCENE;
        const bundleRoot: Array<string> = hasResourcesBundle ? [RESOURCES, MAIN] : [MAIN];

        if (hasStartSceneBundle) {
            bundleRoot.push(START_SCENE);
        }

        return bundleRoot.reduce((pre, name) => {
            return pre.then(() => {
                return this.loadBundle(name);
            });
        }, Promise.resolve());
    }

    /**
     * cc engine load bundle
     * @param name
     * @returns
     */
    public loadBundle(name: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cc.assetManager.loadBundle(name, (err: Error, bundle: any) => {
                if (err) {
                    return reject(err);
                }

                resolve(bundle);
            });
        });
    }

    /**
     * 设置全局 _CCSettings，cocos启动时会读取 _CCSettings
     * @param clear
     */
    public setGlobalSettings(clear = false) {
        if (clear) {
            global._CCSettings = undefined;
        } else {
            global._CCSettings = this.settings;
        }
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
            });
        }
    }

    /**
     * 恢复所有事件和心跳，重新加载场景
     */
    public resumeAndRestart() {
        const cc = this.cc;
        if (cc) {
            // this.setGlobalSettings();
            return cc.game._setRenderPipelineNShowSplash().then(() => {
                cc.director.resume();
                cc.game.resume();
                cc.game._safeEmit(cc.Game.EVENT_RESTART);
            });
        }
    }

    public get canvas(): HTMLCanvasElement {
        if (!this._canvas) {
            const canvas = document.getElementById(this.rootId) as HTMLCanvasElement;
            if (!canvas) {
                throw new Error("'unknown canvas id:" + this.rootId);
            }

            this._canvas = canvas;
        }

        return this._canvas;
    }

    public get cc(): any {
        return global.cc;
    }
}

// export const ccApp = new CCApplication('GameCanvas');
