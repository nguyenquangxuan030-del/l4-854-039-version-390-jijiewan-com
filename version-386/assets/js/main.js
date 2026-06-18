(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
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

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
      });
      show(0);
      restart();
    }

    document.querySelectorAll("[data-scroll-button]").forEach(function (button) {
      button.addEventListener("click", function () {
        var targetName = button.getAttribute("data-scroll-target");
        var area = document.querySelector('[data-scroll-area="' + targetName + '"]');
        if (!area) {
          return;
        }
        var direction = button.getAttribute("data-scroll-button") === "left" ? -1 : 1;
        area.scrollBy({ left: direction * 420, behavior: "smooth" });
      });
    });

    document.querySelectorAll("[data-local-filter]").forEach(function (form) {
      var scope = form.closest("section") || document;
      var list = scope.querySelector("[data-filter-list]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];
      var empty = scope.querySelector("[data-empty-state]");
      var keyword = form.querySelector("[data-filter-keyword]");
      var type = form.querySelector("[data-filter-type]");
      var year = form.querySelector("[data-filter-year]");
      var reset = form.querySelector("[data-filter-reset]");

      function apply() {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var selectedType = type ? type.value : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (selectedType && card.getAttribute("data-type") !== selectedType) {
            ok = false;
          }
          if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      if (reset) {
        reset.addEventListener("click", function () {
          form.reset();
          apply();
        });
      }
      apply();
    });
  });
})();
