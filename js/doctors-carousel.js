(function () {
    'use strict';
    var track = document.getElementById('doctorCarouselTrack');
    if (!track) return;

    var cards = Array.prototype.slice.call(track.children);
    var prev = document.querySelector('.doctor-carousel-prev');
    var next = document.querySelector('.doctor-carousel-next');
    var index = 0;

    function stepSize() {
        return cards[0].getBoundingClientRect().width +
            parseFloat(window.getComputedStyle(track).gap || '0');
    }

    function updateIndex() {
        var max = track.scrollWidth - track.clientWidth;
        index = track.scrollLeft >= max - 2 ? cards.length - 1 : Math.round(track.scrollLeft / stepSize());
    }

    function goTo(i) {
        index = (i + cards.length) % cards.length;
        var max = track.scrollWidth - track.clientWidth;
        track.scrollTo({ left: Math.min(index * stepSize(), max), behavior: 'smooth' });
    }

    prev.addEventListener('click', function () { goTo(index - 1); });
    next.addEventListener('click', function () { goTo(index + 1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(updateIndex); }, { passive: true });

    function labels() {
        var en = document.documentElement.lang === 'en';
        prev.setAttribute('aria-label', en ? prev.dataset.enLabel : prev.dataset.arLabel);
        next.setAttribute('aria-label', en ? next.dataset.enLabel : next.dataset.arLabel);
    }
    labels();
    window.addEventListener('langchange', labels);
})();
