<template>
    <section class="admin-page-wrapper">
        <a-table
            row-key="id"
            :data-source="articleList"
            :columns="columns"
            :loading="loading"
            :scroll="{ x: 1500 }"
            :pagination="pagination"
        >
            <template #bodyCell="{ column, record, index }">
                <template v-if="column.dataIndex === 'article_name'">
                    <RouterLink :to="`/article/${record.id}`">{{ record.article_name }}</RouterLink>
                </template>
                <template v-else-if="column.dataIndex === 'poster'">
                    <zh-img class="articlePoster" :img-src="record.poster" />
                </template>
                <template v-else-if="column.dataIndex === 'create_time'">
                    {{ format(record.create_time) }}
                </template>
                <template v-else-if="column.dataIndex === 'update_time'">
                    {{ format(record.update_time) }}
                </template>
                <template v-else-if="column.dataIndex === 'action'">
                    <a-space>
                        <a-button
                            size="small"
                            type="primary"
                            ghost
                            :loading="index === activeIndex && isPrivateLoading"
                            @click="onClickPrivate(record, index)"
                            >{{ record.private == 1 ? '公开' : '私密' }}</a-button
                        >
                        <a-button size="small" type="primary" ghost @click="onClickEdit(record)"
                            >编辑</a-button
                        >
                        <a-button
                            size="small"
                            :type="record.deleted == 1 ? 'primary' : 'danger'"
                            ghost
                            @click="onClickLogicDel(record)"
                            >{{ record.deleted == 1 ? '逻辑恢复' : '逻辑删除' }}</a-button
                        >
                        <a-button size="small" type="danger" ghost @click="onClickDel(record)"
                            >物理删除</a-button
                        >
                    </a-space>
                </template>
            </template>
        </a-table>
    </section>
</template>
<script setup lang="ts" name="AritlceAdmin">
    import { getCurrentInstance, ComponentInternalInstance, onMounted, reactive, ref } from 'vue';
    import { RouterLink, useRouter } from 'vue-router';
    import { ArticleDTO } from '@/bean/dto';
    import { articleService } from '@/services/article';
    import { useAsyncLoading } from '@/hooks/async';
    import { format } from '@/utils/date-utils';

    const router = useRouter();
    const { appContext } = getCurrentInstance() as ComponentInternalInstance;
    const globalProxy = appContext.config.globalProperties;

    const articleList = ref<ArticleDTO[]>([]);

    const pagination = reactive({
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: (total: number) => `共计${total}条`,
        onChange: (page: number) => {
            pagination.current = page;
            search();
        }
    });

    // 分页查询
    const handleGetArticles = async () => {
        const res = await articleService.pageAdmin({
            pageNo: pagination.current,
            pageSize: pagination.pageSize
        });
        articleList.value = res.data;
        pagination.total = res.total;
    };

    const { trigger: search, loading } = useAsyncLoading(handleGetArticles);

    onMounted(() => {
        search();
    });

    // 处理私密
    const activeIndex = ref(-1);
    const handlePrivate = async (record: ArticleDTO, index: number) => {
        activeIndex.value = index;
        await articleService.updatePrivate({
            id: record.id,
            private: record.private === 0 ? 1 : 0
        });
        globalProxy.$message.success('操作成功');
        search();
    };

    const { trigger: onClickPrivate, loading: isPrivateLoading } = useAsyncLoading(handlePrivate);

    // 处理逻辑删除
    const onClickLogicDel = (record: ArticleDTO) => {
        const isDeleted = record.deleted === 1;
        globalProxy.$Modal.confirm({
            title: `确认要执行${isDeleted ? '逻辑恢复' : '逻辑删除'}吗？`,
            onOk: async () => {
                await articleService.updateDeleted({
                    id: record.id,
                    deleted: isDeleted ? 0 : 1
                });
                globalProxy.$message.success('操作成功');
                search();
            }
        });
    };

    // 处理物理删除
    const onClickDel = (record: ArticleDTO) => {
        globalProxy.$Modal.confirm({
            title: '确认要删除吗？',
            onOk: async () => {
                await articleService.delete(record.id);
                globalProxy.$message.success('操作成功');
                pagination.current = 1;
                search();
            }
        });
    };

    const onClickEdit = (record: ArticleDTO) => {
        router.push(`/backend/article/edit/${record.id}`);
    };

    const columns = ref([
        {
            title: '文章',
            width: '160px',
            dataIndex: 'article_name',
            ellipsis: true
        },
        {
            title: '封面',
            width: '140px',
            dataIndex: 'poster'
        },
        {
            title: '作者',
            width: '80px',
            dataIndex: 'author'
        },
        {
            title: '阅读量',
            width: '120px',
            dataIndex: 'read_num'
        },
        {
            title: '创建时间',
            width: '140px',
            dataIndex: 'create_time'
        },
        {
            title: '更新时间',
            width: '140px',
            dataIndex: 'update_time'
        },
        {
            title: '操作',
            width: '300px',
            dataIndex: 'action',
            fixed: 'right'
        }
    ]);
</script>
<style scoped lang="less">
    .articlePoster {
        width: 160px;
        height: 92px;
        > img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }
</style>
