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
               :preload="settings.preload"
               @click.self="$emit('click',$event)"
               @dblclick.self="$emit('dblclick',$event)"
               @loadedmetadata="$emit('ready', $event.target);
                                $emit('loaded', $event.target.duration);"
               @ended="$emit('ended',e)"
               @timeupdate="$emit('timeupdate',$event.target.currentTime)"
        >
            <source v-for="(video,i) in settings.videos"
                    :key="i"
                    :id="video.id"
                    :src="video.src"
                    :type="video.type"
            >

        </video>
        <slot name="body"></slot>
        <slot name="controls"></slot>
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
        window.addEventListener('resize',(e) => this.$emit('resize', document.fullscreen));
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
