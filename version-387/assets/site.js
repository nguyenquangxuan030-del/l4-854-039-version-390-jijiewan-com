(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-scroll-target]').forEach(function (button) {
    button.addEventListener('click', function () {
      const selector = button.getAttribute('data-scroll-target');
      const direction = button.getAttribute('data-direction') === 'left' ? -1 : 1;
      const target = document.querySelector(selector);
      if (target) {
        target.scrollBy({ left: direction * 420, behavior: 'smooth' });
      }
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-search-input]');
    const chips = Array.from(scope.querySelectorAll('[data-filter]'));
    const grid = scope.nextElementSibling && scope.nextElementSibling.matches('[data-card-grid]') ? scope.nextElementSibling : document.querySelector('[data-card-grid]');
    const empty = grid ? grid.parentElement.querySelector('[data-empty-state]') : null;
    let activeFilter = 'all';

    function apply() {
      if (!grid) {
        return;
      }
      const query = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;
      grid.querySelectorAll('[data-card]').forEach(function (card) {
        const text = (card.getAttribute('data-text') || '').toLowerCase();
        const type = card.getAttribute('data-type') || '';
        const matchedText = !query || text.indexOf(query) !== -1;
        const matchedFilter = activeFilter === 'all' || type.indexOf(activeFilter) !== -1 || text.indexOf(activeFilter.toLowerCase()) !== -1;
        const showCard = matchedText && matchedFilter;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('active', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });

    apply();
  });
})();
