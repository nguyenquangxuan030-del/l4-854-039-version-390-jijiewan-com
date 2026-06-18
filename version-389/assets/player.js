(function() {
    const HLS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    let hlsLoader = null;

    const loadHls = function() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLoader) {
            return hlsLoader;
        }
        hlsLoader = new Promise(function(resolve, reject) {
            const script = document.createElement('script');
            script.src = HLS_URL;
            script.async = true;
            script.onload = function() {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsLoader;
    };

    const showMessage = function(box, text) {
        let message = box.querySelector('.player-message');
        if (!message) {
            message = document.createElement('div');
            message.className = 'player-message';
            box.appendChild(message);
        }
        message.textContent = text;
        message.classList.add('is-visible');
    };

    const initialize = function(box) {
        if (box.__readyPromise) {
            return box.__readyPromise;
        }

        const video = box.querySelector('video');
        const stream = box.getAttribute('data-stream');

        box.__readyPromise = new Promise(function(resolve, reject) {
            if (!video || !stream) {
                reject(new Error('missing media'));
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                resolve();
                return;
            }

            loadHls().then(function(Hls) {
                if (Hls && Hls.isSupported()) {
                    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function() {
                        resolve();
                    });
                    hls.on(Hls.Events.ERROR, function(event, data) {
                        if (data && data.fatal) {
                            reject(new Error(data.details || 'media error'));
                        }
                    });
                    box.__hls = hls;
                } else {
                    video.src = stream;
                    resolve();
                }
            }).catch(function(error) {
                reject(error);
            });
        });

        return box.__readyPromise;
    };

    const play = function(box) {
        const video = box.querySelector('video');
        const cover = box.querySelector('[data-play-trigger]');

        initialize(box).then(function() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            return video.play();
        }).catch(function() {
            if (cover) {
                cover.classList.remove('is-hidden');
            }
            showMessage(box, '播放加载失败，请稍后重试。');
        });
    };

    document.querySelectorAll('[data-player]').forEach(function(box) {
        const video = box.querySelector('video');
        const cover = box.querySelector('[data-play-trigger]');

        initialize(box).catch(function() {});

        if (cover) {
            cover.addEventListener('click', function() {
                play(box);
            });
        }

        if (video) {
            video.addEventListener('play', function() {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
        }
    });
})();
