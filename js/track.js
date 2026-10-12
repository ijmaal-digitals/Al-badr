/* Analytics: GA4 + Meta Pixel (loaded only after consent), conversion events, first-touch attribution */
(function () {
    'use strict';
    var S = window.ALBADR_SITE || {}, T = S.tracking || {};
    var CK = 'albadr_consent', AK = 'albadr_attr';
    var lang = function () { return (window.getCurrentLanguage ? window.getCurrentLanguage() : document.documentElement.lang) === 'en' ? 'en' : 'ar'; };

    // First-touch attribution (UTM / click ids), sent with the booking
    try {
        var q = new URLSearchParams(location.search), keys = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid'], found = {};
        keys.forEach(function (k) { if (q.get(k)) found[k] = q.get(k).slice(0, 80); });
        if (!localStorage.getItem(AK) && Object.keys(found).length) localStorage.setItem(AK, JSON.stringify(found));
        else if (!localStorage.getItem(AK) && document.referrer) {
            var h = new URL(document.referrer).hostname;
            if (h && h !== location.hostname) localStorage.setItem(AK, JSON.stringify({ utm_source: h.replace(/^www\./, ''), utm_medium: 'referral' }));
        }
    } catch (e) { /* storage blocked */ }
    window.albadrAttribution = function () { try { return JSON.parse(localStorage.getItem(AK) || 'null') || undefined; } catch (e) { return undefined; } };

    var loaded = false, queue = [];
    function gtagCall() { window.dataLayer.push(arguments); }

    function load() {
        if (loaded || (!T.ga4 && !T.metaPixel)) return;
        loaded = true;
        if (T.ga4) {
            window.dataLayer = window.dataLayer || [];
            window.gtag = gtagCall;
            var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(T.ga4); document.head.appendChild(s);
            window.gtag('js', new Date()); window.gtag('config', T.ga4);
        }
        if (T.metaPixel) {
            /* eslint-disable */
            !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            /* eslint-enable */
            window.fbq('init', T.metaPixel); window.fbq('track', 'PageView');
        }
        queue.splice(0).forEach(function (a) { fire(a[0], a[1]); });
    }

    var MAP = {
        booking_start: ['begin_checkout', 'InitiateCheckout'],
        booking_confirmed: ['generate_lead', null],
        deposit_paid: ['purchase', 'Purchase'],
        subscribe: ['sign_up', 'Subscribe'],
        contact: ['contact', 'Contact'],
        view_service: ['view_item', 'ViewContent']
    };
    function fire(name, p) {
        p = p || {};
        var m = MAP[name]; if (!m) return;
        var cur = { currency: 'SAR', value: Number(p.value) || 0 };
        if (window.gtag) {
            var gp = { method: p.method || p.source || undefined, item_id: p.service || undefined };
            if (name === 'deposit_paid') gp = Object.assign(gp, cur, { transaction_id: p.id });
            if (name === 'booking_confirmed' || name === 'booking_start') gp = Object.assign(gp, cur);
            window.gtag('event', m[0], gp);
        }
        if (window.fbq) {
            if (name === 'booking_confirmed') { window.fbq('track', 'Lead', cur); window.fbq('track', 'Schedule', cur); }
            else if (m[1]) window.fbq('track', m[1], name === 'deposit_paid' || name === 'booking_start' ? cur : { content_name: p.service || p.method || undefined });
        }
    }
    window.albadrTrack = function (name, params) { if (loaded) fire(name, params); else queue.push([name, params]); };

    // Phone / WhatsApp / directions clicks
    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
        var h = a.getAttribute('href') || '';
        if (/^tel:/i.test(h)) window.albadrTrack('contact', { method: 'phone' });
        else if (/^https:\/\/wa\.me\//i.test(h)) window.albadrTrack('contact', { method: 'whatsapp' });
        else if (a.dataset.track) window.albadrTrack('contact', { method: a.dataset.track });
    });

    var svc = location.pathname.match(/service-([a-z-]+)\.html$/);
    if (svc) window.albadrTrack('view_service', { service: svc[1] });

    // Consent banner (PDPL): trackers load only after acceptance unless consent is disabled in admin
    if (!T.ga4 && !T.metaPixel) return;
    var c = null; try { c = localStorage.getItem(CK); } catch (e) { /* ignore */ }
    if (T.consent === false || c === 'granted') { load(); return; }
    if (c === 'denied') return;
    var TXT = { ar: ['نستخدم ملفات تعريف الارتباط لتحليل الزيارات وتحسين إعلاناتنا.', 'موافق', 'رفض'], en: ['We use cookies to analyse visits and improve our advertising.', 'Accept', 'Decline'] };
    var bar = document.createElement('div');
    bar.className = 'consent-bar'; bar.setAttribute('role', 'dialog');
    bar.innerHTML = '<p></p><div><button class="btn btn-gold" data-v="granted"></button><button class="btn btn-ghost" data-v="denied"></button></div>';
    function paint() { var t = TXT[lang()]; bar.querySelector('p').textContent = t[0]; bar.querySelector('[data-v=granted]').textContent = t[1]; bar.querySelector('[data-v=denied]').textContent = t[2]; }
    bar.onclick = function (e) {
        var v = e.target.dataset && e.target.dataset.v; if (!v) return;
        try { localStorage.setItem(CK, v); } catch (x) { /* ignore */ }
        bar.remove(); if (v === 'granted') load();
    };
    window.addEventListener('langchange', paint);
    paint();
    document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(bar); });
    if (document.readyState !== 'loading') document.body.appendChild(bar);
})();
