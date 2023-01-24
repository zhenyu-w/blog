<template>
    <base-layout>
        <a-skeleton :loading="loading" active :paragraph="{ row: 12 }">
            <template v-if="articleList.length > 0">
                <section class="article-list">
                    <card-article
                        v-for="article in articleList"
                        :key="article.id"
                        :article="article"
                    >
                    </card-article>
                </section>
                <a-pagination
                    v-model:current="pageInfo.pageNo"
                    v-model:pageSize="pageInfo.pageSize"
                    class="pagination-common"
                    :total="total"
                    show-less-items
                    @change="onPageNoChange"
                >
                </a-pagination>
            </template>
            <template v-else>
                <a-empty></a-empty>
            </template>
        </a-skeleton>
    </base-layout>
</template>
<script setup lang="ts" name="Home">
    import { reactive, ref, watch } from 'vue';
    import { LocationQuery, useRoute, useRouter } from 'vue-router';
    import { ArticleDTO } from '@/bean/dto';
    import { articleService } from '@/services/article';
    import { setScrollTop } from '@/utils/dom';
    import { useAsyncLoading } from '@/hooks/async';
    import CardArticle from '@/components/card/card-article.vue';

    const route = useRoute();
    const router = useRouter();

    const articleList = ref<ArticleDTO[]>([]);
    const pageInfo = reactive({
        pageNo: 1,
        pageSize: 6
    });
    const total = ref(0);
    const handleGetAriticleList = async (isChangePage: boolean) => {
        const res = await articleService.page(pageInfo);
        articleList.value = res.data;
        total.value = res.total;
        if (isChangePage) {
            setScrollTop({
                useAnimation: true,
                duration: 0.3
            });
        }
    };

    const { trigger: getPageList, loading } = useAsyncLoading(handleGetAriticleList);

    watch(
        () => route.query,
        (val: LocationQuery, oldVal) => {
            const { pageNo } = val;
            if (pageNo) {
                pageInfo.pageNo = Number(pageNo);
            } else {
                pageInfo.pageNo = 1;
            }
            const isChangePage = pageNo !== oldVal?.pageNo;
            getPageList(isChangePage);
        },
        { immediate: true }
    );

    const onPageNoChange = (page: number) => {
        router.push({
            query: {
                path: '/',
                pageNo: String(page)
            }
        });
    };
</script>
<style scoped lang="less"></style>
