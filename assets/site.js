(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var siteMenu = document.querySelector('[data-site-menu]');

  if (menuToggle && siteMenu) {
    menuToggle.addEventListener('click', function () {
      var isOpen = siteMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    });
  });

  document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
    button.addEventListener('click', function () {
      var id = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
      var rail = document.getElementById(id);
      if (!rail) {
        return;
      }
      var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
      rail.scrollBy({
        left: direction * 420,
        behavior: 'smooth'
      });
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var scope = panel.parentElement || document;
    var items = Array.prototype.slice.call(scope.querySelectorAll('.filter-item'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(input && input.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var regionValue = normalize(regionSelect && regionSelect.value);

      items.forEach(function (item) {
        var haystack = normalize(item.textContent + ' ' + Object.values(item.dataset).join(' '));
        var typeText = normalize(item.dataset.type);
        var regionText = normalize(item.dataset.region);
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !typeValue || typeText.indexOf(typeValue) !== -1 || haystack.indexOf(typeValue) !== -1;
        var matchesRegion = !regionValue || regionText.indexOf(regionValue) !== -1;
        item.classList.toggle('hidden', !(matchesQuery && matchesType && matchesRegion));
      });
    }

    [input, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  var hlsLoader = null;

  function getHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (!hlsLoader) {
      hlsLoader = import('./player-core.js')
        .then(function (module) {
          return module.H || module.default || window.Hls;
        })
        .catch(function () {
          return loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest').then(function () {
            return window.Hls;
          });
        });
    }
    return hlsLoader;
  }

  function startVideo(box) {
    var video = box.querySelector('[data-video]');
    var source = box.getAttribute('data-src');
    if (!video || !source) {
      return;
    }

    box.classList.add('playing');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }
      video.play().catch(function () {});
      return;
    }

    getHls().then(function (Hls) {
      if (Hls && Hls.isSupported && Hls.isSupported()) {
        if (box._hlsInstance) {
          box._hlsInstance.destroy();
        }
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        box._hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else {
        video.src = source;
        video.play().catch(function () {});
      }
    }).catch(function () {
      video.src = source;
      video.play().catch(function () {});
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var playButton = box.querySelector('[data-play-button]');
    if (playButton) {
      playButton.addEventListener('click', function () {
        startVideo(box);
      });
    }
    box.addEventListener('click', function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
        return;
      }
      if (!box.classList.contains('playing')) {
        startVideo(box);
      }
    });
  });
})();
