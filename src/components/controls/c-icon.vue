<template>
    <svg :class="className"
         v-html="currentIcon"
    />
</template>

<script>
export default {
    props: {
        id: {
            type    : String,
            required: true,
        },
        className: {
            type   : String,
            default: '',
        },
        sprite: {
            type   : Object,
            default: null,
        },
    },
    computed: {
        currentIcon() {
            return this.sprite[this.id];
        },
    },
};
</script>

<style>

</style>
