<template>
    <div>
        <button :class="data.class"
                @click="data.action($event)"
        >
            <c-icon v-for="(icon,i) in data.icons"
                    :key="i"
                    :class="icon.class"
                    :id="icon.id"
                    :sprite="sprite"
                    v-show="icon.show"
            />
        </button>
    </div>
</template>

<script>
import Icon from './c-icon';

export default {
    components: {
        'c-icon': Icon,
    },
    props: {
        sprite: {
            type: Object,
        },
        data: {
            type: Object,
            default() {
                return {
                    class : 'btn',
                    action: e => this.$emit('click', e),
                    icons : [
                        { id: 'icon', class: 'icon', show: true },
                    ],
                };
            },
        },
    },
};
</script>
