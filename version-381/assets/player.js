(function () {
  var video = document.querySelector('[data-player-video]');
  var button = document.querySelector('[data-play-button]');
  var message = document.querySelector('[data-player-message]');

  if (!video || !button) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hlsInstance = null;
  var loaded = false;

  function showMessage(text) {
    if (!message) return;
    message.textContent = text;
    message.classList.add('show');
  }

  function hideMessage() {
    if (!message) return;
    message.textContent = '';
    message.classList.remove('show');
  }

  function playVideo() {
    hideMessage();
    button.classList.add('hide');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        button.classList.remove('hide');
        showMessage('浏览器阻止了自动播放，请再次点击播放。');
      });
    }
  }

  function loadSource() {
    if (!source) {
      showMessage('播放源暂不可用。');
      return;
    }

    if (loaded) {
      playVideo();
      return;
    }

    loaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage('视频加载遇到问题，请刷新页面后重试。');
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
      return;
    }

    video.src = source;
    video.load();
    playVideo();
  }

  button.addEventListener('click', loadSource);
  video.addEventListener('click', function () {
    if (video.paused) {
      loadSource();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
