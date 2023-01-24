<template>
    <base-layout>
        <template #default>
            <a-skeleton :loading="loading" active avatar :paragraph="{ rows: 20 }">
                <article v-if="article">
                    <header class="article__header">
                        <img class="avatar" src="@/assets/img/avatar.jpg" />
                        <div class="article__infos">
                            <span class="author">振宇</span>
                            <sup class="role-tag">博主</sup>
                            <div>
                                <time>发布于{{ formattedTime }}</time>
                                <span class="read_total"
                                    >阅读&nbsp;&nbsp;{{ article.read_num }}</span
                                >
                            </div>
                        </div>
                    </header>
                    <main class="article__main">
                        <zh-img :img-src="article.poster" />
                        <h2>
                            {{ article.article_name }}
                        </h2>
                        <section class="md-preview" v-html="purifiedContent"></section>
                    </main>
                </article>
                <a-empty v-else />
            </a-skeleton>
            <div class="pre-next-wrap">
                <div v-if="prevArticle" class="prev">
                    <SwapLeftOutlined />
                    <span>上一篇：</span>
                    <router-link :to="`/article/${prevArticle.id}`">
                        <span>{{ prevArticle.article_name }}</span>
                    </router-link>
                </div>
                <div v-if="nextArticle" class="next">
                    <SwapRightOutlined />
                    <span>下一篇：</span>
                    <router-link :to="`/article/${nextArticle.id}`">
                        <span>{{ nextArticle.article_name }}</span>
                    </router-link>
                </div>
                <div class="comment__trigger">
                    <a-button type="primary" @click="isCommentVisible = true">查看评论</a-button>
                </div>
                <a-drawer
                    width="84%"
                    class="drawer-comment"
                    :visible="isCommentVisible"
                    @close="isCommentVisible = false"
                >
                    <template #title>
                        <span>评论区</span>
                        <EditOutlined style="margin-left: 10px" @click="showUserInfoForm" />
                    </template>

                    <Comments ref="commentsRef" :article-id="articleId" />
                </a-drawer>
            </div>
        </template>
        <template #aside>
            <icon-svg v-if="isAuthed" class="icon--aside" icon="edit" @click="goToEdit"></icon-svg>
            <icon-svg
                class="icon--aside icon-message"
                icon="leave-message"
                @click="isCommentVisible = true"
            ></icon-svg>
        </template>
    </base-layout>
