<template>
    <div :class="`${settings.isFullScreen ? 'fullscreen-on' : ''} ${score > 0 ? 'controls-active' : ''}`"
         @mousemove="checkEvent($event.target)"
    >
        <slot name="header"></slot>
        <video :class="settings.class"
               :controls="false"
               :autoplay="settings.autoplay"
               :loop="settings.loop"
               :muted="settings.muted"
               :poster="settings.poster"
               :preload="settings.preload"
               @click.self="$emit('click',$event)"
               @dblclick.self="$emit('dblclick',$event)"
               @loadedmetadata="$emit('ready', $event.target);
                                $emit('loadedmetadata', $event.target.duration);"
               @ended="$emit('ended',$event.target)"
               @timeupdate="$emit('timeupdate',$event.target.currentTime)"
               @abort="$emit('abort', $event.target)"
               @canplay="$emit('canplay', $event.target)"
               @canplaythrough="$emit('canplaythrough', $event.target)"
               @durationchange="$emit('durationchange', $event.target)"
               @emptied="$emit('emptied', $event.target)"
               @encrypted="$emit('encrypted', $event.target)"
               @error="$emit('error', $event.target)"
               @interruptbegin="$emit('interruptbegin', $event.target)"
               @interruptend="$emit('interruptend', $event.target)"
               @loadeddata="$emit('loadeddata', $event.target)"
               @loadstart="$emit('loadstart', $event.target)"
               @pause="$emit('pause', $event.target)"
               @play="$emit('play', $event.target)"
               @playing="$emit('playing', $event.target)"
               @progress="$emit('progress', $event.target)"
               @ratechange="$emit('ratechange', $event.target)"
               @seeked="$emit('seeked', $event.target)"
               @seeking="$emit('seeking', $event.target)"
               @stalled="$emit('stalled', $event.target)"
               @suspend="$emit('suspend', $event.target)"
               @volumechange="$emit('volumechange', $event.target.volume)"
               @waiting="$emit('ready', $event.target)"
               ref="vuedeo"
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
import debounce from 'lodash/fp';

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
    data: () => ({
        score           : 0,
        decreaseInterval: null,
    }),
    mounted() {
        window.addEventListener('resize', () => this.$emit('resize', document.fullscreen));
    },
    methods: {
        checkEvent() {
            // console.log(debounce);

            // clearInterval(this.decreaseInterval);
            this.score++;
            // this.decreaseInterval = setInterval(this.decrease, 5000);
            debounce(this.decrease, 1000);
        },
        decrease() {
            console.log('ok');

            if (this.score > 0) this.score = 0;
        },
    }
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
