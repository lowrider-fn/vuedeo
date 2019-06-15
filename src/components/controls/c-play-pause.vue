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
                    class : 'btn--fullscreen btn',
                    action: () => this.$emit('playOrPause'),
                    icons : [
                        { id: 'play', class: 'icon--play icon', show: !this.isPlaying },
                        { id: 'pause', class: 'icon--pause icon', show: this.isPlaying },
                    ],
                };
            },
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
