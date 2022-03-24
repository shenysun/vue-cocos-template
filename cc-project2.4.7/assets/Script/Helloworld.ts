import VueGameBridge, { EnumBusEventType } from "./vueGameBridge/VueGameBridge";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    onLoad() {
        VueGameBridge.init();
        VueGameBridge.emit(EnumBusEventType.gameStart);
    }
    start() {
        // init logic
        this.label.string = this.text;
    }
    onBackHome() {
        VueGameBridge.callHandler(EnumBusEventType.backHome, 'backHome', () => {
            console.log('backHome success');
        });
        VueGameBridge.emit(EnumBusEventType.backHome);
    }
}
