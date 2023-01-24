import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import { useGlobalStore } from './store/global';
import globalDirectives from './directives';
import globalComponents from './components';
import Cookies from 'js-cookie';

import infiniteScroll from 'vue3-infinite-scroll-better';
import { Modal, message } from 'ant-design-vue';
import 'ant-design-vue/es/message/style/css';
import 'ant-design-vue/es/modal/style/css';
import './styles/index.less';
import { init } from './utils/date-utils';
init();

// 创建vue实例
const app = createApp(App);
app.config.globalProperties.$Modal = Modal;
app.config.globalProperties.$message = message;

app.use(store);
app.use(router);
app.use(infiniteScroll);
app.use(globalDirectives);
app.use(globalComponents);

const globalStore = useGlobalStore();
globalStore.checkAuthState();

const clearUserInfo = () => {
    globalStore.setUserInfo(null);
};

router.beforeEach((to, from, next) => {
    if (to.meta.auth) {
        const isLogin = Cookies.get('islogined');
        if (isLogin === '1') {
            next();
        } else {
            clearUserInfo();
            next('/login');
        }
    } else {
        next();
    }
});

// 挂载实例
app.mount('#app');
