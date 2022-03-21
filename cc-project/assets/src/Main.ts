import { Component, _decorator } from 'cc';
import VueGameBridge, { EnumBusEventType } from './utils/vueGameBridge/VueGameBridge';

const { ccclass, property } = _decorator;
@ccclass('Main')
export default class Main extends Component {
    onLoad() {
        VueGameBridge.init();
        VueGameBridge.emit(EnumBusEventType.gameStart);
    }
}
