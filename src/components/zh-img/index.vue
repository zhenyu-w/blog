<template>
    <div class="article__poster">
        <img v-lazyload="imgSrc" class="img__inner" />
    </div>
</template>
<script setup lang="ts" name="ZhImag">
    import avatarFallback from '@/assets/img/comment-avatar.svg';
    defineProps({
        imgSrc: {
            type: String,
            default: avatarFallback
        }
    });
</script>
<style scoped lang="less">
    .article__poster {
        display: inline-block;
        overflow: hidden;
        width: 100%;
        height: 200px;
        transition: transform 0.2s ease-in-out;
        box-shadow: 0 0 6px rgba(109, 43, 43, 0.1), 10px 10px 100px rgba(112, 100, 212, 0.24);
        &:hover {
            transform: scale(1.01);
        }
        .img__inner {
            width: 100%;
            height: 100%;
            vertical-align: top;
        }
    }
    @media screen and (min-width: 576px) {
        .article__poster {
            height: 360px;
        }
    }
</style>
