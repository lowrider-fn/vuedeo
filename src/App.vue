<template>
    <div id="app">
        <vuedeo ref="vuedeo" class="vuedeo"
                :width="width"
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
                    <c-time
                        :data="time.current"
                    />
                    <c-time
                        :data="time.duration"
                    />
                    <c-btn :isShow="isPlaying"
                           :sprite="sprite"
                           :data="button.playControl"
                           @click="playOrPause()"
                    />
                    <c-btn :sprite="sprite"
                           :data="button.stop"
                           @click="stop()"
                    />
                    <c-bar ref="timebar"
                           :scale="getProgressTime"
                           :data="bar.timebar"
                           @grab="grabSeekbar($event)"
                           @move="moveSeekbar($event)"
                           @end="releaseSeekbar($event)"
                    />
                    <c-btn :iShow="isMuted"
                           :sprite="sprite"
                           :data="button.muted"
                           @click="mutedOrVolume()"
                    />
                    <c-bar ref="volbar"
                           :scale="volume"
                           :data="bar.volbar"
                           @grab="grabVolbar($event)"
                           @move="moveVolbar($event)"
                           @end="releaseVolbar($event)"
                    />
                    <c-btn :IsShow="IsFullScreen"
                           :sprite="sprite"
                           :data="button.fullscreen"
                           @click="setScreenSize()"
                    />
                </div>
            </template>
            <template v-slot:footer>
            </template>
        </vuedeo>
    </div>
</template>

<script>
import Vuedeo from './components/vuedeo';
import Time from './components/controls/c-time';
import Bar from './components/controls/c-bar';

import Btn from './components/controls/c-btn';
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
        vuedeo  : Vuedeo,
        'c-btn' : Btn,
        'c-time': Time,
        'c-bar' : Bar,
    },
    data: () => ({
        sprite,

        player: null,

        seekbarWidth     : 0,
        seekbarOffsetX   : 0,
        currentTime      : 0,
        duration         : 0,
        isGrabbingSeekbar: false,

        volbarWidth     : 0,
        volbarOffsetX   : 0,
        volume          : 0,
        isGrabbingVolbar: false,

        isPlaying   : false,
        isMuted     : false,
        IsFullScreen: false,

        width : 500,
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
                        actionDrag: e => this.grabVolbar(e),
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
        time() {
            return {
                current: {
                    class: 'time time--current',
                    time : this.getCurrentTime,
                },
                duration: {
                    class: 'time time--duration',
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
        }), 10);
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
            this.isGrabbingSeekbar = true;
            this.player.currentTime = e.layerX / this.seekbarWidth * this.duration;
            this.currentTime = this.player.currentTime;
            this.player.pause();
        },
        moveSeekbar(e) {
            e.preventDefault();
            if (!this.isGrabbingSeekbar) return;
            this.player.currentTime = (e.clientX - this.seekbarOffsetX - window.pageXOffset) / this.seekbarWidth * this.duration;
            this.currentTime = this.player.currentTime;
        },
        releaseSeekbar(e) {
            e.preventDefault();
            this.isGrabbingSeekbar = false;
            if (this.isPlaying) this.player.play();
        },
        resizeLayoutSeekbar() {
            const seekbar = this.$refs.timebar.$el;
            this.seekbarWidth = seekbar.clientWidth;
            this.seekbarOffsetX = seekbar.getBoundingClientRect().left;
        },

        grabVolbar(e) {
            e.preventDefault();
            this.isGrabbingVolbar = true;
            this.player.volume = e.layerX / this.volbarWidth;
            this.volume = this.player.volume;
        },
        moveVolbar(e) {
            e.preventDefault();
            if (!this.isGrabbingVolbar) return;
            this.player.volume = e.layerX / this.volbarWidth;
            this.volume = this.player.volume;
        },
        releaseVolbar(e) {
            e.preventDefault();
            this.isGrabbingVolbar = false;
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
            const vuedeo = this.$refs.vuedeo.$el;
            if (vuedeo.requestFullScreen) vuedeo.requestFullScreen();
            else if (vuedeo.webkitRequestFullScreen) vuedeo.webkitRequestFullScreen();
            else if (vuedeo.mozRequestFullScreen) vuedeo.mozRequestFullScreen();
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

<style lang="scss">
    #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    }
    video {
        width:100%;
        height:auto;
        cursor: pointer;
        &::-webkit-media-controls {
            display:none !important;
        }
    }

    .vuedeo{
        overflow: hidden;
        position: relative;
        transition:all .3s;
        height:auto;
        &:hover .controls {
            transform: translateY(0);
        }
    }

    .controls{
        box-sizing: border-box;
        position:absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: #111;
        padding: 5px;
        transform: translateY(100%) translateY(1px);;
        transition:all .3s;
        z-index: 2147483647;
    }

    .btn{
        -webkit-transition:all, 0.3s, ease-in-out;
        -o-transition:all, 0.3s, ease-in-out;
        transition:all, 0.3s, ease-in-out;
        background : transparent;
        border : none;
        outline : none;
        cursor : pointer;
        padding : 0;
        display : inline-block;
        &:hover{
            opacity : 0.8;
        }
        &:active{
            opacity : 0.6;
        }
        &:disabled{
            opacity : 0.6;
        }
    }

    .icon{
        width: 40px;
        height: 40px;
        color: white
    }

    .icon svg{
        width: 40px;
        height: 40px;
    }

    .bar {
        cursor: pointer;
        position: relative;
        margin-bottom: 10px;
        padding: 10px 0;
        margin: 0 10px;
        &__current, &__back {
        height: 3px;
        position: absolute;
        top: 10px;
        right: 0;
        left: 0;
        }
        &__current {
            // position: relative;
            // top: 5px;
            z-index: 2;
            background-color: red;
            transform: scaleX(0);
            transform-origin: left;
            &:after{
                content:'';
                position: absolute;
                background:white;
                width: 30px;
                height: 10px;
                right: 0;
            }
        }
        &__back {
        background-color: white;
        }
    }

    .time{
        font-size: 14px;
        color: white
    }
</style>
