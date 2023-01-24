<template>
    <div class="comment__wrapper">
        <zh-img class="acomment__avatar" :img-src="formattedComment.avatar" />
    </div>
    <div class="comment__info">
        <a
            v-if="formattedComment.site_url"
            :href="formattedComment.jumpoutMiddleLink"
            class="comment__user"
            target="_blank"
            >{{ formattedComment.nick_name }}</a
        >
        <span v-else class="comment__time">{{ formattedComment.nick_name }}</span>
        <div class="comment__content">{{ formattedComment.content }}</div>
        <a-button class="btn-reply" icon="reply" size="small" @click="showReplyRoot">回复</a-button>
        <div v-if="isActive && isShowReplyInput" class="reply-form">
            <a-input
                ref="rootReplyInputRef"
                v-model:value="replyRootContent"
                size="small"
                :placeholder="replyPlaceHolder"
            />
            <a-button
                class="btn-confirm-reply"
                type="primary"
                size="small"
                :loading="isReplyRootLoading"
                @click="onClickReplyRoot"
                >发布</a-button
            >
        </div>
        <div v-if="formattedComment.replies.length > 0" class="reply__list">
            <div v-for="reply in formattedComment.replies" :key="reply.id" class="reply__card">
                <div class="reply__header">
                    <zh-img class="reply__avatar" :img-src="reply.avatar"></zh-img>

                    <div class="reply__subinfo">
                        <span class="reply__info"
                            >{{ reply.nick_name }}回复{{
                                reply.reply_name || formattedComment.nick_name
                            }}</span
                        >
                        <span class="reply__time">{{ reply.formattedTime }}</span>
                    </div>
                </div>

                <div class="reply__content">{{ reply.content }}</div>
                <my-button class="btn-reply" icon="reply" size="small" @click="showReplySub(reply)"
                    >回复</my-button
                >

                <div
                    v-if="isActive && reply.id === activeSubId && isShowSubReplyInput"
                    class="reply-form"
                >
                    <a-input
                        ref="subReplyInputRef"
                        v-model:value="subReplyForm.content"
                        size="small"
                        :placeholder="replyPlaceHolder"
                    />
                    <a-button
                        class="btn-confirm-reply"
                        type="primary"
                        size="small"
                        :loading="isReplySubLoading"
                        @click="onClickReplySub"
                        >发布</a-button
                    >
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts" name="CardComment">
    import {
        computed,
        nextTick,
        PropType,
        reactive,
        ref,
        getCurrentInstance,
        ComponentInternalInstance
    } from 'vue';
    import dayjs from 'dayjs';
    import { useGlobalStore } from '@/store/global';
    import DOMPurify from 'dompurify';
    import { CommentDTO, ReplyDTO } from '@/bean/dto';
    import { format } from '@/utils/date-utils';
    import { useAsyncLoading } from '@/hooks/async';
    import { replyService } from '@/services/reply';
    import avatarFallback from '@/assets/img/comment-avatar.svg';
    import replyAvatarFallback from '@/assets/img/reply-avatar.svg';

    const { appContext } = getCurrentInstance() as ComponentInternalInstance;
    const globalProxy = appContext.config.globalProperties;
    const props = defineProps({
        comment: {
            type: Object as PropType<CommentDTO>,
            require: true,
            default: () => {
                return {};
            }
        },
        isActive: {
            type: Boolean,
            default: false
        }
    });
    const emits = defineEmits(['userInfoEmpty', 'setActive']);
    const globalStore = useGlobalStore();
    const commentUserInfo = computed(() => globalStore.commentUserInfo);
    const replyRootContent = ref('');
    const replyPlaceHolder = ref('');
    const isShowReplyInput = ref(false);
    const rootRelyInputRef = ref();

    // 显示以及回复
    const showReplyRoot = () => {
        if (!commentUserInfo.value) {
            emits('userInfoEmpty');
        } else {
            emits('setActive');
            replyPlaceHolder.value = `@ ${props.comment.nick_name}`;
            isShowReplyInput.value = true;
            isShowSubReplyInput.value = false;
            nextTick(() => {
                rootRelyInputRef.value.focus();
            });
        }
    };
    // 对评论做回复
    const handleReplyRoot = async () => {
        if (!replyRootContent.value) {
            globalProxy.$message.warning('您还未输入任何内容！');
            return;
        }
        const purifiedContent = DOMPurify.sanitize(replyRootContent.value);
        if (!purifiedContent) {
            globalProxy.$message.warning('您的输入内容无效，请重新输入合法内容！');
            return;
        }
        await replyService.add({
            // 回复的评论id
            comment_id: props.comment.id,
            // 父级回复的id，这里是一级回复表单，所以为null即可
            parent_id: null,
            // 默认是待审核状态
            approved: 0,
            // 记录网页的url，用于发邮件时附上链接
            jump_url: window.location.href,
            // 文章id
            article_id: props.comment.article_id,
            // 回复内容
            content: purifiedContent,
            // 用户信息
            ...commentUserInfo
        });
        globalProxy.$Modal.success({
            title: '温馨提示',
            content: '您的回复已经提交成功，待审核后即可生效！'
        });

        isShowReplyInput.value = false;
        replyRootContent.value = '';
    };

    const { trigger: onClickReplyRoot, loading: isReplyRootLoading } =
        useAsyncLoading(handleReplyRoot);

    // 二级回复相关
    const isShowSubReplyInput = ref(false);
    const subReplyInputRef = ref();
    const activeSubId = ref(-1);

    // 显示二级回复
    const subReplyForm = reactive({
        content: '',
        parent_id: -1
    });

    const showReplySub = (parentReply: ReplyDTO) => {
        if (!commentUserInfo.value) {
            emits('userInfoEmpty');
        } else {
            emits('setActive', props.comment.id);
            activeSubId.value = parentReply.id;
            replyPlaceHolder.value = `@ ${parentReply.nick_name}`;
            isShowReplyInput.value = false;
            isShowSubReplyInput.value = true;

            // 重置输入框内容
            subReplyForm.content = '';
            // 给二级回复的parent_id赋值
            subReplyForm.parent_id = parentReply.id;
            nextTick(() => {
                subReplyInputRef.value.focus();
            });
        }
    };

    // 对回复做回复
    const handleReplySub = async () => {
        if (!subReplyForm.content) {
            // 必填校验
            globalProxy.$message.warning('您还未输入任何内容！');
            return;
        }
        const purifiedContent = DOMPurify.sanitize(subReplyForm.content);
        if (!purifiedContent) {
            // 输入了非法的内容
            globalProxy.$message.warning('您的输入内容无效，请重新输入合法内容！');
            return;
        }
        await replyService.add({
            // 回复的评论id
            comment_id: props.comment.id,
            // 父级回复的id
            parent_id: subReplyForm.parent_id,
            // 默认是待审核状态
            approved: 0,
            // 记录网页的url，用于发邮件时附上链接
            jump_url: window.location.href,
            // 文章id
            article_id: props.comment.article_id,
            // 回复内容
            content: purifiedContent,
            // 用户信息
            ...globalStore.commentUserInfo
        });

        globalProxy.$Modal.success({
            title: '温馨提示',
            content: '您的回复已经提交成功，待审核后即可生效！'
        });

        isShowSubReplyInput.value = false;
        subReplyForm.content = '';
        subReplyForm.parent_id = -1;
    };

    const { trigger: onClickReplySub, loading: isReplySubLoading } =
        useAsyncLoading(handleReplySub);
    const formattedComment = computed(() => {
        const comment = props.comment;
        return {
            ...comment,
            avatar: comment.avatar || avatarFallback,
            formattedTime: format(comment.create_time, 'YYYY年M月D日 HH:mm:ss'),
            jumpoutMiddleLink: comment.site_url
                ? `/jumpout/${encodeURIComponent(comment.site_url)}`
                : '',
            replies: comment.replies.map((reply) => {
                return {
                    ...reply,
                    avatar: reply.avatar || replyAvatarFallback,
                    formattedTime: dayjs(reply.create_time).fromNow()
                };
            })
        };
    });
