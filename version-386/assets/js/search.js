(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function escapeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function card(movie) {
    return [
      '<article class="movie-card" data-card>',
      '<a href="' + escapeText(movie.url) + '" class="card-link">',
      '<div class="card-cover">',
      '<img src="' + escapeText(movie.cover) + '" alt="' + escapeText(movie.title) + '" loading="lazy">',
      '<span class="area-badge">' + escapeText(movie.regionLabel) + '</span>',
      '<span class="score-badge">' + escapeText(movie.score) + '</span>',
      '</div>',
      '<div class="card-body">',
      '<h2>' + escapeText(movie.title) + '</h2>',
      '<p>' + escapeText(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeText(movie.region) + '</span><span>' + escapeText(movie.year) + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  ready(function () {
    var data = window.MOVIE_SEARCH_DATA || [];
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var region = document.querySelector("[data-search-region]");
    var type = document.querySelector("[data-search-type]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    if (!form || !input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) {
      input.value = params.get("q");
    }
    if (params.get("region") && region) {
      region.value = params.get("region");
    }
    if (params.get("type") && type) {
      type.value = params.get("type");
    }

    function render() {
      var q = input.value.trim().toLowerCase();
      var selectedRegion = region ? region.value : "";
      var selectedType = type ? type.value : "";
      var matched = data.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        if (q && haystack.indexOf(q) === -1) {
          return false;
        }
        if (selectedRegion && movie.regionKey !== selectedRegion) {
          return false;
        }
        if (selectedType && movie.typeKey !== selectedType) {
          return false;
        }
        return true;
      }).slice(0, 96);

      results.innerHTML = matched.map(card).join("");
      if (summary) {
        summary.textContent = matched.length ? "为你找到相关影片" : "没有找到匹配影片";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    render();
  });
})();
