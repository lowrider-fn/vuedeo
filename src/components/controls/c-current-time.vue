<template>
    <div :class="className">
        {{ time }}
    </div>
</template>

<script>
export default {
    props: {
        time: {
            type   : String,
            default: '00:00',
        },
        className: {
            type   : String,
            default: 'time--current',
        },
    },
};
</script>

<style>
    .time--current{
        color: white;
        font-size: 12px
    }
</style>
