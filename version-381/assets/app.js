(function () {
  function norm(value) {
    return String(value || '').trim().toLowerCase();
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuToggle = qs('[data-menu-toggle]');
  var mobileMenu = qs('[data-mobile-menu]');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = qs('[data-hero]');

  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var cards = qsa('[data-card]');
  var searchInput = qs('[data-search-input]');
  var resultCount = qs('[data-result-count]');
  var emptyState = qs('[data-empty-state]');
  var filterBar = qs('[data-filter-bar]');
  var activeFilter = 'all';

  function updateCards() {
    if (!cards.length) return;
    var query = norm(searchInput ? searchInput.value : '');
    var shown = 0;

    cards.forEach(function (card) {
      var haystack = norm(card.getAttribute('data-search'));
      var type = norm(card.getAttribute('data-type'));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesFilter = activeFilter === 'all' || type === activeFilter || haystack.indexOf(activeFilter) !== -1;
      var visible = matchesQuery && matchesFilter;
      card.classList.toggle('hidden-card', !visible);
      if (visible) shown += 1;
    });

    if (resultCount) {
      resultCount.textContent = shown + ' 部影片';
    }

    if (emptyState) {
      emptyState.classList.toggle('show', shown === 0);
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }
    searchInput.addEventListener('input', updateCards);
  }

  if (filterBar) {
    qsa('[data-filter]', filterBar).forEach(function (button) {
      button.addEventListener('click', function () {
        qsa('[data-filter]', filterBar).forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        activeFilter = norm(button.getAttribute('data-filter')) || 'all';
        updateCards();
      });
    });
  }

  qsa('.search-page-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      updateCards();
      var input = qs('input[name="q"]', form);
      var url = new URL(window.location.href);
      var value = input ? input.value.trim() : '';
      if (value) {
        url.searchParams.set('q', value);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
    });
  });

  updateCards();
})();
