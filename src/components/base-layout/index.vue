<template>
    <section
        class="base-layout__wrapper"
        :class="{
            slideInLeft: isMenuVisible,
            slideOutLeft: !isMenuVisible,
            'animated faster': isAnimationEnabled
        }"
        @animationend="onAnimationEnd"
    >
        <header class="base-layout__header">
            <router-link to="/" class="logo-wrap">
                <img src="@/assets/img/logo.png" />
            </router-link>
            <h3>前端blog</h3>
            <div class="icons-wrapper">
                <icon-svg
                    class="menu-toggle"
                    icon="menu"
                    title="打开菜单"
                    @click="onToggleMenu"
                ></icon-svg>
                <router-link v-if="isAuthed" to="/backend" class="adm-entry" title="进入后台">
                    <icon-svg icon="admin"></icon-svg>
                </router-link>
            </div>
        </header>
        <main class="base-layout__main">
            <slot />
        </main>
        <div v-show="isMenuVisible" class="mask" @click="onClickMask"></div>
        <base-menu :is-visible="isMenuVisible"></base-menu>
        <aside class="aside-icons">
            <slot name="aside" />
            <icon-svg
                v-show="isShowGoTopIcon"
                class="icon--aside"
                icon="arrow-up"
                @click="goToTop"
            ></icon-svg>
        </aside>
    </section>
</template>
<script setup lang="ts" name="BaseLayout">
    import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
    import { useGlobalStore } from '@/store/global';
    import { throttle } from 'lodash-es';
    import BaseMenu from './base-menu.vue';
    import { setScrollTop } from '@/utils/dom';

    const globalStore = useGlobalStore();
    const isAuthed = computed(() => globalStore.isAuthed);

    // 菜单部分
    const isMenuVisible = computed(() => globalStore.isMenuVisible);
    const isAnimationEnabled = ref(false);

    const onToggleMenu = () => {
        if (isAnimationEnabled.value === false) {
            isAnimationEnabled.value = true;
        }
        globalStore.setIsMenuVisible(!isMenuVisible.value);
    };

    const onAnimationEnd = () => {
        if (isMenuVisible.value === false) {
            isAnimationEnabled.value = false;
        }
    };

    const onClickMask = () => {
        hideMenu();
    };

    const hideMenu = () => globalStore.setIsMenuVisible(false);

    // goTop按钮
    const isShowGoTopIcon = ref(false);
    let hideTimer: number | null = null;

    const setHideTimer = () => {
        clearHideTimer();
        hideTimer = window.setTimeout(() => {
            isShowGoTopIcon.value = false;
        }, 5000);
    };
    const clearHideTimer = () => {
        if (hideTimer) {
            window.clearTimeout(hideTimer);
            hideTimer = null;
        }
    };

    const onScroll = () => {
        const currentScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        if (currentScrollTop > 300) {
            isShowGoTopIcon.value = true;
            setHideTimer();
        }
    };

    const onScrollThrottle = throttle(onScroll, 300, { leading: true });

    const addScrollListener = () => {
        document.addEventListener('scroll', onScrollThrottle, {
            passive: true
        });
    };

    const removeScrollListener = () => {
        document.removeEventListener('scroll', onScrollThrottle);
    };

    const goToTop = () => {
        setScrollTop({
            useAnimation: true
        });
    };

    onMounted(() => {
        addScrollListener();
        setHideTimer();
    });
    onBeforeUnmount(() => {
        hideMenu();
        removeScrollListener();
        clearHideTimer();
    });
</script>
<style scoped lang="less">
    .base-layout__wrapper {
        height: 100%;
    }
    .base-layout__header {
        padding: 18px 40px;
        background: linear-gradient(to bottom right, #2177a7, #5fb7ac);
        text-align: center;
        > h3 {
            margin: 20px 0;
            color: #eaeab3;
            font-size: 20px;
            font-weight: 400px;
            text-shadow: 0 1px 0 #2e2e2e, 0 2px 0 #2c2c2c, 0 3px 0 #2a2a2a, 0 4px 0 #282828,
                0 5px 0 #262626, 0 6px 0 #242424;
        }
    }
    .base-layout__main {
        padding: 24px 24px 0;
    }
    .logo-wrap {
        display: inline-block;
    }
    .icons-wrapper {
        position: absolute;
        top: 20px;
        left: 12px;
        .icon-svg {
            font-size: 24px;
            color: #fff;
            cursor: pointer;
        }
    }
    .adm-entry {
        margin-left: 8px;
    }
    .mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.24);
        z-index: 100;
    }
    .aside-icons {
        position: fixed;
        bottom: 160px;
        right: 24px;
        width: 50px;
        height: 50px;
    }
    @media screen and (min-width: 992px) {
        :deep(.base-layout__main) {
            width: 800px;
            margin: 0 auto;
        }
    }
</style>
