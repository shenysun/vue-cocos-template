import { Component, Event, _decorator } from 'cc';
import VueGameBridge, { EnumBusEventType } from './utils/vueGameBridge/VueGameBridge';
const { ccclass, property } = _decorator;

@ccclass('TestEvent')
export default class TestEvent extends Component {
    public onTestBtnClick(evt: Event, type: string | number) {
        type = +type;
        switch (type) {
            case 1:
                VueGameBridge.callHandler(EnumBusEventType.getStore, 'store', () => {
                    console.log('getstore success');
                });
                break;
            case 2:
                VueGameBridge.callHandler(EnumBusEventType.getToken, 'store', () => {
                    console.log('getstore success');
                });
                break;
        }
    }
}
