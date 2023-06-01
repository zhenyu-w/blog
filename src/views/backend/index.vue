<template>
    <a-layout class="backend-layout">
        <a-layout-sider
            v-model:collapsed="menuState.collapsed"
            :trigger="null"
            collapsible
            breakpoint="lg"
            @collapse="onSiderCollapse"
        >
            <!-- <img class="logo" src="@/assets/img/logo.png" /> -->
            <div class="logo"></div>
            <a-menu
                v-model:openKeys="menuState.openKeys"
                theme="dark"
                mode="inline"
                :selected-keys="selectedKeys"
                @click="onClickMenu"
            >
                <a-sub-menu v-for="sub in navs" :key="sub.key">
                    <template #icon>
                        <component :is="sub.icon" />
                    </template>
                    <template #title>
                        <span>{{ sub.title }}</span>
                    </template>
                    <template #default>
                        <a-menu-item v-for="child in sub.children" :key="child.key">{{
                            child.title
                        }}</a-menu-item>
                    </template>
                </a-sub-menu>
            </a-menu>
        </a-layout-sider>
        <a-layout>
            <a-layout-header class="right-header">
                <MenuUnfoldOutlined
                    v-if="menuState.collapsed"
                    class="trigger"
                    @click="toggleMenu"
                />
                <MenuFoldOutlined v-else class="trigger" @click="toggleMenu" />
                <HomeOutlined @click="goHome" />

                <a-dropdown v-model:visible="isDropdownVisible">
                    <a-avatar class="admin-avatar">T</a-avatar>

                    <template #overlay>
                        <a-menu @click="handleDropdownMenuClick">
                            <a-menu-item key="write">开始创作</a-menu-item>
                            <a-menu-item key="logout">退出登录</a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>
            </a-layout-header>
            <a-layout-content class="right-main">
                <router-view />
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>
<script setup lang="ts" name="backendIndex">
    import { MenuFoldOutlined, MenuUnfoldOutlined, HomeOutlined } from '@ant-design/icons-vue';
    import { computed, reactive, ref, watch } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useGlobalStore } from '@/store/global';
    import { NavItem, navs } from './navs';
    import { tree2Arr } from '@/utils/tree';

    interface MenuState {
        collapsed: boolean;
        openKeys: Array<string>;
        preOpenKeys: Array<string>;
    }

    const globalStore = useGlobalStore();
    const route = useRoute();
    const router = useRouter();
    const flatNavs = tree2Arr<NavItem>(navs);
    const calcOpenKeys = () => {
        const activeNav = flatNavs.find((item) => item.key === route.path);
        return activeNav?.parentKeys || [];
    };
    const initOpenKeys = calcOpenKeys();
    const menuState = reactive<MenuState>({
        collapsed: false,
        openKeys: initOpenKeys,
        preOpenKeys: initOpenKeys
    });

    // 监听openKeys的变化，记录preOpenKeys
    watch(
        () => menuState.openKeys,
        (val, oldVal) => {
            menuState.preOpenKeys = oldVal;
        }
    );
    // 路由的变化会，需要更新openKeys
    watch(
        () => route.path,
        () => {
            menuState.openKeys = calcOpenKeys();
        }
    );
    // 手动收起/展开菜单
    const toggleMenu = () => {
        menuState.collapsed = !menuState.collapsed;
        menuState.openKeys = menuState.collapsed ? [] : menuState.preOpenKeys;
    };
    // 侧边收起和展开事件
    const onSiderCollapse = (collapsed: boolean) => {
        menuState.collapsed = collapsed;
        menuState.openKeys = menuState.collapsed ? [] : menuState.preOpenKeys;
    };

    const selectedKeys = computed(() => [route.path]);
    // 点击菜单
    const onClickMenu = ({ key }: { key: string }) => {
        router.push(key);
    };
    // 导航栏右侧信息
    const isDropdownVisible = ref(false);
    // 点击用户下拉菜单
    const handleDropdownMenuClick = async ({ key }: { key: string }) => {
        switch (key) {
            case 'write':
                router.push('/backend/write');
                break;
            case 'logout':
                await globalStore.logoutAction();
                router.push('/');
                break;
        }
    };
    // 回到首页
    const goHome = () => {
        router.push('/');
    };
</script>
<style lang="less" scoped>
    .backend-layout {
        height: 100%;
    }

    .logo {
        max-width: 80%;
        height: 32px;
        display: block;
        margin: 16px auto;
    }

    .trigger {
        padding: 0 24px;
    }

    :deep(.right-header) {
        background: rgb(255, 255, 255);
        padding: 0;
        .anticon {
            font-size: 18px;
            transition: color 0.3s;
            &:hover {
                color: #1890ff;
            }
        }
        .admin-avatar {
            color: @color-primary;
            background-color: rgb(253, 227, 207);
            float: right;
            margin-right: 24px;
            margin-top: 16px;
        }
    }

    :deep(.right-main) {
        overflow-y: auto;
        padding: 24px;
        flex: 1;
    }

    :deep(.admin-page-wrapper) {
        padding: 20px;
        background: #fff;
    }
</style>
