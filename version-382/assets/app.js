(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards(value) {
    var keyword = normalize(value);
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.classList.toggle('is-filter-hidden', !matched);
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      searchInputs.forEach(function (other) {
        if (other !== input && other.value !== input.value) {
          other.value = input.value;
        }
      });
      filterCards(input.value);
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeIndex);
    });
  }

  function schedule() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(activeIndex - 1);
      schedule();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(activeIndex + 1);
      schedule();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
      schedule();
    });
  });

  schedule();
})();
