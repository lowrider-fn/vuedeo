<template>
    <div class="controls__seekbar-wrap"
         @mousedown="$emit('grab',$event)"
         @touchstart="$emit('grag',$event)"
         @touchmove="$emit('move',$event)"
         @touchend="$emit('end',$event)"
    >
        <div class="controls__seekbar-current"
             :style='{ transform: "scaleX(" + time + ")" }'
        ></div>
        <div class="controls__seekbar-back"></div>
    </div>
</template>

<script>
export default {
    props: {
        time: {
            type   : Number,
            default: 0,
        },
    },
};
</script>

<style>

</style>
