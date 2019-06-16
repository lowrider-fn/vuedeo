<template>
    <div :class="settings.isFullScreen ? 'fullscreen-on' : ''">
        <slot name="header"></slot>
        <video ref="vuedeo"
               :class="settings.class"
               :controls="false"
               :autoplay="settings.autoplay"
               :loop="settings.loop"
               :muted="settings.muted"
               :poster="settings.poster"
               @click.self="$emit('click',$event)"
               :preload="settings.preload"
        >

            <source v-for="(video,i) in settings.videos"
                    :key="i"
                    :id="video.id"
                    :src="video.src"
                    :type="video.type"
            >

        </video>
        <slot name="body"></slot>
        <slot name="controls" v-if="settings.controls"></slot>
        <slot name="footer"></slot>
    </div>
</template>

<script>

export default {
    name : 'Vuedeo',
    props: {
        settings: {
            type   : Object,
            default: () => ({
                isFullScreen: false,
                autoplay    : false,
                loop        : false,
                muted       : false,
                poster      : '',
                preload     : 'metadata',
                controls    : true,
                class       : 'player',
                videos      : [],
            }),
        },
    },
    mounted() {
        const { vuedeo } = this.$refs;

        vuedeo.addEventListener('loadedmetadata', (e) => {
            this.$emit('ready', vuedeo);
            this.$emit('loaded', e.target.duration);
        });

        vuedeo.addEventListener('ended', () => {
            this.$emit('ended');
        });
    },
};
</script>
<style lang="scss">
    slot{
        &[name="header"]{
            z-index: 2147483649;
        }
        &[name="header"]{
            z-index: 2147483648;
        }
        &[name="controls"]{
            z-index: 2147483650;
        }
        &[name="footer"]{
            z-index: 2147483649;
        }

    }
</style>
