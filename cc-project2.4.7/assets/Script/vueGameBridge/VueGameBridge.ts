import { Method } from './Method';
export enum EnumBusEventType {
    gameStart = 'gameStart',
    getToken = 'getToken',
    getUserInfo = 'getUserInfo',
    getStore = 'getStore',
    backHome = 'backHome'
}
const global = window as any;

export default class VueGameBridge {
    private static eventMap: Map<string, Set<Method>>;

    public static init() {
        if (!global.eventMap) {
            global.eventMap = new Map();
        }

        if (!global.ccBus) {
            global.ccBus = VueGameBridge;
        }

        this.eventMap = global.eventMap;
    }

    public static ready() {
        return new Promise((resolve, reject) => {
            if (global.vueBus) {
                resolve(global.vueBus);
            } else {
                reject('vueBus未注册');
            }
        });
    }

    /**
     * 调用对方
     */
    public static callHandler(
        handName: string,
        param?: Record<string, any> | string,
        callback?: Function,
        thisArg?: any,
    ) {
        this.ready().then((bus: any) => {
            bus.onCallHandler(handName, param, callback, thisArg);
        });
    }

    /**
     * 对方调用
     */
    public static onCallHandler(
        handName: string,
        param?: Record<string, any> | string,
        callback?: Function,
        thisArg?: any,
    ) {
        console.log('Vue调用游戏, 收到：', handName, param, callback, thisArg);
    }

    public static on(type: string, callback: Function, thisArg?: any, once?: boolean) {
        let set = this.eventMap.get(type);
        if (!set) {
            this.eventMap.set(type, (set = new Set()));
        }

        const method = new Method(callback, thisArg, undefined, once);

        set.add(method);
    }

    public static once(type: string, callback: Function, thisArg?: any) {
        this.on(type, callback, thisArg, true);
    }

    public static emit(type: string, data?: any) {
        const set = this.eventMap.get(type);
        if (set) {
            set.forEach((method) => {
                if (method) {
                    method.applyWith(data);

                    if (method.once) {
                        this.remove(type, method.func, method.args);
                    }
                }
            });
        }
    }

    public static remove(type: string, callback: Function, thisArg?: any) {
        const method = new Method(callback, thisArg);
        const set = this.eventMap.get(type);
        if (set) {
            for (const item of set) {
                if (item.equal(method)) {
                    set.delete(item);
                    return;
                }
            }
        }
    }
}
