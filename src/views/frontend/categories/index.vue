<template>
    <base-layout>
        <h2>文章分类</h2>
        <a-skeleton :loading="loading" active :paragraph="{ rows: 10 }">
            <a-row v-if="categoryList.length > 0" class="category__list" :gutter="16">
                <a-col
                    v-for="category in categoryList"
                    :key="category.id"
                    :span="8"
                    :md="6"
                    :lg="4"
                >
                    <router-link
                        class="block"
                        :to="{ name: 'Category', params: { name: category.category_name } }"
                    >
                        <a-badge class="block" :count="category.category_count">
                            <div class="category__card">
                                <zh-img
                                    :img-src="category.poster || defaultCategoryPoster"
                                    class="category__poster"
                                />
                                <div class="category__title">
                                    {{ category.category_name }}
                                </div>
                            </div>
                        </a-badge>
                    </router-link>
                </a-col>
            </a-row>
        </a-skeleton>
    </base-layout>
</template>
<script setup lang="ts" name="categories">
    import { CategoryDTO } from '@/bean/dto';
    import { categoryService } from '@/services/category';
    import { useAsyncLoading } from '@/hooks/async';
    import { onMounted, ref } from 'vue';
    import defaultCategoryPoster from '@/assets/img/default_category.svg';

    const categoryList = ref<CategoryDTO[]>([]);
    const handleGetAllCategory = async () => {
        const res = await categoryService.all({ getCount: true });
        categoryList.value = res.data;
    };
    const { trigger: getCategoryList, loading } = useAsyncLoading(handleGetAllCategory);
    onMounted(() => {
        getCategoryList();
    });
</script>
<style scoped lang="less">
    :deep(.base-layout__main) {
        padding: 24px 18px;
        background-color: #f5f5f5;
    }
    :deep(.card-hot) {
        margin: 24px 18px;
    }
    h2 {
        margin: 0;
        text-align: center;
    }

    .category__card {
        position: relative;
        margin-top: 20px;
        background-color: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
        > img {
            object-fit: cover;
        }
    }
    :deep(.category__poster) {
        width: 100%;
        height: 120px;
    }
    .category__title {
        text-align: center;
        font-size: 14px;
        color: #666;
        padding-bottom: 4px;
    }

    @media screen and (min-width: 992px) {
        :deep(.base-layout__main) {
            background-color: transparent;
        }
    }
</style>
