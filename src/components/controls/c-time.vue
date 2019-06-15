<template>
    <div :class="data.class">
        {{ data.time }}
    </div>
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            default() {
                return {
                    class: 'time',
                    time : '00:00',
                };
            },
        },
    },
};
</script>
