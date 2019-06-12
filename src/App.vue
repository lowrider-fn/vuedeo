<template>
    <div id="app">
        <vuedeo class="vuedeo"
                :width="width"
                :videos="videos"
                @ready="ready($event)"
                @ended="ended($event)"
                @loaded="loaded($event)"
                @playOrPause="playOrPause()"
        >
            <template v-slot:preloader v-if="!player">
            </template>
            <template v-slot:controls>
                <div class="controls">
                    <div class="controls__time-wrap">
                        <div class="controls__time-current">
                            {{ getCurrentTime }} {{ getDuration }}
                        </div>
                    </div>
                    <div ref="seekbar" class="controls__seekbar-wrap"
                         @mousedown="grabSeekbar($event)"
                         @touchstart="grabSeekbar($event)"
                         @touchmove="moveSeekbar($event)"
                         @touchend="releaseSeekbar($event)"
                    >
                        <div class="controls__seekbar-current"
                             :style='{ transform: "scaleX(" + getProgressRate + ")" }'
                        ></div>
                        <div class="controls__seekbar-back"></div>
                    </div>

                    <div class="controls__control-panel">
                        <div class="controls__btn-wrap">
                            <button class="controls__btn"
                                    @click="playOrPause()"
                            >
                                <img class="controls__icon"
                                     :src="pauseIcon"
                                     v-if="isPlaying"
                                >
                                <img class="controls__icon"
                                     :src="playIcon"
                                     v-else
                                >
                            </button>
                            <button class="controls__btn"
                                    @click='stop()'
                            >
                                <img class="controls__icon" :src="stopIcon">
                            </button>
                        </div>
                        <div class="controls__left-wrap">
                            <button class="controls__btn"
                                    @click="muteOrVolume()"
                            >
                                <img class="controls__volume-icon"
                                     :src="mutedIcon"
                                     v-if="isMuted"
                                >
                                <img class="controls__volume-icon"
                                     :src="volumeIcon"
                                     v-else
                                >
                            </button>
                            <div ref="volbar" class="controls__volbar-wrap"
                                 @mousedown="grabVolbar($event)"
                                 @touchstart="grabVolbar($event)"
                                 @touchmove="moveVolbar($event)"
                                 @touchend="releaseVolbar($event)"
                            >
                                <div class="controls__seekbar-current"
                                     :style='{ transform: "scaleX(" + getProgressRate + ")" }'
                                ></div>
                                <div class="controls__seekbar-back"></div>
                            </div>
                            <button class="controls__btn"
                                    @click="setScreenSize()"
                            >
                                <img class="controls__volume-icon"
                                     :src="fullScreenIcon"
                                     v-if="IsFullScreen"
                                >
                                <img class="controls__volume-icon"
                                     :src="exitFullScreenIcon"
                                     v-else
                                >
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </vuedeo>
    </div>
</template>

<script>
import Vuedeo from './components/vuedeo';
import pauseIcon from '@/assets/icons/pause.svg';
import playIcon from '@/assets/icons/play.svg';
import stopIcon from '@/assets/icons/stop.svg';
import mutedIcon from '@/assets/icons/mute.svg';
import volumeIcon from '@/assets/icons/volume.svg';
import fullScreenIcon from '@/assets/icons/full-screen.svg';
import exitFullScreenIcon from '@/assets/icons/exit-full-screen.svg';

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
        vuedeo: Vuedeo,
    },
    data: () => ({
        pauseIcon,
        playIcon,
        stopIcon,
        volumeIcon,
        mutedIcon,
        exitFullScreenIcon,
        fullScreenIcon,

        player           : null,
        seekbar          : null,
        seekbarWidth     : 0,
        seekbarOffsetX   : 0,
        time             : 0,
        duration         : 0,
        isPlaying        : false,
        isGrabbingSeekbar: false,
        isMuted          : false,
        IsFullScreen     : false,

        width : 500,
        videos: [{
            id : 'rt',
            src: 'https://cdnv.rt.com/russian/video/2019.06/5d001cd5370f2c313e8b462d.mp4',
        }],
    }),
    computed: {
        getProgressRate() {
            return this.time / this.duration;
        },
        getCurrentTime() {
            return this.convertSecondsToTime(this.time);
        },
        getDuration() {
            return this.convertSecondsToTime(this.duration);
        },
    },
    mounted() {
        window.addEventListener('resize', debounce(() => {
            this.resizeLayoutSeekbar();
        }), 100);
        document.addEventListener('mousemove', (e) => {
            this.moveSeekbar(e);
        });
        document.addEventListener('mouseup', (e) => {
            this.releaseSeekbar(e);
        });
    },
    methods: {
        ready(player) {
            this.player = player;
            this.seekbar = this.$refs.seekbar;
            this.resizeLayoutSeekbar();
        },
        loaded(e) {
            this.duration = e;
        },
        ended() {
            this.player.currentTime = 0;
            this.isPlaying = false;
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
        playOrPause() {
            this.isPlaying ? this.pause() : this.play();
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
            this.seekbarWidth = this.seekbar.clientWidth;
            this.seekbarOffsetX = this.seekbar.getBoundingClientRect().left;
        },
        convertSecondsToTime(time) {
            let seconds = Math.floor(time % 60);

            if (seconds < 10) seconds = `0${seconds}`;

            const minutes = Math.floor((time / 60) % 60);

            return `${minutes}:${seconds}`;
        },
        muteOrVolume() {
            this.player.muted = !this.player.muted;
            this.isMuted = this.player.muted;
        },
        setScreenSize() {
            if (this.IsFullScreen) {
                if (document.cancelFullScreen) document.cancelFullScreen();
                else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
                else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            } else if (this.player.requestFullScreen) this.player.requestFullScreen();
            else if (this.player.webkitRequestFullScreen) this.player.webkitRequestFullScreen();
            else if (this.player.mozRequestFullScreen) this.player.mozRequestFullScreen();
            this.IsFullScreen = !this.IsFullScreen;
        },
    },
};
</script>

<style lang="scss">
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
        padding: 5px 0 10px;
        }
        &-current, &-back {
        height: 3px;
        position: absolute;
        top: 10px;
        right: 0;
        left: 0;
        }
        &-current {
        z-index: 2;
        background-color: red;
        transform: scaleX(0);
        transform-origin: left;
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
        justify-content: space-between
    }
    &__btn {
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
    &__icon{
        width: 40px;
    }
    &__volume-icon{
        width: 20px;
    }
    &__time {
        &-wrap {
        display: flex;
        align-items: center;
        justify-content: flex-end
        }
        &-current {
            color: white;
        margin-right: 0.25em;
        font-size: 12px

        }
    }
}

</style>
