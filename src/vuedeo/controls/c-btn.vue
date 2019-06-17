<template>
    <div>
        <button :class="data.class"
                @click="data.action($event)"
        >
            <b-icon v-for="(icon,i) in data.icons"
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
import { Icon } from '../blocks';

export default {
    components: {
        'b-icon': Icon,
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
