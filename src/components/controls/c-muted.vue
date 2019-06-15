<template>
    <button :class="data.class"
            @click="data.action()"
    >
        <c-icon v-for="(icon,i) in data.icons"
                :key="i"
                :class="icon.class"
                :id="icon.id"
                :sprite="sprite"
                v-show="icon.show"
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
        data: {
            type: Object,
            default() {
                return {
                    class : 'btn--muted btn',
                    action: () => this.$emit('mutedOrVolume'),
                    icons : [
                        { id: 'volume', class: 'icon--volume icon', show: this.isMuted },
                        { id: 'muted', class: 'icon--muted icon', show: !this.isMuted },
                    ],
                };
            },
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
