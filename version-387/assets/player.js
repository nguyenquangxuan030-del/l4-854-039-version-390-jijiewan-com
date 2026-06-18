(function () {
  const player = document.querySelector('[data-player]');
  if (!player) {
    return;
  }

  const video = player.querySelector('video');
  const button = player.querySelector('[data-player-start]');
  const message = document.querySelector('[data-player-message]');
  const source = video ? video.getAttribute('data-src') : '';
  let prepared = false;
  let hlsInstance = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('hls unavailable'));
        }
      };
      script.onerror = function () {
        reject(new Error('hls load failed'));
      };
      document.head.appendChild(script);
    });
  }

  async function prepare() {
    if (prepared || !video || !source) {
      return;
    }

    prepared = true;
    setMessage('正在连接高清播放源');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setMessage('');
      return;
    }

    try {
      const Hls = await loadHls();
      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          setMessage('');
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放源连接异常，请稍后重试');
          }
        });
      } else {
        video.src = source;
        setMessage('');
      }
    } catch (error) {
      video.src = source;
      setMessage('');
    }
  }

  async function startPlayback() {
    if (!video) {
      return;
    }

    await prepare();

    if (button) {
      button.classList.add('is-hidden');
    }

    try {
      await video.play();
    } catch (error) {
      if (button) {
        button.classList.remove('is-hidden');
      }
      setMessage('点击播放按钮开始播放');
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
