<template>
    <div :style="`width:${width}px`">
        <video ref="vuedeo" class="vuedeo__player"
               :controls="controls"
               :autoplay="autoplay"
               :loop="loop"
               :muted="muted"
               :poster="videoPoster"
               :width="width"
               @click.self="$emit('playOrPause')"
        >
            <source v-for="video in videos"
                    :key="video.id"
                    :id="video.id"
                    :src="video.src"
            >
        </video>
        <slot name="controls"></slot>
    </div>
</template>

<script>

export default {
    name : 'Vuedeo',
    props: {
        width: {
            type   : Number,
            default: 500,
        },
        autoplay: {
            type   : Boolean,
            default: false,
        },
        loop: {
            type   : Boolean,
            default: false,
        },
        controls: {
            type   : Boolean,
            default: false,
        },
        muted: {
            type   : Boolean,
            default: false,
        },
        videos: {
            type   : Array,
            default: () => [],
        },
        videoPoster: {
            type   : String,
            default: '',
        },
    },
    mounted() {
        const { vuedeo } = this.$refs;

        this.$emit('ready', vuedeo);

        vuedeo.addEventListener('loadedmetadata', (e) => {
            this.$emit('loaded', e.target.duration);
        });

        vuedeo.addEventListener('ended', () => {
            this.$emit('ended');
        });
    },
};
</script>
