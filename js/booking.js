/* Booking wizard: service -> doctor -> date/time -> details -> deposit -> confirmation */
(function () {
    'use strict';
    var root = document.getElementById('bookingApp');
    if (!root) return;

    var T = {
        ar: {
            title: 'احجز موعدك', steps: ['الخدمة', 'الطبيب', 'الموعد والتأكيد'],
            pickService: 'اختر الخدمة', pickDoctor: 'اختر طبيبك', pickDate: 'اختر اليوم والوقت', min: 'دقيقة', sar: 'ريال', deposit: 'عربون',
            noSlots: 'لا توجد أوقات متاحة في هذا اليوم', loading: 'جاري التحميل...', next: 'التالي', back: 'رجوع', prev: 'السابق',
            name: 'الاسم الكامل', phone: 'رقم الجوال (05xxxxxxxx)', email: 'البريد الإلكتروني (اختياري)', notes: 'ملاحظات (اختياري)',
            summary: 'ملخص الحجز', payTitle: 'ادفع العربون لتأكيد الموعد', payNote: 'العربون يُخصم من قيمة العلاج، ويُسترد بالكامل عند الإلغاء قبل 24 ساعة من الموعد.',
            payOptional: 'دفع العربون (اختياري)', skipPay: 'تأكيد الحجز بدون دفع', holdNote: 'تم حجز الموعد لك مؤقتاً لمدة 10 دقائق.',
            mockPay: 'محاكاة الدفع (وضع تجريبي)', mockNote: 'بوابة الدفع غير مفعّلة بعد - هذا وضع تجريبي.',
            confirmed: 'تم تأكيد موعدك', sent: 'أرسلنا التأكيد عبر واتساب ورسالة نصية وبريد إلكتروني، وسنذكرك قبل الموعد بـ 24 ساعة (واتساب) وساعتين (SMS).',
            manage: 'تعديل أو إلغاء الموعد', newBooking: 'حجز موعد آخر', doctor: 'الطبيب', service: 'الخدمة', when: 'الموعد', paid: 'العربون المدفوع',
            expired: 'انتهت مهلة الحجز المؤقت. يرجى اختيار الموعد من جديد.', err: 'حدث خطأ، حاول مرة أخرى.', verifying: 'جاري التحقق من الدفع...',
            invalidPhone: 'أدخل رقم جوال سعودي صحيح', invalidName: 'أدخل الاسم الكامل', invalidEmail: 'البريد الإلكتروني غير صحيح',
            ok: 'متاح', closed: 'مغلق', confirmBtn: 'متابعة', payNow: 'ادفع الآن'
        },
        en: {
            title: 'Book your appointment', steps: ['Service', 'Doctor', 'Time & confirm'],
            pickService: 'Choose a service', pickDoctor: 'Choose your doctor', pickDate: 'Pick a day and time', min: 'min', sar: 'SAR', deposit: 'Deposit',
            noSlots: 'No available times on this day', loading: 'Loading...', next: 'Next', back: 'Back', prev: 'Previous',
            name: 'Full name', phone: 'Mobile (05xxxxxxxx)', email: 'Email (optional)', notes: 'Notes (optional)',
            summary: 'Booking summary', payTitle: 'Pay the deposit to confirm', payNote: 'The deposit is deducted from your treatment cost and fully refunded if you cancel at least 24 hours before.',
            payOptional: 'Pay deposit (optional)', skipPay: 'Confirm without paying', holdNote: 'Your slot is held for 10 minutes.',
            mockPay: 'Simulate payment (test mode)', mockNote: 'Payment gateway is not configured yet - this is test mode.',
            confirmed: 'Your appointment is confirmed', sent: 'Confirmation sent by WhatsApp, SMS and email. You will get a WhatsApp reminder 24 hours before and an SMS 2 hours before.',
            manage: 'Reschedule or cancel', newBooking: 'Book another appointment', doctor: 'Doctor', service: 'Service', when: 'When', paid: 'Deposit paid',
            expired: 'Your temporary hold expired. Please choose a time again.', err: 'Something went wrong, please try again.', verifying: 'Verifying payment...',
            invalidPhone: 'Enter a valid Saudi mobile number', invalidName: 'Enter your full name', invalidEmail: 'Invalid email address',
            ok: 'Available', closed: 'Closed', confirmBtn: 'Continue', payNow: 'Pay now'
        }
    };

    var cfg = null;
    var st = { step: 1, service: null, doctor: null, date: null, time: null, page: 0, days: null, slots: null, patient: { name: '', phone: '', email: '', notes: '' }, booking: null, error: '', busy: false };

    function lang() { return (window.getCurrentLanguage ? window.getCurrentLanguage() : 'ar') === 'en' ? 'en' : 'ar'; }
    function t(k) { return T[lang()][k]; }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function nm(o) { return o['name_' + lang()]; }
    function fmtDate(d, opts) { return new Date(d + 'T12:00:00Z').toLocaleDateString(lang() === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB', Object.assign({ timeZone: 'UTC' }, opts)); }
    function fmtTime(hm) {
        var p = hm.split(':'), h = +p[0], m = p[1];
        var suf = lang() === 'ar' ? (h >= 12 ? 'م' : 'ص') : (h >= 12 ? 'PM' : 'AM');
        return ((h % 12) || 12) + ':' + m + ' ' + suf;
    }
    function addDays(d, n) { var x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }

    function api(path, opts) {
        return fetch(path, opts).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (j) {
                if (!r.ok) { var e = new Error(j.error || 'error'); e.status = r.status; throw e; }
                return j;
            });
        });
    }

    function stepBar() {
        var cur = st.step >= 6 ? 4 : Math.min(st.step, 3);
        return '<ol class="bk-steps">' + t('steps').map(function (s, i) {
            var n = i + 1, cls = n === cur ? 'active' : (n < cur ? 'done' : '');
            return '<li class="' + cls + '"><span>' + (n < cur ? '✓' : n) + '</span><em>' + esc(s) + '</em></li>';
        }).join('') + '</ol>';
    }

    function summaryHtml() {
        var s = cfg.services[st.service], d = cfg.doctors[st.doctor];
        var rows = '<div><b>' + t('service') + '</b><span>' + esc(nm(s)) + '</span></div>';
        if (d) rows += '<div><b>' + t('doctor') + '</b><span>' + esc(nm(d)) + '</span></div>';
        if (st.date && st.time) rows += '<div><b>' + t('when') + '</b><span>' + esc(fmtDate(st.date, { weekday: 'long', day: 'numeric', month: 'long' })) + ' - ' + fmtTime(st.time) + '</span></div>';
        return '<div class="bk-summary"><h4>' + t('summary') + '</h4>' + rows + '</div>';
    }

    function render() {
        if (!cfg) { root.innerHTML = '<p class="muted">' + t('loading') + '</p>'; return; }
        var h = stepBar();
        if (st.error) h += '<div class="bk-error" role="alert">' + esc(st.error) + '</div>';
        if (st.step === 1) h += stepService();
        else if (st.step === 2) h += stepDoctor();
        else if (st.step === 3) h += stepDate();
        else if (st.step === 4) h += stepDetails();
        else if (st.step === 5) h += stepPay();
        else h += stepDone();
        root.innerHTML = h;
        bind();
        track();
        if (st.step === 5 && st.booking && !cfg.payment.mock) mountMoyasar();
    }
    function track() {
        if (!window.albadrTrack) return;
        if (st.step === 2 && st.service && !st.started) { st.started = true; window.albadrTrack('booking_start', { service: st.service }); }
        if (st.step === 6 && st.booking && st.booking.id) {
            var k = 'albadr_tracked_' + st.booking.id;
            if (!sessionStorage.getItem(k)) {
                sessionStorage.setItem(k, '1');
                var svc = cfg.services[st.service] || {};
                window.albadrTrack('booking_confirmed', { service: st.service, value: svc.price || 0 });
                if (st.booking.paymentId || st.booking.deposit) window.albadrTrack('deposit_paid', { service: st.service, value: st.booking.deposit || 0, id: st.booking.id });
            }
        }
    }

    function stepService() {
        return '<h3>' + t('pickService') + '</h3><div class="bk-grid">' + Object.keys(cfg.services).map(function (k) {
            var s = cfg.services[k];
            return '<button type="button" class="bk-card' + (st.service === k ? ' sel' : '') + '" data-service="' + k + '"><strong>' + esc(nm(s)) + '</strong><small>' + s.duration + ' ' + t('min') + ' · ' + t('deposit') + ' ' + s.deposit + ' ' + t('sar') + '</small></button>';
        }).join('') + '</div>';
    }

    function stepDoctor() {
        var ids = Object.keys(cfg.doctors).filter(function (k) { return cfg.doctors[k].services.indexOf(st.service) > -1; });
        return summaryHtml() + '<h3>' + t('pickDoctor') + '</h3><div class="bk-grid">' + ids.map(function (k) {
            var d = cfg.doctors[k];
            return '<button type="button" class="bk-card' + (st.doctor === k ? ' sel' : '') + '" data-doctor="' + k + '"><strong>' + esc(nm(d)) + '</strong><small>' + esc(d['title_' + lang()]) + '</small></button>';
        }).join('') + '</div><div class="bk-nav"><button type="button" class="btn btn-ghost" data-back>' + t('back') + '</button></div>';
    }

    function stepDate() {
        var start = addDays(cfg.today, st.page * 14);
        var h = summaryHtml() + '<h3>' + t('pickDate') + '</h3>';
        h += '<div class="bk-pager"><button type="button" class="btn btn-ghost" data-page="-1"' + (st.page === 0 ? ' disabled' : '') + '>' + t('prev') + '</button><span>' + esc(fmtDate(start, { day: 'numeric', month: 'long' })) + ' - ' + esc(fmtDate(addDays(start, 13), { day: 'numeric', month: 'long' })) + '</span><button type="button" class="btn btn-ghost" data-page="1"' + ((st.page + 1) * 14 >= cfg.horizonDays ? ' disabled' : '') + '>' + t('next') + '</button></div>';
        if (!st.days) return h + '<p class="muted">' + t('loading') + '</p>';
        h += '<div class="bk-days">' + Object.keys(st.days).map(function (d) {
            var free = st.days[d];
            return '<button type="button" class="bk-day' + (st.date === d ? ' sel' : '') + '" data-date="' + d + '"' + (free ? '' : ' disabled') + '><small>' + esc(fmtDate(d, { weekday: 'short' })) + '</small><strong>' + esc(fmtDate(d, { day: 'numeric' })) + '</strong><small>' + esc(fmtDate(d, { month: 'short' })) + '</small></button>';
        }).join('') + '</div>';
        if (st.date) {
            if (!st.slots) h += '<p class="muted">' + t('loading') + '</p>';
            else if (!st.slots.length) h += '<p class="muted">' + t('noSlots') + '</p>';
            else h += '<div class="bk-slots">' + st.slots.map(function (s) { return '<button type="button" class="bk-slot' + (st.time === s ? ' sel' : '') + '" data-time="' + s + '">' + fmtTime(s) + '</button>'; }).join('') + '</div>';
        }
        h += '<div class="bk-nav"><button type="button" class="btn btn-ghost" data-back>' + t('back') + '</button><button type="button" class="btn btn-gold" data-next' + (st.time ? '' : ' disabled') + '>' + t('next') + '</button></div>';
        return h;
    }

    function stepDetails() {
        var p = st.patient;
        return summaryHtml() + '<form class="bk-form" novalidate><div class="form-grid">' +
            '<input name="name" autocomplete="name" placeholder="' + esc(t('name')) + '" value="' + esc(p.name) + '" required>' +
            '<input name="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="' + esc(t('phone')) + '" value="' + esc(p.phone) + '" required>' +
            '<input name="email" type="email" autocomplete="email" dir="ltr" placeholder="' + esc(t('email')) + '" value="' + esc(p.email) + '">' +
            '</div><textarea name="notes" maxlength="300" placeholder="' + esc(t('notes')) + '">' + esc(p.notes) + '</textarea>' +
            '<div class="bk-nav"><button type="button" class="btn btn-ghost" data-back>' + t('back') + '</button><button type="submit" class="btn btn-gold"' + (st.busy ? ' disabled' : '') + '>' + t('confirmBtn') + '</button></div></form>';
    }

    function stepPay() {
        var b = st.booking, s = cfg.services[st.service];
        var h = summaryHtml() + '<div class="bk-pay"><h3>' + t('payTitle') + '</h3><p class="bk-amount">' + b.deposit + ' ' + t('sar') + '</p><p class="muted">' + t('payNote') + '</p><p class="bk-hold">' + t('holdNote') + '</p>';
        if (cfg.payment.mock) h += '<p class="muted">' + t('mockNote') + '</p><button type="button" class="btn btn-gold" data-mockpay' + (st.busy ? ' disabled' : '') + '>' + t('mockPay') + '</button>';
        else h += '<div id="moyasarForm"></div>';
        return h + '</div>';
    }

    function stepDone() {
        var b = st.booking;
        return '<div class="bk-done"><div class="bk-check">✓</div><h3>' + t('confirmed') + '</h3>' + summaryHtml() +
            (b.depositPaid ? '<p class="muted">' + t('paid') + ': ' + b.deposit + ' ' + t('sar') + '</p>' : '') +
            '<p class="muted">' + t('sent') + '</p><p><strong>#' + esc(b.id) + '</strong></p>' +
            '<div class="bk-nav"><a class="btn btn-gold" href="manage.html?t=' + esc(b.token) + '">' + t('manage') + '</a><button type="button" class="btn btn-ghost" data-new>' + t('newBooking') + '</button></div></div>';
    }

    function bind() {
        root.querySelectorAll('[data-service]').forEach(function (el) { el.onclick = function () { st.service = el.dataset.service; st.doctor = null; st.date = st.time = null; st.days = st.slots = null; st.error = ''; st.step = 2; render(); }; });
        root.querySelectorAll('[data-doctor]').forEach(function (el) { el.onclick = function () { st.doctor = el.dataset.doctor; st.date = st.time = null; st.days = st.slots = null; st.page = 0; st.error = ''; st.step = 3; render(); loadDays(); }; });
        root.querySelectorAll('[data-page]').forEach(function (el) { el.onclick = function () { st.page += +el.dataset.page; st.days = null; st.date = st.time = null; st.slots = null; render(); loadDays(); }; });
        root.querySelectorAll('[data-date]').forEach(function (el) { el.onclick = function () { st.date = el.dataset.date; st.time = null; st.slots = null; render(); loadSlots(); }; });
        root.querySelectorAll('[data-time]').forEach(function (el) { el.onclick = function () { st.time = el.dataset.time; render(); }; });
        root.querySelectorAll('[data-next]').forEach(function (el) { el.onclick = function () { st.error = ''; st.step = 4; render(); }; });
        root.querySelectorAll('[data-back]').forEach(function (el) { el.onclick = function () { st.error = ''; st.step = Math.max(1, st.step - 1); render(); if (st.step === 3) loadDays(); }; });
        root.querySelectorAll('[data-new]').forEach(function (el) { el.onclick = function () { st = { step: 1, service: null, doctor: null, date: null, time: null, page: 0, days: null, slots: null, patient: st.patient, booking: null, error: '', busy: false }; render(); }; });
        var form = root.querySelector('.bk-form');
        if (form) form.onsubmit = submitDetails;
        var mp = root.querySelector('[data-mockpay]');
        if (mp) mp.onclick = function () { pay({ mock: true }); };
    }

    function loadDays() {
        var key = st.doctor + st.service + st.page;
        api('/api/availability?doctor=' + st.doctor + '&service=' + st.service + '&from=' + addDays(cfg.today, st.page * 14) + '&days=14').then(function (r) {
            if (st.doctor + st.service + st.page !== key) return;
            st.days = r.days; render();
        }).catch(function () { st.error = t('err'); render(); });
    }

    function loadSlots() {
        var d = st.date;
        api('/api/availability?doctor=' + st.doctor + '&service=' + st.service + '&date=' + d).then(function (r) {
            if (st.date !== d) return;
            st.slots = r.slots; render();
        }).catch(function () { st.error = t('err'); render(); });
    }

    function submitDetails(e) {
        e.preventDefault();
        var f = e.target;
        st.patient = { name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(), notes: f.notes.value.trim() };
        var digits = st.patient.phone.replace(/[\s\-()+]/g, '');
        if (st.patient.name.length < 2) st.error = t('invalidName');
        else if (!/^(05\d{8}|5\d{8}|9665\d{8}|009665\d{8})$/.test(digits)) st.error = t('invalidPhone');
        else if (st.patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.patient.email)) st.error = t('invalidEmail');
        else st.error = '';
        if (st.error) { render(); return; }
        st.busy = true; st.error = ''; render();
        api('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId: st.service, doctorId: st.doctor, date: st.date, time: st.time, patient: st.patient, lang: lang(), attribution: window.albadrAttribution ? window.albadrAttribution() : undefined }) })
            .then(function (b) {
                st.busy = false; st.booking = b;
                if (b.status === 'confirmed') st.step = 6; else { st.step = 5; }
                render();
            })
            .catch(function (err) {
                st.busy = false;
                if (err.status === 409) { st.error = lang() === 'ar' ? 'عذراً، تم حجز هذا الوقت للتو. اختر وقتاً آخر.' : 'Sorry, that time was just taken. Please pick another.'; st.step = 3; st.time = null; st.slots = null; render(); loadDays(); if (st.date) loadSlots(); }
                else { st.error = err.message && err.status === 400 ? err.message : t('err'); render(); }
            });
    }

    function pay(extra) {
        st.busy = true; st.error = ''; render();
        api('/api/bookings/' + st.booking.id + '/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ token: st.booking.token }, extra)) })
            .then(function (b) { st.busy = false; st.booking = Object.assign({}, st.booking, b); st.step = 6; render(); })
            .catch(function (err) { st.busy = false; st.error = err.status === 410 ? t('expired') : t('err'); if (err.status === 410) { st.step = 3; st.time = null; st.slots = null; st.booking = null; loadDays(); } render(); });
    }

    var moyasarLoading = null;
    function loadMoyasar() {
        if (window.Moyasar) return Promise.resolve();
        if (moyasarLoading) return moyasarLoading;
        moyasarLoading = new Promise(function (res, rej) {
            var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2/dist/moyasar.css'; document.head.appendChild(l);
            var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2/dist/moyasar.umd.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s);
        });
        return moyasarLoading;
    }

    function mountMoyasar() {
        var b = st.booking;
        loadMoyasar().then(function () {
            var el = document.getElementById('moyasarForm');
            if (!el || el.dataset.ready) return;
            el.dataset.ready = '1';
            window.Moyasar.init({
                element: '#moyasarForm', amount: b.amountHalalas, currency: 'SAR',
                description: 'Deposit ' + b.id, publishable_api_key: cfg.payment.publishableKey,
                callback_url: location.origin + location.pathname + '?booking=' + encodeURIComponent(b.id) + '&t=' + encodeURIComponent(b.token),
                methods: ['creditcard', 'applepay'], supported_networks: ['visa', 'mastercard', 'mada'],
                apple_pay: { country: 'SA', label: 'Al Badr Elite Dental', validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate' },
                language: lang(), metadata: { booking_id: b.id },
                on_completed: function (payment) { return new Promise(function (res) { pay({ paymentId: payment.id }); res(); }); }
            });
        }).catch(function () { st.error = t('err'); render(); });
    }

    // Returning from 3-D Secure: ?booking=ID&t=TOKEN&id=PAYMENT&status=paid
    function handleReturn() {
        var q = new URLSearchParams(location.search);
        if (!q.get('booking') || !q.get('id')) return false;
        var id = q.get('booking'), token = q.get('t');
        history.replaceState(null, '', location.pathname);
        if (q.get('status') !== 'paid') { st.error = t('err'); return false; }
        root.innerHTML = '<p class="muted">' + t('verifying') + '</p>';
        api('/api/bookings/by-token/' + encodeURIComponent(token)).then(function (b0) {
            return api('/api/bookings/' + encodeURIComponent(id) + '/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token, paymentId: q.get('id') }) })
                .then(function (b) { st.service = b.serviceId; st.doctor = b.doctorId; st.date = b.date; st.time = b.time; st.booking = Object.assign({ token: token }, b0, b); st.step = 6; render(); });
        }).catch(function () { st.error = t('err'); render(); });
        return true;
    }

    window.addEventListener('langchange', render);

    api('/api/config').then(function (c) {
        cfg = c;
        var pre = new URLSearchParams(location.search).get('service');
        if (pre && cfg.services[pre]) { st.service = pre; st.step = 2; }
        if (!handleReturn()) render();
    }).catch(function () {
        root.innerHTML = '<div class="bk-error">' + (lang() === 'ar' ? 'نظام الحجز غير متاح حالياً. اتصل بنا على 920088123 أو عبر واتساب.' : 'Online booking is temporarily unavailable. Call 920088123 or message us on WhatsApp.') + '</div>';
    });
    render();
})();
