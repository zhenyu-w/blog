import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import * as path from 'path';
import theme from './src/styles/antd-theme.js';

const proxyContext = [
    '/article/',
    '/category/',
    '/comment/',
    '/reply/',
    '/tag/',
    '/user/',
    '/validator/'
];
const proxyTable = {};
const proxyTarget = 'http://localhost:3000';
proxyContext.forEach((item) => {
    proxyTable[item] = {
        target: proxyTarget,
        changeOrigin: true
    };
});

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        //设置别名
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    plugins: [
        vue(),
        VueSetupExtend(),
        Components({
            // 如果需要自定义主题色，则需要配置importStyle: 'less',并安装less: npm install less --save-dev
            resolvers: [AntDesignVueResolver({ importStyle: 'less' })]
        })
    ],
    server: {
        port: 8080, //启动端口
        hmr: {
            host: 'localhost',
            port: 8080
        },
        // 设置代理
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    css: {
        preprocessorOptions: {
            less: {
                // 按需定制 antd 主题
                modifyVars: theme,
                javascriptEnabled: true, // 此变量必须为true, 否则antd按需加载会报错，原因为less在3.0之后将该变量设为false
                additionalData: `@import "${path.resolve(__dirname, './src/styles/preload.less')}";`
            }
        }
    }
});
