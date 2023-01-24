/**
 * @author: zhenyu
 * @description: 图片懒加载
 */

import type { DirectiveBinding } from 'vue';
import { throttle } from 'lodash-es';
import { getOffset } from '@/utils/dom';
import { GeneralFunction } from '@/bean/base';

function inView(e: HTMLElement) {
    return (
        e.style.display !== 'none' &&
        window.innerHeight + document.documentElement.scrollTop + 20 >= getOffset(e).offsetTop
    );
}

interface LazyloadElement extends HTMLElement {
    lazyloadHelper: LazyloadHelper;
}

class LazyloadHelper {
    private el: HTMLElement;
    private dataSrc: string;
    private onScrollThrottle: GeneralFunction;

    constructor(el: HTMLElement, dataSrc: string) {
        this.el = el;
        this.dataSrc = dataSrc;
        this.onScrollThrottle = throttle(this.onScroll, 300, { leading: true });
    }

    setSrc() {
        if (!this.el.getAttribute('src') && inView(this.el)) {
            this.el.setAttribute('src', this.dataSrc || '');
        }
    }

    onScroll() {
        this.setSrc();
    }

    handleInserted() {
        this.setSrc();
        window.addEventListener('scroll', this.onScrollThrottle.bind(this));
    }

    handleUpdated() {
        this.setSrc();
    }

    handleBeforeUnmount() {
        window.removeEventListener('scroll', this.onScrollThrottle.bind(this));
    }
}

export default {
    mounted(el: LazyloadElement, binding: DirectiveBinding): void {
        el.lazyloadHelper = new LazyloadHelper(el, binding.value || '');
        el.lazyloadHelper.handleInserted();
    },
    updated(el: LazyloadElement): void {
        el.lazyloadHelper.handleUpdated();
    },
    beforeUnmount(el: LazyloadElement): void {
        el.lazyloadHelper.handleBeforeUnmount();
    }
};
