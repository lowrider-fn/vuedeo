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
                    <c-current-time :time="getCurrentTime" />
                    <c-duration-time :time="getDuration" />

                    <c-play-pause :isPlaying="isPlaying"
                                  :sprite="sprite"
                                  :icon="'play'"
                                  @playOrPause="playOrPause()"
                    />
                    <c-stop :sprite="sprite"
                            :icon="'stop'"
                            @stop="stop()"
                    />
                    <c-time-bar ref="timebar"
                                :time="getProgressTime"
                                @grab="grabSeekbar($event)"
                                @move="moveSeekbar($event)"
                                @end="releaseSeekbar($event)"
                    />
                    <c-muted :isMuted="isMuted"
                             :sprite="sprite"
                             :icon="'muted'"
                             @mutedOrVolume="mutedOrVolume()"
                    />
                    <c-volume-bar ref="volbar"
                                  :time="getProgressVol"
                                  @grab="grabVolbar($event)"
                                  @move="moveVolbar($event)"
                                  @end="releaseVolbar($event)"
                    />
                    <c-fullscreen :IsFullScreen="IsFullScreen"
                                  :sprite="sprite"
                                  :icon="'fullscreenOn'"
                                  @resize="setScreenSize()"
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
import PlayPause from './components/controls/c-play-pause';
import Stop from './components/controls/c-stop';
import Muted from './components/controls/c-muted';
import Fullscreen from './components/controls/c-fullscreen';
import DurationTime from './components/controls/c-duration-time';
import CurrentTime from './components/controls/c-current-time';
import Timebar from './components/controls/c-time-bar';
import Volbar from './components/controls/c-volume-bar';

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
        vuedeo           : Vuedeo,
        'c-play-pause'   : PlayPause,
        'c-stop'         : Stop,
        'c-fullscreen'   : Fullscreen,
        'c-muted'        : Muted,
        'c-duration-time': DurationTime,
        'c-current-time' : CurrentTime,
        'c-time-bar'     : Timebar,
        'c-volume-bar'   : Volbar,
    },
    data: () => ({
        sprite,

        player: null,

        seekbarWidth     : 0,
        seekbarOffsetX   : 0,
        time             : 0,
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
        getProgressTime() {
            return this.time / this.duration;
        },
        getProgressVol() {
            return this.volume;
        },
        getCurrentTime() {
            return this.convertSecondsToTime(this.time);
        },
        getDuration() {
            return this.convertSecondsToTime(this.duration);
        },
    },
    mounted() {
        console.log(this.sprite);

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
            this.time = this.player.currentTime;
            if (!this.isPlaying) return;
            requestAnimationFrame(() => this.toLoop());
        },

        grabSeekbar(e) {
            e.preventDefault();
            this.isGrabbingSeekbar = true;
            this.player.currentTime = e.layerX / this.seekbarWidth * this.duration;
            this.time = this.player.currentTime;
            this.player.pause();
        },
        moveSeekbar(e) {
            e.preventDefault();
            if (!this.isGrabbingSeekbar) return;
            this.player.currentTime = (e.clientX - this.seekbarOffsetX - window.pageXOffset) / this.seekbarWidth * this.duration;
            this.time = this.player.currentTime;
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
            this.IsFullScreen = !this.isFullscreen;
        },
    },

};

</script>

<style lang="scss">
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

figure {
	height:auto;
}
figcaption {
	display:block;
}
video {
	width:100%;
    height:auto;
    cursor: pointer;
    &::-webkit-media-controls {
        display:none !important;
    }
}

/* fullscreen */
html:-ms-fullscreen {
	width:100%;
}
:-webkit-full-screen {
	background-color:transparent;
}
/* hide controls on fullscreen with WebKit */
figure[data-fullscreen=true] video::-webkit-media-controls {
	display:none !important;
}
figure[data-fullscreen=true] {
	max-width:100%;
	width:100%;
	margin:0;
	padding:0;
}
figure[data-fullscreen=true] video {
	height:auto;
}
figure[data-fullscreen=true] figcaption {
	display:none;
}
figure[data-fullscreen=true] .controls {
	position:absolute;
	bottom:2%;
	width:100%;
	z-index:2147483647;
}
figure[data-fullscreen=true] .controls li {
	width:5%;
}
figure[data-fullscreen=true] .controls .progress {
	width:68%;
}
video{
    cursor: pointer;
    &::-webkit-media-controls {
        display:none !important;
    }
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.vuedeo{
    overflow: hidden;
    position: relative;
    &:fullscreen {
        max-width: none;
        width: 100vw!important;
    }
    &:-webkit-full-screen {
        max-width: none;
        width: 100vw!important;
        height: 100vh;
    }
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
    z-index: 2147483648;
    &__seekbar {
        &-wrap {
        cursor: pointer;
        position: relative;
        margin-bottom: 10px;
        padding: 10px 0;
        margin: 0 10px;
        }
        &-current, &-back {
        height: 3px;
        position: absolute;
        top: 10px;
        right: 0;
        left: 0;
        }
        &-current {
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
        &-back {
        background-color: white;
        }
    }
    &__control-panel {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between
    }
    &__left-wrap{
        display: flex;
        position: relative;
        cursor: pointer;
        width: 50%;
        justify-content: space-between
    }
    &__volbar-wrap{
        display: flex;
        position: relative;
        cursor: pointer;
        width: 80%;
        padding: 10px 0;
        margin: 0 10px;
        justify-content: space-between
    }
    &__btn {

    }
    &__icon{
        width: 40px;
    }
    &__volume-icon{
        width: 20px;
    }
}

</style>