</script>
<style scoped lang="less">
    .comment__wrapper {
        display: flex;
        padding: 8px 12px;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 26px rgb(7 17 27 / 12%);
    }

    :deep(.comment__avatar) {
        width: 40px;
        height: 40px;
        > img {
            height: 100%;
            border-radius: 100%;
            object-fit: cover;
        }
    }
    .comment__info {
        flex: 1;
        margin-left: 6px;
    }
    .comment__user {
        color: #5079b7;
        font-size: 16px;
    }
    .comment__time {
        display: block;
        font-size: 12px;
        color: #999;
    }
    .comment__content {
        color: #333;
        font-size: 16px;
        padding-bottom: 4px;
    }

    .reply__list {
        margin-top: 10px;
        border-top: 1px solid #ccc;
    }
    .reply__card {
        text-align: left;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }

    .reply__header {
        display: flex;
    }

    :deep(.reply__avatar) {
        width: 24px;
        height: 24px;
        > img {
            height: 100%;
            border-radius: 100%;
            object-fit: cover;
        }
    }

    .reply__subinfo {
        margin-left: 4px;
        padding-top: 4px;
        display: flex;
        font-size: 12px;
    }

    .reply__info {
        flex: 1;
        .one-line-ellipsis();
    }

    .reply__time {
        margin-left: 4px;
        color: #999;
    }

    .reply__content {
        margin-bottom: 4px;
        color: #333;
        font-size: 16px;
    }

    :deep(.btn-reply) {
        font-size: 12px;
    }

    .reply-form {
        margin-top: 10px;
        display: flex;
        align-items: center;
    }

    :deep(.btn-confirm-reply) {
        margin: 0 0 0 10px;
        font-size: 12px;
        height: 20px;
        padding: 0 4px;
    }
</style>
