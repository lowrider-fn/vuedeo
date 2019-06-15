<template>
    <button :class="classBtn"
            @click="$emit('playOrPause')"
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
            default: 'play',
        },
        classIcon: {
            type   : String,
            default: 'play--icon icon',
        },
        classBtn: {
            type   : String,
            default: 'play--btn btn',
        },
        isPlaying: {
            type   : Boolean,
            default: false,
        },
    },
};
</script>

<style>

</style>
