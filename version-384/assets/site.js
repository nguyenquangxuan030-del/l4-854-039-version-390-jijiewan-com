document.addEventListener("DOMContentLoaded", function () {
  var nav = document.querySelector(".site-nav");
  var toggle = document.querySelector(".menu-toggle");

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var slides = Array.from(document.querySelectorAll(".hero-slide"));
  var dots = Array.from(document.querySelectorAll(".hero-dot"));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  document.querySelectorAll("[data-scroll-target]").forEach(function (button) {
    button.addEventListener("click", function () {
      var target = document.querySelector(button.dataset.scrollTarget);
      var direction = button.dataset.scrollDirection === "left" ? -1 : 1;

      if (target) {
        target.scrollBy({ left: direction * 400, behavior: "smooth" });
      }
    });
  });

  document.querySelectorAll("[data-filter-page]").forEach(function (page) {
    var search = page.querySelector(".js-search");
    var filters = Array.from(page.querySelectorAll(".js-filter"));
    var cards = Array.from(page.querySelectorAll(".js-card"));
    var empty = page.querySelector(".empty-state");

    function applyFilters() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var activeFilters = filters.map(function (filter) {
        return {
          key: filter.dataset.key,
          value: filter.value.trim().toLowerCase()
        };
      });
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.dataset.search || "").toLowerCase();
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesFilter = activeFilters.every(function (filter) {
          if (!filter.value || filter.value === "all") {
            return true;
          }

          return String(card.dataset[filter.key] || "").toLowerCase() === filter.value;
        });
        var shouldShow = matchesQuery && matchesFilter;

        card.classList.toggle("is-filtered-out", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    filters.forEach(function (filter) {
      filter.addEventListener("change", applyFilters);
    });

    applyFilters();
  });
});
