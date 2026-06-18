(function() {
    const menuButton = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function() {
            menu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let index = 0;
        let timer = null;

        const show = function(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        const start = function() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        };

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        start();
    }

    document.querySelectorAll('[data-scroll-left]').forEach(function(button) {
        button.addEventListener('click', function() {
            const target = document.getElementById(button.getAttribute('data-scroll-left'));
            if (target) {
                target.scrollBy({ left: -380, behavior: 'smooth' });
            }
        });
    });

    document.querySelectorAll('[data-scroll-right]').forEach(function(button) {
        button.addEventListener('click', function() {
            const target = document.getElementById(button.getAttribute('data-scroll-right'));
            if (target) {
                target.scrollBy({ left: 380, behavior: 'smooth' });
            }
        });
    });

    const searchInput = document.querySelector('[data-card-search]');
    const filterSelects = Array.from(document.querySelectorAll('[data-card-filter]'));
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const emptyState = document.querySelector('[data-empty-state]');

    const normalize = function(value) {
        return String(value || '').trim().toLowerCase();
    };

    const applyFilters = function() {
        const term = normalize(searchInput ? searchInput.value : '');
        const filters = {};
        filterSelects.forEach(function(select) {
            filters[select.getAttribute('data-card-filter')] = normalize(select.value);
        });

        let visible = 0;
        cards.forEach(function(card) {
            const haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));

            const matchesTerm = !term || haystack.indexOf(term) !== -1;
            const matchesFilters = Object.keys(filters).every(function(key) {
                return !filters[key] || normalize(card.getAttribute('data-' + key)) === filters[key];
            });
            const isVisible = matchesTerm && matchesFilters;
            card.classList.toggle('is-hidden', !isVisible);
            if (isVisible) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filterSelects.forEach(function(select) {
        select.addEventListener('change', applyFilters);
    });
})();
