<template>
    <button :class="classBtn"
            @click="$emit('mutedOrVolume')"
    >
        <!-- <c-icon :class="classIcon"
                :sprite="sprite"
                :icon="icon"
                v-if="isMuted"
        /> -->
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
            default: 'muted',
        },
        classIcon: {
            type   : String,
            default: 'muted--icon icon',
        },
        classBtn: {
            type   : String,
            default: 'muted--btn btn',
        },
        isMuted: {
            type   : Boolean,
            default: false,
        },
    },
};
</script>

<style>

</style>
