<template>
    <button :class="classBtn"
            @click="$emit('stop')"
    >
        <c-icon :sprite="sprite"
                :icon="icon"
                :class="classIcon"
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
            default: 'stop',
        },
        classIcon: {
            type   : String,
            default: 'stop--icon icon',
        },
        classBtn: {
            type   : String,
            default: 'stop--btn btn',
        },
    },
};
</script>

<style>

</style>
