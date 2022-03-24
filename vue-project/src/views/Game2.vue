<script lang="ts" setup>
import VueGameBridge, { EnumBusEventType } from "../utils/vueGameBridge/VueGameBridge";
import { onMounted, onBeforeUnmount, onActivated, onDeactivated } from "vue";
import CCApplication2 from "../utils/cc/CCApplication2";
import settings from "../data/cc-project-game-settings2.json";
import router from "../router";

let gameApp: CCApplication2 | undefined;
const onGameStart = (data: any) => {
  console.log("收到gameStart", data);
};

const onTestEvent = () => {
  VueGameBridge.callHandler("vuedivclick");
};
const onBackHome = () => {
  router.push("/");
};

onMounted(() => {
  gameApp = new CCApplication2("GameCanvas", "cc-project2", settings);
  gameApp.startUp();
});

 onBeforeUnmount(() => {
        gameApp?.pauseAndRelease();
        gameApp = undefined;
    });

    onActivated(() => {
        VueGameBridge.on(EnumBusEventType.gameStart, onGameStart);
        VueGameBridge.on(EnumBusEventType.backHome, onBackHome);
        gameApp?.resumeAndRestart();
    });

    onDeactivated(() => {
        VueGameBridge.remove(EnumBusEventType.gameStart, onGameStart);
        VueGameBridge.remove(EnumBusEventType.backHome, onBackHome);
        gameApp?.pauseAndRelease();
    });
</script>

<template>
  <div>
    <canvas id="GameCanvas" oncontextmenu="event.preventDefault()" tabindex="0"></canvas>
  </div>
</template>

<style scoped>
#GameCanvas {
  width: 100vw;
  height: 100vh;
}
</style>
