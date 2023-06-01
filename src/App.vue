<template>
    <a-config-provider :locale="zhCN">
        <section class="wrapper" :class="{ 'hidden-x': isMenuVisible, 'is-admin': isAdmin }">
            <router-view :key="$route.path" />
        </section>
    </a-config-provider>
</template>
<script setup lang="ts" name="App">
    import { computed } from 'vue';
    import zhCN from 'ant-design-vue/es/locale/zh_CN';
    import { useRoute } from 'vue-router';
    import { useGlobalStore } from './store/global';

    const globalStore = useGlobalStore();
    const route = useRoute();

    const isAdmin = computed(() => route.meta.isAdmin as boolean);
    const isMenuVisible = computed(() => globalStore.isMenuVisible);
</script>
<style scoped lang="less">
    .wrapper {
        height: 100%;
    }
    .hidden-x {
        overflow: hidden;
    }
    .is-admin {
        height: 100%;
    }
</style>
