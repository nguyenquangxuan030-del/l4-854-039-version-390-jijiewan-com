(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function advance(step) {
            show(current + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                advance(1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                advance(-1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                advance(1);
                start();
            });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initRails() {
        document.querySelectorAll("[data-rail]").forEach(function (rail) {
            var section = rail.closest("[data-rail-section]");
            var prev = section ? section.querySelector("[data-rail-prev]") : null;
            var next = section ? section.querySelector("[data-rail-next]") : null;

            function move(direction) {
                var amount = Math.max(280, rail.clientWidth * 0.75);
                rail.scrollBy({
                    left: direction * amount,
                    behavior: "smooth"
                });
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    move(-1);
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    move(1);
                });
            }
        });
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-target");
            var target = targetSelector ? document.querySelector(targetSelector) : null;

            if (!target) {
                return;
            }

            var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));
            var input = panel.querySelector("[data-search-input]");
            var region = panel.querySelector("[data-region-filter]");
            var kind = panel.querySelector("[data-kind-filter]");
            var empty = target.parentElement ? target.parentElement.querySelector("[data-no-results]") : null;

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var kindValue = kind ? kind.value : "";
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardKind = card.getAttribute("data-kind") || "";
                    var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                    var regionMatch = !regionValue || cardRegion === regionValue;
                    var kindMatch = !kindValue || cardKind.indexOf(kindValue) !== -1;
                    var visible = keywordMatch && regionMatch && kindMatch;

                    card.style.display = visible ? "" : "none";

                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            }

            [input, region, kind].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    window.SitePlayer = {
        mount: function (videoId, buttonId, source) {
            var video = document.getElementById(videoId);
            var button = document.getElementById(buttonId);
            var hls = null;
            var initialized = false;

            if (!video || !button || !source) {
                return;
            }

            function attach() {
                if (initialized) {
                    return Promise.resolve();
                }

                initialized = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return new Promise(function (resolve) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                        window.setTimeout(resolve, 1200);
                    });
                }

                video.src = source;
                return Promise.resolve();
            }

            function play() {
                attach().then(function () {
                    button.classList.add("is-hidden");
                    video.controls = true;
                    var result = video.play();

                    if (result && typeof result.catch === "function") {
                        result.catch(function () {
                            button.classList.remove("is-hidden");
                        });
                    }
                });
            }

            button.addEventListener("click", play);

            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });

            video.addEventListener("pause", function () {
                if (!video.ended) {
                    button.classList.remove("is-hidden");
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    };

    ready(function () {
        initNavigation();
        initHeroSlider();
        initRails();
        initFilters();
    });
})();
