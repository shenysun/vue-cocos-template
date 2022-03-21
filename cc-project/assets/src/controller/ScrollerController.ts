import { _decorator, Component, ScrollView, ScrollViewComponent, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScrollerController')
export class ScrollerController extends Component {
    @property(ScrollView)
    private scrollView!: ScrollView;
    @property(Sprite)
    private contentBg!: Sprite;

    onLoad() {
        this.updateScrollViewBg();
        console.log('================  onLoad');
        this.scrollView.node.on(ScrollViewComponent.EventType.SCROLLING, this.onSrcolling, this);
    }

    onDisable() {
        console.log('================  onDisable');
    }

    onDestroy() {
        console.log('================  onDestroy');
    }

    private updateScrollViewBg() {
        const { x: offsetX, y: offsetY } = this.scrollView.getScrollOffset();
        this.contentBg.node.setPosition(offsetX, offsetY);
    }

    private onSrcolling(): void {
        this.updateScrollViewBg();
    }
}
