import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import VueGameBridge from './utils/vueGameBridge/VueGameBridge';
VueGameBridge.init();

createApp(App).use(router).mount('#app');
