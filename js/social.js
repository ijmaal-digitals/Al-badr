/* Social: footer icons from site settings + Instagram feed grid */
(function () {
    'use strict';
    var S = window.ALBADR_SITE || {}, soc = S.social || {};
    var lang = function () { return (window.getCurrentLanguage ? window.getCurrentLanguage() : 'ar') === 'en' ? 'en' : 'ar'; };
    var NAMES = { instagram: 'Instagram', snapchat: 'Snapchat', tiktok: 'TikTok', x: 'X', facebook: 'Facebook', youtube: 'YouTube' };

    var box = document.querySelector('.footer .container');
    var links = Object.keys(NAMES).filter(function (k) { return /^https:\/\//.test(soc[k] || ''); });
    if (box && links.length) {
        var row = document.createElement('div');
        row.className = 'social-row';
        links.forEach(function (k) {
            var a = document.createElement('a');
            a.href = soc[k]; a.target = '_blank'; a.rel = 'noopener me'; a.textContent = NAMES[k]; a.setAttribute('aria-label', NAMES[k]);
            row.appendChild(a);
        });
        box.appendChild(row);
    }

    var feed = document.getElementById('igFeed');
    if (!feed) return;
    var follow = function () {
        var a = document.createElement('a');
        a.className = 'btn btn-ghost ig-follow'; a.href = feed.dataset.profile; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = lang() === 'en' ? 'Follow @ on Instagram' : 'تابعنا على إنستغرام';
        return a;
    };
    fetch('/api/instagram').then(function (r) { return r.json(); }).then(function (j) {
        (j.posts || []).forEach(function (p) {
            var a = document.createElement('a'), img = document.createElement('img');
            a.href = p.link; a.target = '_blank'; a.rel = 'noopener'; a.className = 'ig-item';
            img.src = p.image; img.alt = p.caption || 'Instagram'; img.loading = 'lazy';
            a.appendChild(img); feed.appendChild(a);
        });
        feed.appendChild(follow());
    }).catch(function () { feed.appendChild(follow()); });
})();
