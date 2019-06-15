<template>
    <button :class="classBtn"
            @click="$emit('resize')"
    >
        <c-icon :class="classIcon"
                :sprite="sprite"
                :icon="icon"
/>
    </button>
</template>

<script>
import sprite from '@/sprite';
import Icon from './c-icon';

export default {
    components: {
        'c-icon': Icon,
    },
    props: {
        sprite: {
            type   : Object,
            default: () => { sprite },
        },
        icon: {
            type   : String,
            default: 'fullscreen',
        },
        classIcon: {
            type   : String,
            default: 'fullscreen--icon icon',
        },
        classBtn: {
            type   : String,
            default: 'fullscreen--btn btn',
        },
        IsFullScreen: {
            type   : Boolean,
            default: false,
        },
    },
};
</script>

<style>

</style>