</template>
<script setup lang="ts" name="Article">
    import marked from 'marked';
    // hljs按需加载
    import hljs from 'highlight.js/lib/core';
    import javascript from 'highlight.js/lib/languages/javascript';
    import html from 'highlight.js/lib/languages/xml';
    import css from 'highlight.js/lib/languages/css';
    import shell from 'highlight.js/lib/languages/shell';
    import json from 'highlight.js/lib/languages/json';
    import plaintext from 'highlight.js/lib/languages/plaintext';
    import 'highlight.js/styles/atom-one-dark.css';
    import { useRoute, useRouter } from 'vue-router';
    import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
    import { maxBy, minBy } from 'lodash-es';
    import { SwapLeftOutlined, SwapRightOutlined, EditOutlined } from '@ant-design/icons-vue';
    import { useGlobalStore } from '@/store/global';
    import Comments from './comments.vue';
    import { setScrollTop } from '@/utils/dom';
    import { articleService } from '@/services/article';
    import { useAsyncLoading } from '@/hooks/async';
    import { format } from '@/utils/date-utils';
    import DOMPurify from 'dompurify';

    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('html', html);
    hljs.registerLanguage('css', css);
    hljs.registerLanguage('shell', shell);
    hljs.registerLanguage('json', json);
    hljs.registerLanguage('plaintext', plaintext);

    const globalStore = useGlobalStore();
    const isAuthed = computed(() => globalStore.isAuthed);

    const route = useRoute();
    const router = useRouter();

    const articleId = computed(() => Number(route.params.id));
    const article = ref();
    const formattedTime = computed(
        () => article.value && format(article.value.create_time, 'YYYY年M月D日')
    );
    const purifiedContent = ref('');
    let reportTimer: NodeJS.Timeout | null = null;
    const getArticleDetail = async () => {
        const res = await articleService.detail(articleId.value);

        article.value = res.data;

        const markedContent = marked(res.data.article_text);

        // 防XSS
        purifiedContent.value = DOMPurify.sanitize(markedContent);

        startReportTimer();
    };
    const { trigger: getDetail, loading } = useAsyncLoading(getArticleDetail);
    const startReportTimer = () => {
        reportTimer = setTimeout(() => {
            articleService.updateReadNum(article.value.id);
        }, 5000);
    };
    const clearReportTimer = () => {
        if (reportTimer) {
            clearTimeout(reportTimer);
            reportTimer = null;
        }
    };
    const setMarkedOptions = () => {
        const renderer = new marked.Renderer();
        renderer.link = function customLink(href: any, title: any, text: any) {
            return `<a class="link" href="${href}" target="_blank" title="${text}">${text}</a>`;
        };
        renderer.image = function customImage(href: any, title: any, text: any) {
            return (
                `<a class="img-wrapper" href="${href}" target="_blank" title="${text}">` +
                `<img src="${href}" alt="${text}">` +
                '</a>'
            );
        };
        marked.setOptions({
            renderer,
            highlight: function (code: string, lang: string) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            },
            pedantic: false,
            gfm: true,
            breaks: false,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            xhtml: false
        });
    };

    // 前后文章
    const prevArticle = ref();
    const nextArticle = ref();

    const getPreAndNexArticle = async () => {
        const res = await articleService.neighbors(articleId.value);
        const results = res.data;
        if (results.length > 0) {
            switch (results.length) {
                case 1:
                    const singleArticle = results[0];
                    singleArticle.id < articleId.value
                        ? (prevArticle.value = singleArticle)
                        : (nextArticle.value = singleArticle);
                    break;
                case 2:
                    prevArticle.value = minBy(results, 'id');
                    nextArticle.value = maxBy(results, 'id');
                    break;
            }
        }
    };

    // 评论
    const isCommentVisible = ref(false);

    // 修改个人信息
    const commentsRef = ref();
    const showUserInfoForm = () => {
        commentsRef.value.isEditUserInfoVisible = true;
    };

    // 去编辑页
    const goToEdit = () => {
        router.push(`/backend/article/edit/${articleId.value}`);
    };

    onMounted(() => {
        setScrollTop();
        setMarkedOptions();
        getDetail();
        getPreAndNexArticle();
    });

    onBeforeUnmount(() => {
        clearReportTimer();
    });
</script>
<style scoped lang="less">
    .avatar {
        width: 48px;
        border-radius: 50%;
        vertical-align: middle;
    }

    .article__infos {
        margin-left: 14px;
        display: inline-block;
        vertical-align: top;
        color: #999;
        font-size: 14px;
        .author {
            font-size: 18px;
            font-weight: 700;
            color: #333;
        }
        .role-tag {
            margin-left: 6px;
            background: #1989fa;
            padding: 0 4px;
            border-radius: 4px;
            color: #fff;
            font-size: 12px;
            display: inline-block;
            line-height: 1.5;
        }
        .read_total {
            margin-left: 8px;
        }
    }
    .article__main {
        > h2 {
            margin: 0 0 0.6em 0;
            font-size: 1.8em;
        }
    }
    :deep(.icon-svg + .icon-svg) {
        margin-left: 0;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        100% {
            transform: scale(1.1);
        }
    }

    .anim-pulse {
        will-change: transform;
        animation: pulse 0.6s ease-in-out infinite alternate;
    }

    :deep(.icon-message) {
        > svg {
            .anim-pulse();
        }
    }
    .pre-next-wrap {
        margin-top: 10px;
    }

    .prev,
    .next {
        padding: 6px 10px;
        border-radius: 2px;
        box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    }

    .prev + .next {
        margin-top: 20px;
    }
</style>
<style lang="less" scoped src="./md-render.less"></style>
