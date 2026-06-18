(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
        document.body.classList.toggle("menu-open", mobilePanel.classList.contains("open"));
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;
      var setSlide = function (next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          setSlide(index + 1);
        }, 5200);
      };
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });
      start();
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-year-filter]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var year = chip.getAttribute("data-year-filter");
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          cards.forEach(function (card) {
            var show = year === "all" || card.getAttribute("data-year") === year;
            card.style.display = show ? "" : "none";
          });
        });
      });
    });

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      var input = searchPage.querySelector("[data-search-input]");
      var channel = searchPage.querySelector("[data-channel-select]");
      var year = searchPage.querySelector("[data-year-select]");
      var cards = Array.prototype.slice.call(searchPage.querySelectorAll("[data-movie-card]"));
      if (input) {
        input.value = q;
      }
      var apply = function () {
        var text = input ? input.value.trim().toLowerCase() : "";
        var selectedChannel = channel ? channel.value : "all";
        var selectedYear = year ? year.value : "all";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-genre") || ""
          ].join(" ").toLowerCase();
          var matchText = !text || haystack.indexOf(text) !== -1;
          var matchChannel = selectedChannel === "all" || card.getAttribute("data-channel") === selectedChannel;
          var matchYear = selectedYear === "all" || card.getAttribute("data-year") === selectedYear;
          card.style.display = matchText && matchChannel && matchYear ? "" : "none";
        });
      };
      [input, channel, year].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    }

    var player = document.querySelector("[data-player]");
    if (player) {
      var video = player.querySelector("video");
      var playButton = player.querySelector("[data-play]");
      var playUrl = video ? video.getAttribute("data-video") : "";
      var hlsInstance = null;
      var loadStarted = false;
      var getHls = function () {
        if (window.Hls) {
          return Promise.resolve(window.Hls);
        }
        return import("./assets/video-vendor-dru42stk.js").then(function (mod) {
          return mod.H;
        }).catch(function () {
          return null;
        });
      };
      var prepare = function () {
        if (!video || !playUrl || loadStarted) {
          return Promise.resolve();
        }
        loadStarted = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playUrl;
          return Promise.resolve();
        }
        return getHls().then(function (HlsCtor) {
          if (HlsCtor && HlsCtor.isSupported()) {
            hlsInstance = new HlsCtor({ capLevelToPlayerSize: true });
            hlsInstance.loadSource(playUrl);
            hlsInstance.attachMedia(video);
          } else {
            video.src = playUrl;
          }
        });
      };
      var begin = function () {
        prepare().then(function () {
          if (playButton) {
            playButton.classList.add("is-hidden");
          }
          var attempt = video.play();
          if (attempt && attempt.catch) {
            attempt.catch(function () {
              if (playButton) {
                playButton.classList.remove("is-hidden");
              }
            });
          }
        });
      };
      prepare();
      if (playButton) {
        playButton.addEventListener("click", begin);
      }
      if (video) {
        video.addEventListener("play", function () {
          if (playButton) {
            playButton.classList.add("is-hidden");
          }
        });
        video.addEventListener("click", function () {
          if (video.paused) {
            begin();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
