<template>
    <div id="app">
        <player ref="player" class="player"
                :settings="setData.settings"
                @ready="ready($event)"
                @ended="ended($event)"
                @loaded="loaded($event)"
                @click="playOrPause();
                        $emit('click',$event);"
        >
            <template v-slot:header>
                <slot name="header"></slot>
            </template>
            <template v-slot:body>
                <slot name="body"></slot>
            </template>
            <template v-slot:controls>
                <slot name="controls">
                    <div class="controls">
                        <c-bar ref="timebar"
                               :data="setData.bar.timebar"
                        />
                        <div class="controls__row">
                            <div class="controls__row-left">
                                <c-btn :sprite="sprite"
                                       :data="setData.button.playControl"
                                />
                                <c-btn :sprite="sprite"
                                       :data="setData.button.stop"
                                />
                                <c-btn :sprite="sprite"
                                       :data="setData.button.muted"
                                />
                                <c-bar ref="volbar"
                                       :data="setData.bar.volbar"
                                />
                                <c-time
                                    :data="setData.timeSeconds.current"
                                />
                                <c-time
                                    :data="setData.timeSeconds.duration"
                                />
                            </div>
                            <div class="controls__row-right">
                                <c-btn :sprite="sprite"
                                       :data="setData.button.fullscreen"
                                />
                            </div>
                        </div>
                    </div>
                </slot>
            </template>
            <template v-slot:footer>
                <slot name="footer"></slot>
            </template>
        </player>
    </div>
</template>

<script>
import Player from './player';
import Time from './controls/c-time';
import Bar from './controls/c-bar';

import Btn from './controls/c-btn';
import sprite from './sprite';
import { setSettings } from './m-set-settings';

const debounce = (callback, duration) => {
    let timer;
    return (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => { callback(e) }, duration);
    };
};
export default {
    components: {
        player  : Player,
        'c-btn' : Btn,
        'c-time': Time,
        'c-bar' : Bar,
    },
    mixins: [setSettings],
    props : {
        data: {
            type: Object,
        },
        sprite: {
            type   : Object,
            default: () => sprite,
        },
    },
    data: () => ({
        player: null,

        seekbarWidth    : 0,
        seekbarOffsetX  : 0,
        currentTime     : 0,
        duration        : 0,
        isDragingSeekbar: false,

        volbarWidth    : 0,
        volbarOffsetX  : 0,
        volume         : 0,
        isDragingVolbar: false,

        isPlaying   : false,
        isMuted     : false,
        isFullScreen: false,

        videos: [{
            id  : 'rt',
            src : 'https://cdnv.rt.com/russian/video/2019.06/5d001cd5370f2c313e8b462d.mp4',
            type: 'video/mp4',
        }],
    }),

    computed: {
        setData() {
            return this.data || this.setSettings;
        },
        getProgressTime() {
            return this.currentTime / this.duration;
        },
        getCurrentTime() {
            return this.convertSecondsToTime(this.currentTime);
        },
        getDuration() {
            return this.convertSecondsToTime(this.duration);
        },
    },
    mounted() {
        window.addEventListener('resize', debounce(() => {
            this.resizeLayoutVolbar();
            this.resizeLayoutSeekbar();
        }), 100);
        document.addEventListener('mousemove', (e) => {
            this.moveVolbar(e);
            this.moveSeekbar(e);
        });
        document.addEventListener('mouseup', (e) => {
            this.releaseVolbar(e);
            this.releaseSeekbar(e);
        });
        if (document.addEventListener) {
            // As the video is playing, update the progress bar
            // video.addEventListener('timeupdate', () => {
            //     // For mobile browsers, ensure that the progress element's max attribute is set
            //     if (!progress.getAttribute('max')) progress.setAttribute('max', video.duration);
            //     progress.value = video.currentTime;
            //     progressBar.style.width = `${Math.floor((video.currentTime / video.duration) * 100)}%`;
            // });
        }
    },
    methods: {
        ready(player) {
            console.log(this);

            this.player = player;
            this.$emit('ready', this.player);
        },

        loaded(e) {
            this.duration = e;
            this.volume = this.player.volume;
            this.$emit('loaded', this.player);
        },

        ended() {
            this.player.currentTime = 0;
            this.isPlaying = false;
        },

        playOrPause() {
            this.isPlaying ? this.pause() : this.play();
        },

        play() {
            this.player.play();
            this.isPlaying = true;
            this.toLoop();
            this.$emit('play');
        },
        pause() {
            this.player.pause();
            this.isPlaying = false;
            this.$emit('pause');
        },

        stop() {
            this.player.currentTime = 0;
            this.pause();
            this.$emit('stop');
        },

        toLoop() {
            this.currentTime = this.player.currentTime;
            if (!this.isPlaying) return;
            requestAnimationFrame(() => this.toLoop());
        },

        grabSeekbar(e) {
            e.preventDefault();
            this.isDragingSeekbar = true;
            this.player.currentTime = e.layerX / this.seekbarWidth * this.duration;
            this.currentTime = this.player.currentTime;
            this.player.pause();
        },
        moveSeekbar(e) {
            e.preventDefault();
            if (!this.isDragingSeekbar) return;
            this.player.currentTime = (e.clientX - this.seekbarOffsetX - window.pageXOffset) / this.seekbarWidth * this.duration;
            this.currentTime = this.player.currentTime;
        },
        releaseSeekbar(e) {
            e.preventDefault();
            this.isDragingSeekbar = false;
            if (this.isPlaying) this.player.play();
        },
        resizeLayoutSeekbar() {
            const seekbar = this.$refs.timebar.$el;
            this.seekbarWidth = seekbar.clientWidth;
            this.seekbarOffsetX = seekbar.getBoundingClientRect().left;
        },

        dragVolbar(e) {
            e.preventDefault();
            this.isDragingVolbar = true;
            this.player.volume = e.layerX / this.volbarWidth;
            this.volume = this.player.volume;
        },
        moveVolbar(e) {
            e.preventDefault();
            if (!this.isDragingVolbar) return;
            const currentVolume = e.layerX / this.volbarWidth;
            this.player.volume = currentVolume > 1 ? 1 : currentVolume;
            this.volume = this.player.volume;
        },
        releaseVolbar(e) {
            e.preventDefault();
            this.isDragingVolbar = false;
        },
        resizeLayoutVolbar() {
            const volbar = this.$refs.volbar.$el;
            this.volbarWidth = volbar.clientWidth;
            this.volbarbarOffsetX = volbar.getBoundingClientRect().left;
        },

        convertSecondsToTime(time) {
            let seconds = Math.floor(time % 60);

            if (seconds < 10) seconds = `0${seconds}`;

            const minutes = Math.floor((time / 60) % 60);

            return `${minutes}:${seconds}`;
        },

        mutedOrVolume() {
            this.player.muted = !this.player.muted;
            this.isMuted = this.player.muted;
            this.$emit('muted', this.isMuted);
        },

        setScreenSize() {
            this.isFullScreen ? this.exitFullScreen() : this.setFullScreen();
            this.setIsFullScreen();
            this.$emit('resize', this.isFullScreen);
        },
        setFullScreen() {
            const player = this.$refs.player.$el;
            if (player.requestFullScreen) player.requestFullScreen();
            else if (player.webkitRequestFullScreen) player.webkitRequestFullScreen();
            else if (player.mozRequestFullScreen) player.mozRequestFullScreen();
        },
        exitFullScreen() {
            if (document.cancelFullScreen) document.cancelFullScreen();
            else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        },
        setIsFullScreen() {
            this.isFullScreen = !this.isFullScreen;
        },
    },

};

</script>
