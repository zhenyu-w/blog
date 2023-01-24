<template>
    <base-layout>
        <section class="messages__wrapper">
            <div class="stats-info">
                <div class="msgs-stats">
                    已有<strong class="user-count">{{ userCount }}</strong
                    >人在这留下了痕迹
                </div>
                <div class="msgs-stats">
                    留言总数：<strong class="user-count">{{ messageTotal }}</strong
                    >条
                </div>
                <div v-if="commentUserInfo" class="modify-info" @click="showUserInfoForm">
                    个人信息有误？点击修改<EditOutlined style="margin-left: 6px" />
                </div>
            </div>
            <comments ref="commentsRef" topic="留言" :auto-load="false" place-top></comments>
        </section>
    </base-layout>
</template>
<script setup lang="ts" name="Messages">
    import { computed, onMounted, ref } from 'vue';
    import { EditOutlined } from '@ant-design/icons-vue';
    import Comments from '../article/comments.vue';
    import { commentService } from '@/services/comment';
    import { useGlobalStore } from '@/store/global';

    const globalStore = useGlobalStore();

    const commentUserInfo = computed(() => globalStore.commentUserInfo);

    const userCount = ref(0);
    const messageTotal = ref(0);

    // 获取留言总人数
    const getMessageUserCount = async () => {
        const res = await commentService.numberOfPeople();
        userCount.value = res.data;
    };

    // 获取留言总数
    const getMessageTotal = async () => {
        const res = await commentService.total();
        messageTotal.value = res.data;
    };

    // 修改个人信息
    const commentsRef = ref();
    const showUserInfoForm = () => {
        commentsRef.value.isEditUserInfoVisible = true;
    };

    onMounted(() => {
        getMessageUserCount();
        getMessageTotal();
    });
</script>
<style scoped lang="less">
    .msgs-stats {
        font-size: 12px;
        color: #999;
        text-align: center;
        padding-bottom: 10px;
    }

    .user-count {
        font-size: 16px;
        color: #333;
        font-weight: 700;
    }

    .modify-info {
        text-align: center;
        font-size: 10px;
        color: #999;
        margin-bottom: 10px;
        cursor: pointer;
    }

    :deep(.comment__wrapper) {
        box-shadow: 0 2px 12px rgb(7 17 27 / 12%);
    }
</style>
