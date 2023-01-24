import { App } from 'vue';

import BaseLayout from './base-layout/index.vue';
import IconSvg from './icon-svg/index.vue';
import ZhImag from './zh-img/index.vue';
import ButtomTips from './bottom-tips/index.vue';

// 全局注册组件
export default {
    install(app: App): App {
        // 只注册需要的全局组件就可以了
        // const componentsContext = import.meta.glob('../components/*/index.vue');
        // 拿到目录名字，自己拼接
        // console.log(Object.entries(componentsContext));
        app.component('BaseLayout', BaseLayout);
        app.component('IconSvg', IconSvg);
        app.component('ZhImag', ZhImag);
        app.component('ButtomTips', ButtomTips);
        return app;
    }
};
