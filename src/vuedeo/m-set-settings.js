const setSettings = {
    computed: {
        setSettings() {
            return {
                button: {
                    fullscreen: {
                        class : 'btn--fullscreen btn',
                        action: () => this.setScreenSize(),
                        icons : [
                            { id : 'fullscreenOn', class : 'icon--fullscreen-on icon', show : !this.isFullScreen },
                            { id : 'fullscreenOff', class : 'icon--fullscreen icon', show : this.isFullScreen }
                        ],
                    },
                    playControl: {
                        class : 'btn--play-control btn',
                        action: () => this.playOrPause(),
                        icons : [
                            { id : 'play', class : 'icon--play icon', show : !this.isPlaying },
                            { id : 'pause', class : 'icon--pause icon', show : this.isPlaying }
                        ],
                    },
                    stop: {
                        class : 'btn--stop btn',
                        action: () => this.stop(),
                        icons : [
                            { id : 'stop', class : 'icon--stop icon', show : true }
                        ],
                    },
                    muted: {
                        class : 'btn--muted btn',
                        action: () => this.mutedOrVolume(),
                        icons : [
                            { id : 'volume', class : 'icon--volume icon', show : !this.isMuted },
                            { id : 'muted', class : 'icon--muted icon', show : this.isMuted }
                        ],
                    },

                },
                bar: {
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

                },
                timeSeconds: {
                    current: {
                        class: 'time-seconds time--current',
                        time : this.getCurrentTime,
                    },
                    duration: {
                        class: 'time-seconds time--duration',
                        time : this.getDuration,
                    },

                },
                settings: {
                    isFullScreen: this.isFullScreen,
                    autoplay    : false,
                    loop        : false,
                    muted       : false,
                    poster      : '',
                    preload     : 'metadata',
                    controls    : true,
                    class       : 'video',
                    videos      : this.videos,
                },
            };
        },

    },
};
export default setSettings;
