<template>
    <svg :class="className"
         v-html="currentIcon"
    />
</template>

<script>
export default {
    props: {
        icon: {
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
            return this.sprite[this.icon];
        },
    },
};
</script>

<style>

</style>
