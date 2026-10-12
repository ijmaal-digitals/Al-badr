/* Site-wide widgets: WhatsApp button, exit-intent offer popup, newsletter signup */
(function () {
    'use strict';
    var WA = 'https://wa.me/' + ((window.ALBADR_SITE && ALBADR_SITE.clinic && ALBADR_SITE.clinic.whatsapp) || '966551234567');
    var OFFER_KEY = 'albadr_offer_seen', SUB_KEY = 'albadr_subscribed';
    var page = location.pathname.split('/').pop();
    var lang = function () { return (window.getCurrentLanguage ? window.getCurrentLanguage() : 'ar') === 'en' ? 'en' : 'ar'; };
    var L = {
        ar: { wa: 'تواصل عبر واتساب', waMsg: 'مرحباً، أرغب بالاستفسار عن خدماتكم', email: 'بريدك الإلكتروني', ok: 'تم الاشتراك! تحقق من بريدك لكود الخصم', err: 'تعذر الاشتراك، حاول لاحقاً', bad: 'أدخل بريداً إلكترونياً صحيحاً', code: 'كود الخصم' },
        en: { wa: 'Chat on WhatsApp', waMsg: 'Hello, I would like to ask about your services', email: 'Your email', ok: "You're in! Check your inbox for the discount code", err: 'Could not subscribe, please try later', bad: 'Enter a valid email address', code: 'Discount code' }
    };
    var t = function (k) { return L[lang()][k]; };
    var refresh = function () { if (window.updateLocalizedText) window.updateLocalizedText(lang()); };

    function subscribe(email, source, done) {
        fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, source: source, lang: lang() }) })
            .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error); return j; }); })
            .then(function (j) { localStorage.setItem(SUB_KEY, '1'); if (window.albadrTrack) window.albadrTrack('subscribe', { source: source }); done(null, j); })
            .catch(function (e) { done(e); });
    }
    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

    // WhatsApp floating button
    var wa = document.createElement('a');
    wa.className = 'wa-float';
    wa.href = WA;
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.innerHTML = '<svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8c1.8 1 3.9 1.5 6.2 1.5 7.2 0 13-5.8 13-13S23.200 3 16 3zm0 23.700c-2 0-3.900-.5-5.500-1.500l-.4-.2-4 1 1.100-3.900-.3-.4C5.800 19.900 5.300 18 5.300 16c0-5.900 4.800-10.700 10.700-10.700S26.700 10.100 26.700 16 21.900 26.700 16 26.700zm5.900-8c-.3-.2-1.900-.9-2.200-1-.3-.1-.5-.2-.7.200-.2.300-.8 1-1 1.200-.2.200-.4.200-.7.100-.3-.2-1.400-.5-2.600-1.600-1-.9-1.600-1.900-1.800-2.200-.2-.3 0-.5.100-.7l.5-.5c.1-.2.200-.3.300-.5.100-.2 0-.4 0-.5-.1-.2-.7-1.700-1-2.300-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1 1-1 2.500s1.100 2.900 1.200 3.100c.2.200 2.100 3.300 5.200 4.600 3.100 1.200 3.100.8 3.600.8.600-.1 1.900-.8 2.100-1.500.3-.7.300-1.300.2-1.500-.1-.1-.3-.2-.6-.4z"/></svg>';
    document.body.appendChild(wa);
    var setWa = function () { wa.href = WA + '?text=' + encodeURIComponent(t('waMsg')); wa.setAttribute('aria-label', t('wa')); wa.title = t('wa'); };
    setWa();
    window.addEventListener('langchange', setWa);

    // Newsletter signup injected into the footer
    var footer = document.querySelector('.footer .container');
    if (footer && page !== 'manage.html') {
        var nl = document.createElement('form');
        nl.className = 'newsletter';
        nl.noValidate = true;
        nl.innerHTML = '<strong data-ar="اشترك في عروضنا" data-en="Get our offers">اشترك في عروضنا</strong>' +
            '<div class="newsletter-row"><input type="email" dir="ltr" autocomplete="email" required data-ar-placeholder="بريدك الإلكتروني" data-en-placeholder="Your email" placeholder="بريدك الإلكتروني">' +
            '<button class="btn btn-gold" type="submit" data-ar="اشترك" data-en="Subscribe">اشترك</button></div>';
        footer.insertBefore(nl, footer.firstChild);
        nl.onsubmit = function (e) {
            e.preventDefault();
            var v = nl.querySelector('input').value.trim();
            if (!validEmail(v)) return window.showToast(t('bad'));
            subscribe(v, 'footer', function (err) {
                if (err) return window.showToast(t('err'));
                nl.querySelector('input').value = '';
                window.showToast(t('ok'));
            });
        };
    }

    // Exit-intent offer popup
    var skip = { 'contact.html': 1, 'manage.html': 1 };
    if (skip[page] || localStorage.getItem(SUB_KEY)) { refresh(); return; }
    var seen = +localStorage.getItem(OFFER_KEY) || 0;
    if (Date.now() - seen < 7 * 864e5) { refresh(); return; }

    var pop = document.createElement('div');
    pop.className = 'offer-pop';
    pop.hidden = true;
    pop.innerHTML = '<div class="offer-box" role="dialog" aria-modal="true" aria-labelledby="offerTitle">' +
        '<button type="button" class="offer-close" aria-label="Close">×</button>' +
        '<span class="pill" data-ar="عرض خاص" data-en="Special offer">عرض خاص</span>' +
        '<h2 id="offerTitle" data-ar="احصل على خصم 20% على أول تنظيف" data-en="Get 20% off your first cleaning">احصل على خصم 20% على أول تنظيف</h2>' +
        '<p class="muted" data-ar="أدخل بريدك الإلكتروني وسنرسل لك كود الخصم فوراً." data-en="Enter your email and we will send your discount code instantly.">أدخل بريدك الإلكتروني وسنرسل لك كود الخصم فوراً.</p>' +
        '<form class="offer-form" novalidate><input type="email" dir="ltr" autocomplete="email" required data-ar-placeholder="بريدك الإلكتروني" data-en-placeholder="Your email" placeholder="بريدك الإلكتروني">' +
        '<button class="btn btn-gold" type="submit" data-ar="احصل على الخصم" data-en="Claim my 20%">احصل على الخصم</button></form>' +
        '<div class="offer-done" hidden><p class="muted">' + '</p><p class="offer-code"></p><a class="btn btn-gold" href="contact.html?service=checkup" data-ar="احجز الآن" data-en="Book now">احجز الآن</a></div></div>';
    document.body.appendChild(pop);

    var shown = false, lastFocus = null;
    function open() {
        if (shown || document.querySelector('.mobile-drawer.open')) return;
        shown = true;
        localStorage.setItem(OFFER_KEY, String(Date.now()));
        lastFocus = document.activeElement;
        pop.hidden = false;
        requestAnimationFrame(function () { pop.classList.add('open'); });
        pop.querySelector('input').focus();
        refresh();
    }
    function close() {
        pop.classList.remove('open');
        setTimeout(function () { pop.hidden = true; }, 250);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    pop.querySelector('.offer-close').onclick = close;
    pop.onclick = function (e) { if (e.target === pop) close(); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) close(); });
    pop.querySelector('.offer-form').onsubmit = function (e) {
        e.preventDefault();
        var v = pop.querySelector('input').value.trim();
        if (!validEmail(v)) return window.showToast(t('bad'));
        subscribe(v, 'popup', function (err, j) {
            if (err) return window.showToast(t('err'));
            pop.querySelector('.offer-form').hidden = true;
            var done = pop.querySelector('.offer-done');
            done.hidden = false;
            done.querySelector('p.muted').textContent = t('ok');
            done.querySelector('.offer-code').textContent = t('code') + ': ' + (j.code || 'FIRST20');
        });
    };
    window.addEventListener('langchange', function () { var d = pop.querySelector('.offer-done'); if (!d.hidden) { d.querySelector('p.muted').textContent = t('ok'); d.querySelector('.offer-code').textContent = t('code') + ': FIRST20'; } });

    // Desktop: cursor leaves through the top. Mobile: after 40s, or a quick scroll back to the top.
    var armed = false;
    setTimeout(function () { armed = true; }, 5000);
    document.addEventListener('mouseout', function (e) { if (armed && !e.relatedTarget && e.clientY <= 0) open(); });
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
        var y = window.scrollY;
        if (armed && 'ontouchstart' in window && lastY - y > 400 && lastY > 800) open();
        lastY = y;
    }, { passive: true });
    if ('ontouchstart' in window) setTimeout(open, 40000);
    refresh();
})();
