<template>
    <div id="app">
        <b-player ref="player" class="player"
                  :settings="setData.settings"
                  @ready="ready($event);$emit('ready',$event);"
                  @resize="resizeBar();"
                  @ended="ended($event)"
                  @loadedmetadata="loadedmetadata($event)"
                  @click="playOrPause($event);
                          $emit('click',$event);"
                  @dblclick="setScreenSize();
                             resizeBar();
                             $emit('dblclick');"
        >
            <template v-slot:header>
                <slot name="header" />
            </template>
            <template v-slot:body>
                <slot name="body" />
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
                <slot name="footer" />
            </template>
        </b-player>
    </div>
</template>

<script>
import sprite      from './sprite';
import setSettings from './m-set-settings';

export default {
    components: {
        'b-player': () => import('./blocks/b-player'),
        'c-btn'   : () => import('./controls/c-btn'),
        'c-time'  : () => import('./controls/c-time'),
        'c-bar'   : () => import('./controls/c-bar'),
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
            return this.setSettings;
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
            console.log(player);

            this.player = player;
            this.resizeBar();
        },

        loadedmetadata(e) {
            this.duration = e;
            this.volume   = this.player.volume;
        },

        ended() {
            this.player.currentTime = 0;
            this.isPlaying          = false;
        },

        playOrPause(e) {
            this.isPlaying ? this.pause() : this.play();
        },

        play() {
            this.player.play();
            this.isPlaying = true;
            this.toLoop();
        },
        toLoop() {
            this.currentTime = this.player.currentTime;
            if (!this.isPlaying) return;
            requestAnimationFrame(() => this.toLoop());
        },
        pause() {
            this.player.pause();
            this.isPlaying = false;
        },

        stop() {
            this.player.currentTime = 0;
            this.pause();
        },

        convertSecondsToTime(time) {
            let seconds = Math.floor(time % 60);

            if (seconds < 10) seconds = `0${seconds}`;

            const minutes = Math.floor((time / 60) % 60);

            return `${minutes}:${seconds}`;
        },

        mutedOrVolume() {
            this.player.muted = !this.player.muted;
            this.isMuted      = this.player.muted;
        },

        setScreenSize() {
            this.isFullScreen ? this.exitFullScreen() : this.setFullScreen();
            this.setIsFullScreen();
            this.$emit('resize', this.isFullScreen);
        },
        resizeBar() {
            this.resizeVolbar();
            this.resizeSeekbar();
            this.setIsFullScreen();
            this.$emit('resize');
        },
        setFullScreen() {
            if(this.$refs.player) {
                const player = this.$refs.player.$el;
                if (player.requestFullScreen) player.requestFullScreen();
                else if (player.webkitRequestFullScreen) player.webkitRequestFullScreen();
                else if (player.mozRequestFullScreen) player.mozRequestFullScreen(); }
        },
        exitFullScreen() {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
        },
        setIsFullScreen() {
            this.isFullScreen = document.fullscreen;
        },
        resizeVolbar() {
            if(this.$refs.volbar) {
                const volbar          = this.$refs.volbar.$el;
                this.volbarWidth      = volbar.clientWidth;
                this.volbarbarOffsetX = volbar.getBoundingClientRect().left; }
        },
        resizeSeekbar() {
            if(this.$refs.timebar) {
                const seekbar       = this.$refs.timebar.$el;
                this.seekbarWidth   = seekbar.clientWidth;
                this.seekbarOffsetX = seekbar.getBoundingClientRect().left; }
        },

        grabSeekbar(e) {
            e.preventDefault();
            this.isDragingSeekbar   = true;
            this.player.currentTime = e.layerX / this.seekbarWidth * this.duration;
            this.currentTime        = this.player.currentTime;
            this.player.pause();
        },
        moveSeekbar(e) {
            e.preventDefault();
            if (!this.isDragingSeekbar) return;
            this.player.currentTime = (e.clientX - this.seekbarOffsetX - window.pageXOffset) / this.seekbarWidth * this.duration;
            this.currentTime        = this.player.currentTime;
        },
        releaseSeekbar(e) {
            e.preventDefault();
            this.isDragingSeekbar = false;
            if (this.isPlaying) this.player.play();
        },

        dragVolbar(e) {
            e.preventDefault();
            this.isDragingVolbar = true;
            this.player.volume   = e.layerX / this.volbarWidth;
            this.volume          = this.player.volume;
        },
        moveVolbar(e) {
            e.preventDefault();
            if (!this.isDragingVolbar) return;
            const currentVolume = e.layerX / this.volbarWidth;
            this.player.volume  = currentVolume > 1 ? 1 : currentVolume;
            this.volume         = this.player.volume;
        },
        releaseVolbar(e) {
            e.preventDefault();
            this.isDragingVolbar = false;
        },
    },

};

</script>
<style lang="scss" >
    .video {
        width: 500px;
        cursor: pointer;
        -webkit-transition: center .3s ease;
        -o-transition: center .3s ease;
        transition: center .3s ease;
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
        .video{
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
        position: relative;
        overflow: hidden;
        width: 500px;
        &.controls-active {
            // .video{
            //     cursor: none;
            // }
            .controls {
                -webkit-transform: translateY(0);
                -ms-transform: translateY(0);
                transform: translateY(0);
            }
        }
    }

    .controls{
        position:absolute;
        bottom: 0;
        left: 0;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        width: 100%;
        padding: 20px 5px 5px;
        -webkit-transition: all .5s ease;
        -o-transition: all .5s ease;
        transition: all .5s ease;
        -webkit-transform: translateY(100%) translateY(1px);
        -ms-transform: translateY(100%) translateY(1px);
        transform: translateY(100%) translateY(1px);
        background: #111;
        &__row{
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;

            align-items: center;
            -webkit-box-align: center;
            -webkit-box-pack: justify;
            -ms-flex-align: center;
            -ms-flex-pack: justify;
            justify-content: space-between;
            &-left{
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                width: 65%;
                margin-left: -5px;

                align-items: center;
                -webkit-box-align: center;
                -ms-flex-align: center;
            }
            &-right{
                margin-right: 5px;
            }
        }
    }

    .btn{
        display : inline-block;
        width: 30px;
        height: 30px;
        padding : 0;
        cursor : pointer;
        -webkit-transition:all, 0.3s, ease-in-out;
        -o-transition:all, 0.3s, ease-in-out;
        transition:all, 0.3s, ease-in-out;
        border : none;
        outline : none;
        background : transparent;
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
            width: 15px;
            height: 15px;
            margin-left: 20px;
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
        position: relative;
        margin: 0 5px;
        margin-bottom: 10px;
        padding: 10px 0 ;
        cursor: pointer;
        &__current, &__back {
            position: absolute;
            top: 31%;
            right: 0;
            left: 0;
            height: 3px;
        }
        &__current {
            z-index: 2;
            -webkit-transform: scaleX(0);
            -ms-transform: scaleX(0);
            transform: scaleX(0);
            -webkit-transform-origin: left;
            -ms-transform-origin: left;
            transform-origin: left;
            background-color: red;
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
        color: white;
        font-size: 14px;
    }
</style>
