/* Reschedule / cancel page, opened from the confirmation link: manage.html?t=<token> */
(function () {
    'use strict';
    var root = document.getElementById('manageApp');
    var token = new URLSearchParams(location.search).get('t') || '';
    var b = null, mode = 'view', days = null, date = null, slots = null, time = null, page = 0, msg = '', cfg = null, busy = false;

    var T = {
        ar: { title: 'موعدك', service: 'الخدمة', doctor: 'الطبيب', when: 'الموعد', status: { confirmed: 'مؤكد', cancelled: 'ملغي', pending_payment: 'بانتظار الدفع', expired: 'منتهي' },
            resched: 'تغيير الموعد', cancel: 'إلغاء الموعد', cutoff: 'لا يمكن التعديل أو الإلغاء إلكترونياً قبل أقل من 4 ساعات من الموعد. يرجى الاتصال بنا على 920088123.',
            confirmCancel: 'هل أنت متأكد من إلغاء الموعد؟', refundYes: 'سيتم استرداد العربون بالكامل.', refundNo: 'الإلغاء قبل أقل من 24 ساعة: العربون غير قابل للاسترداد.',
            yesCancel: 'نعم، ألغِ الموعد', keep: 'إبقاء الموعد', save: 'حفظ الموعد الجديد', back: 'رجوع', loading: 'جاري التحميل...',
            notFound: 'لم يتم العثور على الحجز. تحقق من الرابط.', err: 'حدث خطأ، حاول مرة أخرى.', cancelled: 'تم إلغاء موعدك.', refunded: 'تم طلب استرداد العربون.', moved: 'تم تغيير موعدك بنجاح.', taken: 'هذا الوقت لم يعد متاحاً.',
            noSlots: 'لا توجد أوقات متاحة', prev: 'السابق', next: 'التالي', pick: 'اختر موعداً جديداً', min: 'دقيقة' },
        en: { title: 'Your appointment', service: 'Service', doctor: 'Doctor', when: 'When', status: { confirmed: 'Confirmed', cancelled: 'Cancelled', pending_payment: 'Awaiting payment', expired: 'Expired' },
            resched: 'Reschedule', cancel: 'Cancel appointment', cutoff: 'Online changes are not possible within 4 hours of the appointment. Please call 920088123.',
            confirmCancel: 'Are you sure you want to cancel?', refundYes: 'Your deposit will be fully refunded.', refundNo: 'Cancelling less than 24 hours before: the deposit is non-refundable.',
            yesCancel: 'Yes, cancel it', keep: 'Keep appointment', save: 'Save new time', back: 'Back', loading: 'Loading...',
            notFound: 'Booking not found. Please check your link.', err: 'Something went wrong, please try again.', cancelled: 'Your appointment was cancelled.', refunded: 'Deposit refund requested.', moved: 'Your appointment was moved.', taken: 'That time is no longer available.',
            noSlots: 'No available times', prev: 'Previous', next: 'Next', pick: 'Pick a new time', min: 'min' }
    };
    function lang() { return getCurrentLanguage() === 'en' ? 'en' : 'ar'; }
    function t(k) { return T[lang()][k]; }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function fmtDate(d, o) { return new Date(d + 'T12:00:00Z').toLocaleDateString(lang() === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB', Object.assign({ timeZone: 'UTC' }, o)); }
    function fmtTime(hm) { var p = hm.split(':'), h = +p[0]; return ((h % 12) || 12) + ':' + p[1] + ' ' + (lang() === 'ar' ? (h >= 12 ? 'م' : 'ص') : (h >= 12 ? 'PM' : 'AM')); }
    function addDays(d, n) { var x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }

    function api(path, opts) {
        return fetch(path, opts).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var e = new Error(j.error || 'error'); e.status = r.status; throw e; } return j; }); });
    }
    function post(action, body) {
        return api('/api/bookings/by-token/' + encodeURIComponent(token) + '/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    }

    function summary() {
        return '<div class="bk-summary"><div><b>' + t('service') + '</b><span>' + esc(b.service['name_' + lang()]) + '</span></div><div><b>' + t('doctor') + '</b><span>' + esc(b.doctor['name_' + lang()]) + '</span></div><div><b>' + t('when') + '</b><span>' + esc(fmtDate(b.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) + ' - ' + fmtTime(b.time) + '</span></div></div>';
    }

    function render() {
        if (!b) { root.innerHTML = '<p class="muted">' + (msg || t('loading')) + '</p>'; return; }
        var h = '<h2>' + t('title') + ' <small class="pill">' + esc(t('status')[b.status] || b.status) + '</small></h2>';
        if (msg) h += '<div class="bk-info" role="status">' + esc(msg) + '</div>';
        h += summary();
        if (b.status === 'confirmed' && mode === 'view') {
            if (b.canChange) h += '<div class="bk-nav"><button class="btn btn-gold" data-act="resched">' + t('resched') + '</button><button class="btn btn-ghost" data-act="cancel">' + t('cancel') + '</button></div>';
            else h += '<p class="muted">' + t('cutoff') + '</p>';
        }
        if (mode === 'cancel') {
            h += '<p><strong>' + t('confirmCancel') + '</strong></p>' + (b.depositPaid ? '<p class="muted">' + (b.refundOnCancel ? t('refundYes') : t('refundNo')) + '</p>' : '') +
                '<div class="bk-nav"><button class="btn btn-gold" data-act="docancel"' + (busy ? ' disabled' : '') + '>' + t('yesCancel') + '</button><button class="btn btn-ghost" data-act="view">' + t('keep') + '</button></div>';
        }
        if (mode === 'resched') {
            var start = addDays(cfg.today, page * 14);
            h += '<h3>' + t('pick') + '</h3><div class="bk-pager"><button class="btn btn-ghost" data-page="-1"' + (page === 0 ? ' disabled' : '') + '>' + t('prev') + '</button><span>' + esc(fmtDate(start, { day: 'numeric', month: 'long' })) + '</span><button class="btn btn-ghost" data-page="1"' + ((page + 1) * 14 >= cfg.horizonDays ? ' disabled' : '') + '>' + t('next') + '</button></div>';
            if (!days) h += '<p class="muted">' + t('loading') + '</p>';
            else h += '<div class="bk-days">' + Object.keys(days).map(function (d) { return '<button class="bk-day' + (date === d ? ' sel' : '') + '" data-date="' + d + '"' + (days[d] ? '' : ' disabled') + '><small>' + esc(fmtDate(d, { weekday: 'short' })) + '</small><strong>' + esc(fmtDate(d, { day: 'numeric' })) + '</strong><small>' + esc(fmtDate(d, { month: 'short' })) + '</small></button>'; }).join('') + '</div>';
            if (date && slots) h += slots.length ? '<div class="bk-slots">' + slots.map(function (s) { return '<button class="bk-slot' + (time === s ? ' sel' : '') + '" data-time="' + s + '">' + fmtTime(s) + '</button>'; }).join('') + '</div>' : '<p class="muted">' + t('noSlots') + '</p>';
            h += '<div class="bk-nav"><button class="btn btn-ghost" data-act="view">' + t('back') + '</button><button class="btn btn-gold" data-act="save"' + (time && !busy ? '' : ' disabled') + '>' + t('save') + '</button></div>';
        }
        root.innerHTML = h;
        root.querySelectorAll('[data-act]').forEach(function (el) { el.onclick = function () { act(el.dataset.act); }; });
        root.querySelectorAll('[data-page]').forEach(function (el) { el.onclick = function () { page += +el.dataset.page; days = slots = null; date = time = null; render(); loadDays(); }; });
        root.querySelectorAll('[data-date]').forEach(function (el) { el.onclick = function () { date = el.dataset.date; time = null; slots = null; render(); loadSlots(); }; });
        root.querySelectorAll('[data-time]').forEach(function (el) { el.onclick = function () { time = el.dataset.time; render(); }; });
    }

    function loadDays() {
        api('/api/availability?doctor=' + b.doctorId + '&service=' + b.serviceId + '&from=' + addDays(cfg.today, page * 14) + '&days=14').then(function (r) { days = r.days; render(); });
    }
    function loadSlots() {
        var d = date;
        api('/api/availability?doctor=' + b.doctorId + '&service=' + b.serviceId + '&date=' + d).then(function (r) { if (date === d) { slots = r.slots; render(); } });
    }

    function act(a) {
        msg = '';
        if (a === 'view') mode = 'view';
        else if (a === 'cancel') mode = 'cancel';
        else if (a === 'resched') { mode = 'resched'; page = 0; days = slots = null; date = time = null; loadDays(); }
        else if (a === 'docancel') {
            busy = true; render();
            post('cancel').then(function (r) { b = r; mode = 'view'; msg = t('cancelled') + (r.refunded ? ' ' + t('refunded') : ''); }).catch(function (e) { msg = e.status === 403 ? t('cutoff') : t('err'); }).then(function () { busy = false; render(); });
            return;
        } else if (a === 'save') {
            busy = true; render();
            post('reschedule', { date: date, time: time }).then(function (r) { b = r; mode = 'view'; msg = t('moved'); })
                .catch(function (e) { msg = e.status === 409 ? t('taken') : (e.status === 403 ? t('cutoff') : t('err')); if (e.status === 409) { time = null; loadSlots(); } })
                .then(function () { busy = false; render(); });
            return;
        }
        render();
    }

    window.addEventListener('langchange', render);
    if (!/^[a-f0-9]{48}$/.test(token)) { msg = t('notFound'); render(); return; }
    Promise.all([api('/api/bookings/by-token/' + encodeURIComponent(token)), api('/api/config')]).then(function (r) { b = r[0]; cfg = r[1]; render(); })
        .catch(function (e) { msg = e.status === 404 ? t('notFound') : t('err'); render(); });
    render();
})();
