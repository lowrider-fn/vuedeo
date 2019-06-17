<template>
    <div :class="data.bar.class"
         @mousedown="data.bar.actionDrag($event)"
         @touchstart="data.bar.actionDrag($event)"
         @touchmove="data.bar.actionMove($event)"
         @mousemove="data.bar.actionMove($event)"
         @touchend="data.bar.actionEnd($event)"
         @mouseup="data.bar.actionEnd($event)"
    >
        <div :class="data.current.class"
             :style='{ transform: "scaleX(" + setScale + ")" }'
        ></div>
        <div :class="data.back.class"></div>
    </div>
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            default() {
                return {
                    bar: {
                        class     : 'bar',
                        actionDrag: e => this.$emit('drag', e),
                        actionMove: e => this.$emit('move', e),
                        actionEnd : e => this.$emit('end', e),
                    },
                    current: {
                        class: 'bar__current',
                        scale: 0,
                    },
                    back: {
                        class: 'bar__back',
                    },
                };
            },
        },
    },
    computed: {
        setScale() {
            const { scale } = this.data.current;
            if (scale > 1) return 1;
            if (scale < 0) return 0;
            return scale;
        },
    },
};
</script>
