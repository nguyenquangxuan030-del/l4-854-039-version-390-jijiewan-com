(function () {
  function select(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = select("[data-nav-toggle]");
    var menu = select("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = select("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var previous = select("[data-hero-prev]", hero);
    var next = select("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
        play();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  function setupHorizontalScroll() {
    selectAll("[data-scroll-wrap]").forEach(function (wrap) {
      var list = select("[data-scroll-list]", wrap);
      var left = select("[data-scroll-left]", wrap);
      var right = select("[data-scroll-right]", wrap);
      if (!list) {
        return;
      }
      function move(direction) {
        var distance = Math.min(420, Math.max(280, list.clientWidth * 0.72));
        list.scrollBy({
          left: direction * distance,
          behavior: "smooth"
        });
      }
      if (left) {
        left.addEventListener("click", function () {
          move(-1);
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          move(1);
        });
      }
    });
  }

  function setupSearch() {
    var input = select("[data-search-input]");
    if (!input) {
      return;
    }
    var cards = selectAll("[data-search-card]");
    var clearButton = select("[data-search-clear]");
    var empty = select("[data-empty-state]");

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function filter() {
      var query = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title"));
        var matched = !query || text.indexOf(query) !== -1;
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", filter);
    if (clearButton) {
      clearButton.addEventListener("click", function () {
        input.value = "";
        filter();
        input.focus();
      });
    }
    filter();
  }

  function attachPlayer(streamUrl) {
    var video = select("[data-player-video]");
    var cover = select("[data-player-cover]");
    var button = select("[data-player-button]");
    var prepared = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
      prepared = true;
    }

    function hideCover() {
      if (cover) {
        cover.hidden = true;
      }
    }

    function showCover() {
      if (cover && video.paused) {
        cover.hidden = false;
      }
    }

    function start() {
      prepare();
      hideCover();
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          showCover();
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    video.addEventListener("play", hideCover);
    video.addEventListener("pause", showCover);
    video.addEventListener("ended", showCover);

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.MovieSite = {
    attachPlayer: attachPlayer
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHero();
    setupHorizontalScroll();
    setupSearch();
  });
})();
