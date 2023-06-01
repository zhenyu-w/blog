<template>
    <icon-font class="icon-svg" :type="iconType" :style="styleObj"></icon-font>
</template>
<script setup lang="ts" name="IconSvg">
    import { createFromIconfontCN } from '@ant-design/icons-vue';
    import { computed } from 'vue';

    const iconPrefix = 'icon-';
    const fallbackIcon = 'home';

    const IconFont = createFromIconfontCN({
        scriptUrl: '//at.alicdn.com/t/font_1570300_zwupv8bc2lp.js'
    });

    interface styleAttr {
        fontSize?: number;
        color: string;
    }

    const props = defineProps({
        icon: {
            type: String,
            default: ''
        },
        size: {
            type: Number,
            default: 0
        },
        color: {
            type: String,
            default: ''
        }
    });
    const iconType = computed(() => `${iconPrefix}${props.icon || fallbackIcon}`);

    const styleObj = computed(() => {
        let obj: styleAttr = {
            color: props.color
        };
        if (props.size !== 0) {
            obj.fontSize = props.size;
        }
        return obj;
    });
</script>
<style scoped lang="less">
    .icon-svg {
        font-size: 16px;
    }
    .icon-svg + .icon-svg {
        margin-left: 16px;
    }
</style>
