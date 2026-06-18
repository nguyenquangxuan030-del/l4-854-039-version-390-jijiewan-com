(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    document.querySelectorAll("[data-player-frame]").forEach(function (frame) {
      var video = frame.querySelector("video[data-stream]");
      var button = frame.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }

      var loaded = false;
      var hlsInstance = null;

      function loadStream() {
        if (loaded) {
          return;
        }
        var stream = video.getAttribute("data-stream");
        if (!stream) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      function startPlayback() {
        loadStream();
        button.hidden = true;
        frame.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.hidden = false;
            frame.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", startPlayback);
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        button.hidden = true;
        frame.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          button.hidden = false;
        }
      });
      video.addEventListener("ended", function () {
        button.hidden = false;
        frame.classList.remove("is-playing");
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
