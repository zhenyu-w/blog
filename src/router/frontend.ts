/**
 * @author: zhenyu
 * @description: 前台路由
 */

import { RouteRecordRaw } from 'vue-router';

export const frontendRoute: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/frontend/home/index.vue'),
        meta: {
            auth: false,
            title: '首页'
        }
    },
    {
        path: '/categories',
        name: 'Categoryies',
        component: () =>
            import(/* webpackChunkName: "categories" */ '@/views/frontend/categories/index.vue'),
        meta: {
            auth: false,
            title: '所有分类'
        }
    },
    {
        path: '/category/:name',
        name: 'Category',
        component: () =>
            import(/* webpackChunkName: "category" */ '@/views/frontend/category/index.vue'),
        meta: {
            auth: false,
            title: '分类'
        }
    },
    {
        path: '/tags',
        name: 'Tags',
        component: () => import(/* webpackChunkName: "tags" */ '@/views/frontend/tags/index.vue'),
        meta: {
            auth: false,
            title: '所有标签'
        }
    },
    {
        path: '/tag/:name',
        name: 'Tag',
        component: () => import(/* webpackChunkName: "tag" */ '@/views/frontend/tag/index.vue'),
        meta: {
            auth: false,
            title: '标签'
        }
    },
    {
        path: '/timeline',
        name: 'Timeline',
        component: () =>
            import(/* webpackChunkName: "timeline" */ '@/views/frontend/timeline/index.vue'),
        meta: {
            auth: false,
            title: '时间轴'
        }
    },
    {
        path: '/article/:id',
        name: 'Article',
        component: () =>
            import(/* webpackChunkName: "article" */ '@/views/frontend/article/index.vue'),
        meta: {
            auth: false,
            title: '文章详情'
        }
    },
    {
        path: '/jumpout/:target',
        name: 'Jumpout',
        component: () =>
            import(/* webpackChunkName: "jumpout" */ '@/views/frontend/jumpout/index.vue'),
        meta: {
            auth: false,
            title: '即将离开博客'
        }
    },
    {
        path: '/messages',
        name: 'Messages',
        component: () =>
            import(/* webpackChunkName: "messages" */ '@/views/frontend/messages/index.vue'),
        meta: {
            auth: false,
            title: '留言'
        }
    },
    {
        path: '/chat',
        name: 'Chat',
        component: () => import(/* webpackChunkName: "chat" */ '@/views/frontend/chat/index.vue'),
        meta: {
            auth: false,
            title: '在线聊天室'
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import(/* webpackChunkName: "login" */ '@/views/frontend/login/index.vue'),
        meta: {
            auth: false,
            title: '登录'
        }
    }
];
