<template>
    <div id="app">
        <player ref="player" class="player"
                :videos="videos"
                :IsFullScreen="IsFullScreen"
                @ready="ready($event)"
                @ended="ended($event)"
                @loaded="loaded($event)"
                @playOrPause="playOrPause()"
        >
            <template v-slot:header>
            </template>
            <template v-slot:body v-if="!player">
            </template>
            <template v-slot:controls>
                <div class="controls">
                    <c-bar ref="timebar"
                           :scale="getProgressTime"
                           :data="bar.timebar"
                           @grab="grabSeekbar($event)"
                           @move="moveSeekbar($event)"
                           @end="releaseSeekbar($event)"
                    />
                    <div class="controls__row">
                        <div class="controls__row-left">
                            <c-btn :isShow="isPlaying"
                                   :sprite="sprite"
                                   :data="button.playControl"
                                   @click="playOrPause()"
                            />
                            <c-btn :sprite="sprite"
                                   :data="button.stop"
                                   @click="stop()"
                            />
                            <c-btn :isShow="isMuted"
                                   :sprite="sprite"
                                   :data="button.muted"
                                   @click="mutedOrVolume()"
                            />
                            <c-bar ref="volbar"
                                   :scale="volume"
                                   :data="bar.volbar"
                                   @grab="dragVolbar($event)"
                                   @move="moveVolbar($event)"
                                   @end="releaseVolbar($event)"
                            />
                            <c-time
                                :data="timeSeconds.current"
                            />
                            <c-time
                                :data="timeSeconds.duration"
                            />
                        </div>
                        <div class="controls__row-right">
                            <c-btn :isShow="IsFullScreen"
                                   :sprite="sprite"
                                   :data="button.fullscreen"
                                   @click="setScreenSize()"
                            />
                        </div>
                    </div>
                </div>
            </template>
            <template v-slot:footer>
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

const debounce = (callback, duration) => {
    let timer;
    return (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback(e);
        }, duration);
    };
};
export default {
    name      : 'App',
    components: {
        player  : Player,
        'c-btn' : Btn,
        'c-time': Time,
        'c-bar' : Bar,
    },
    data: () => ({
        sprite,

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
        IsFullScreen: false,

        videos: [{
            id  : 'rt',
            src : 'https://cdnv.rt.com/russian/video/2019.06/5d001cd5370f2c313e8b462d.mp4',
            type: 'video/mp4',
        }],

    }),

    computed: {
        button() {
            return {
                fullscreen: {
                    class : 'btn--fullscreen btn',
                    action: () => this.setScreenSize(),
                    icons : [
                        { id: 'fullscreenOn', class: 'icon--fullscreen-on icon', show: !this.IsFullScreen },
                        { id: 'fullscreenOff', class: 'icon--fullscreen icon', show: this.IsFullScreen },
                    ],
                },
                playControl: {
                    class : 'btn--play-control btn',
                    action: () => this.playOrPause(),
                    icons : [
                        { id: 'play', class: 'icon--play icon', show: !this.isPlaying },
                        { id: 'pause', class: 'icon--pause icon', show: this.isPlaying },
                    ],
                },
                stop: {
                    class : 'btn--stop btn',
                    action: () => this.stop(),
                    icons : [
                        { id: 'stop', class: 'icon--stop icon', show: true },
                    ],
                },
                muted: {
                    class : 'btn--muted btn',
                    action: () => this.mutedOrVolume(),
                    icons : [
                        { id: 'volume', class: 'icon--volume icon', show: !this.isMuted },
                        { id: 'muted', class: 'icon--muted icon', show: this.isMuted },
                    ],
                },
            };
        },
        bar() {
            return {
                timebar: {
                    bar: {
                        class     : 'time bar',
                        actionDrag: e => this.grabSeekbar(e),
                        actionMove: e => this.moveSeekbar(e),
                        actionEnd : e => this.releaseSeekbar(e),
                    },
                    current: {
                        class: 'time__current bar__current',
                        scale: this.getProgressTime,
                    },
                    back: {
                        class: 'time__back bar__back',
                    },
                },
                volbar: {
                    bar: {
                        class     : 'vol bar',
                        actionDrag: e => this.dragVolbar(e),
                        actionMove: e => this.moveVolbar(e),
                        actionEnd : e => this.releaseVolbar(e),
                    },
                    current: {
                        class: 'vol__current bar__current',
                        scale: this.volume,
                    },
                    back: {
                        class: 'vol__back bar__back',
                    },
                },
            };
        },
        timeSeconds() {
            return {
                current: {
                    class: 'time-seconds time--current',
                    time : this.getCurrentTime,
                },
                duration: {
                    class: 'time-seconds time--duration',
                    time : this.getDuration,
                },
            };
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
            this.player = player;
        },

        loaded(e) {
            this.duration = e;
            this.volume = this.player.volume;
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
        },
        pause() {
            this.player.pause();
            this.isPlaying = false;
        },

        stop() {
            this.player.currentTime = 0;
            this.pause();
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
        },

        setScreenSize() {
            this.IsFullScreen ? this.exitFullScreen() : this.setFullScreen();
            this.setIsFullScreen();
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
            this.IsFullScreen = !this.IsFullScreen;
        },
    },

};

</script>
