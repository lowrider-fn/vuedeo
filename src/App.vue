<template>
    <div id="app">
        <vuedeo refs="vuedeo" />
    </div>
</template>

<script>

import vuedeo from './components/vuedeo';

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
        vuedeo,
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
        // window.addEventListener('resize', debounce(() => {
        //     this.resizeLayoutVolbar();
        //     this.resizeLayoutSeekbar();
        // }), 100);
        // document.addEventListener('mousemove', (e) => {
        //     this.moveVolbar(e);
        //     this.moveSeekbar(e);
        // });
        // document.addEventListener('mouseup', (e) => {
        //     this.releaseVolbar(e);
        //     this.releaseSeekbar(e);
        // });
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
        cursor: pointer;
        width: 500px;
        -webkit-transition: all .3s ease;
        -o-transition: all .3s ease;
        transition: all .3s ease;
        &:hover .controls {
            -webkit-transform: translateY(0);
                -ms-transform: translateY(0);
                    transform: translateY(0);
        }
        &::-webkit-media-controls {
            display:none !important;
        }
    }
    .fullscreen-on{
        width:100%;
        height:auto;
        video, .player{
            width: 100%;
        }
        .icon--fullscreen{
            width: 24px;
            height: 24px;
        }
        .btn--fullscreen{
            width: 24px;
            height: 24px;
        }
    }
    .player{
        overflow: hidden;
        position: relative;
        width: 500px;
        &:hover .controls {
            -webkit-transform: translateY(0);
                -ms-transform: translateY(0);
                    transform: translateY(0);
        }
    }

    .controls{
        -webkit-box-sizing: border-box;
                box-sizing: border-box;
        position:absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: #111;
        padding: 20px 5px 5px;
        -webkit-transform: translateY(100%) translateY(1px);
            -ms-transform: translateY(100%) translateY(1px);
                transform: translateY(100%) translateY(1px);;
        -webkit-transition: all .5s ease;;
        -o-transition: all .5s ease;;
        transition: all .5s ease;
        z-index: 2147483647;
        &__row{
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-pack: justify;
                -ms-flex-pack: justify;
                    justify-content: space-between;
            -webkit-box-align: center;
                -ms-flex-align: center;
                    align-items: center;
            &-left{
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-align: center;
                    -ms-flex-align: center;
                        align-items: center;
                width: 65%;
                margin-left: -5px;
            }
            &-right{
                margin-right: 5px;
            }
        }
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
        width: 30px;
        height: 30px;
        &:hover{
            opacity : 0.8;
        }
        &:active{
            opacity : 0.6;
        }
        &:disabled{
            opacity : 0.6;
        }
        &--muted{
            margin-left: 20px;
            width: 15px;
            height: 15px;
        }
        &--fullscreen{
            width: 20px;
            height: 20px;
        }
    }

    .icon{
        width: 40px;
        height: 40px;
        color: white;
        &--fullscreen-on{
            width: 20px;
            height: 20px;
        }
        &--volume{
            width: 15px;
            height: 15px;
        }
        &--muted{
            width: 15px;
            height: 15px;
        }
    }

    .bar {
        cursor: pointer;
        position: relative;
        margin-bottom: 10px;
        padding: 10px 0 ;
        margin: 0 5px;
        &__current, &__back {
            height: 3px;
            position: absolute;
            top: 31%;
            right: 0;
            left: 0;
        }
        &__current {
            z-index: 2;
            background-color: red;
            -webkit-transform: scaleX(0);
                -ms-transform: scaleX(0);
                    transform: scaleX(0);
            -webkit-transform-origin: left;
                -ms-transform-origin: left;
                    transform-origin: left;
        }
        &__back {
            background-color: white;
        }
        &.vol{
            width: 30%;
        }
    }

    .time-seconds{
        padding: 5px 5px;
        font-size: 14px;
        color: white
    }
</style>
