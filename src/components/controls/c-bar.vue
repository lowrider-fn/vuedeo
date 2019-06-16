<template>
    <div :class="data.bar.class"
         @mousedown="data.bar.actionDrag($event)"
         @touchstart="data.bar.actionDrag($event)"
         @touchmove="data.bar.actionMove($event)"
         @touchend="data.bar.actionEnd($event)"
    >
        <div :class="data.current.class"
             :style='{ transform: "scaleX(" + data.current.scale + ")" }'
        ></div>
        <div :class="data.back.class"></div>
    </div>
</template>

<script>
export default {
    props: {
        scale: {
            type   : Number,
            default: 0,
        },
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
                        scale: this.scale,
                    },
                    back: {
                        class: 'bar__back',
                    },
                };
            },
        },
    },
};
</script>
