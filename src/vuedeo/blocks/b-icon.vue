<template>
    <svg v-html="currentIcon" />
</template>

<script>
export default {
    props: {
        id: {
            type    : String,
            required: true,
        },
        sprite: {
            type: Object,
        },
    },
    computed: {
        currentIcon() {
            return this.sprite[this.id];
        },
    },
};
</script>
