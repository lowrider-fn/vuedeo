<template>
    <figure>
        <slot name="header"></slot>
        <video ref="vuedeo"
               class="vuedeo__player"
               :controls="controls"
               :autoplay="autoplay"
               :loop="loop"
               :muted="muted"
               :poster="videoPoster"
               :width="width"
               @click.self="$emit('playOrPause')"
               :preload="preload"
        >
            <source src="https://cdnv.rt.com/russian/video/2019.06/5d001cd5370f2c313e8b462d.mp4" type="video/mp4">
            <source v-for="video in videos"
                    :key="video.id"
                    :id="video.id"
                    :src="video.src"
                    :type="video.type"
            >

        </video>

        <slot name="body"></slot>
        <slot name="preloader"></slot>
        <slot name="controls"></slot>
        <slot name="footer"></slot>
    </figure>
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
        preload: {
            type   : String,
            default: 'metadata',
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
