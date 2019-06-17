<template>
    <div id="app">
        <b-player ref="player" class="player"
                  :settings="setData.settings"
                  @ready="ready($event)"
                  @resize="resizeBar();"
                  @ended="ended($event)"
                  @loadedmetadata="loadedmetadata($event)"
                  @click="playOrPause($event);
                          $emit('click');"
                  @dblclick="setScreenSize();
                             resizeBar();
                             emit('click');"
        >
            <template v-slot:header>
                <slot name="header"></slot>
            </template>
            <template v-slot:body>
                <slot name="body"></slot>
            </template>
            <template v-slot:controls v-if="setData.settings.controls">
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
        </b-player>
    </div>
</template>

<script>
import sprite from './sprite';
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
            this.resizeBar()
            this.$emit('ready', this.player);
        },

        loadedmetadata(e) {
            this.duration = e;
            this.volume = this.player.volume;
            this.$emit('loadedmetadata', this.player);
        },

        ended() {
            this.player.currentTime = 0;
            this.isPlaying = false;
            this.$emit('ended', this.player);
        },

        playOrPause(e) {
            this.isPlaying ? this.pause() : this.play();
        },

        play() {
            this.player.play();
            this.isPlaying = true;
            this.toLoop();
            this.$emit('play');
        },
        toLoop() {
            this.currentTime = this.player.currentTime;
            if (!this.isPlaying) return;
            requestAnimationFrame(() => this.toLoop());
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
            this.isFullScreen ? this.exitFullScreen() : this.setFullScreen();
            this.setIsFullScreen();
            this.$emit('resize', this.isFullScreen);
        },
        resizeBar(){
            this.resizeVolbar();
            this.resizeSeekbar();
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
            this.isFullScreen = document.fullscreen;
        },
        resizeVolbar() {
            const volbar = this.$refs.volbar.$el;
            this.volbarWidth = volbar.clientWidth;
            this.volbarbarOffsetX = volbar.getBoundingClientRect().left;
        },
        resizeSeekbar() {
            const seekbar = this.$refs.timebar.$el;
            this.seekbarWidth = seekbar.clientWidth;
            this.seekbarOffsetX = seekbar.getBoundingClientRect().left;
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
    },

};

</script>
<style lang="scss" >
    .video {
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
