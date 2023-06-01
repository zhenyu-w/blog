import { createRouter, createWebHistory, RouteRecordRaw, createWebHashHistory } from 'vue-router';
import { frontendRoute } from './frontend';
import { backendRoute } from './backend';
import { FALLBACK_ROUTE, NOT_FOUND_ROUTE } from './not-found';

const routes: Array<RouteRecordRaw> = [
    ...frontendRoute,
    backendRoute,
    NOT_FOUND_ROUTE,
    FALLBACK_ROUTE
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return {
                top: 0
            };
        }
    }
});

export default router;
