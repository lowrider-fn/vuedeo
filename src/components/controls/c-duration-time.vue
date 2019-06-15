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
            default: 'time--duration',
        },
    },
};
</script>

<style>
    .time--duration{
        color: white;
        font-size: 12px
    }
</style>
