import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Game from '../views/Game.vue';
import Game2 from '../views/Game2.vue';


export default createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: 'home',
            path: '/',
            component: Home,
        },

        {
            name: 'game',
            path: '/game',
            component: Game,
        },

        {
            name: 'game2',
            path: '/game2',
            component: Game2,
        },
    ],
});
