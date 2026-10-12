(function () {
  'use strict';
  const T = {
    ar: {
      title: 'لوحة التحكم', login: 'دخول الإدارة', token: 'رمز الإدارة', enter: 'دخول', bad: 'رمز غير صحيح', logout: 'خروج',
      today: 'مواعيد اليوم', doctors: 'جداول الأطباء', services: 'الخدمات والأسعار', closures: 'الإجازات والإغلاق', reports: 'التقارير', noshow: 'المتغيبون', patients: 'المرضى',
      time: 'الوقت', patient: 'المريض', phone: 'الجوال', service: 'الخدمة', doctor: 'الطبيب', status: 'الحالة', deposit: 'العربون', actions: 'إجراءات',
      confirmed: 'مؤكد', pending: 'بانتظار الدفع', cancelled: 'ملغي', attended: 'حضر', noShowL: 'لم يحضر', upcoming: 'قادم',
      markAttended: 'حضر', markNoShow: 'لم يحضر', undo: 'تراجع', cancel: 'إلغاء', cancelAsk: 'إلغاء هذا الموعد؟ سيتم رد العربون وإبلاغ المريض.',
      noBookings: 'لا توجد مواعيد في هذا اليوم', prev: 'السابق', next: 'التالي', todayBtn: 'اليوم',
      workDays: 'أيام وساعات العمل', dayOff: 'إجازة', addRange: '+ فترة', remove: 'حذف', breaks: 'أوقات الاستراحة (يومياً)', addBreak: '+ استراحة',
      doctorServices: 'الخدمات التي يقدمها', activeDoc: 'يظهر للحجز', save: 'حفظ', saved: 'تم الحفظ', from: 'من', to: 'إلى',
      sun: 'الأحد', mon: 'الاثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة', sat: 'السبت',
      nameAr: 'الاسم بالعربية', nameEn: 'الاسم بالإنجليزية', duration: 'المدة (دقيقة)', price: 'السعر (ر.س)', depositSar: 'العربون (ر.س)', active: 'فعّال', addService: 'إضافة خدمة', add: 'إضافة',
      closeNew: 'إضافة إغلاق / إجازة', clinicWide: 'العيادة كاملة', reason: 'السبب (اختياري)', existing: 'الإغلاقات الحالية', noClosures: 'لا توجد إغلاقات',
      conflict: 'تنبيه: يوجد مواعيد مؤكدة خلال هذه الفترة، يجب إلغاؤها أو نقلها يدوياً:',
      last7: 'آخر 7 أيام', last30: 'آخر 30 يوماً', thisMonth: 'هذا الشهر', last90: 'آخر 90 يوماً', day: 'يومي', week: 'أسبوعي', month: 'شهري',
      total: 'إجمالي الحجوزات', attendedK: 'حضروا', noShowK: 'لم يحضروا', cancelledK: 'ملغاة', upcomingK: 'قادمة', depositsK: 'العربون المحصّل', valueK: 'قيمة الخدمات', rate: 'نسبة التغيب',
      byDoctor: 'حسب الطبيب', byService: 'حسب الخدمة', exportReport: 'تصدير التقرير (Excel)', exportBookings: 'تصدير الحجوزات (Excel)', exportPatients: 'تصدير المرضى (Excel)',
      flagged: 'مُعلَّم', flagNote: 'يُعلَّم المريض عند تكرار التغيب مرتين أو أكثر.', noNoShows: 'لا يوجد متغيبون',
      search: 'بحث بالاسم أو الجوال...', visits: 'الزيارات', noShows: 'التغيب', last: 'آخر زيارة', nextAppt: 'الموعد القادم', email: 'البريد', history: 'سجل الزيارات', noPatients: 'لا يوجد مرضى',
      sar: 'ر.س', noData: 'لا توجد بيانات في هذه الفترة', lang: 'English', err: 'حدث خطأ', wait: 'جارٍ التحميل...',
    },
    en: {
      title: 'Admin Dashboard', login: 'Admin login', token: 'Admin token', enter: 'Sign in', bad: 'Invalid token', logout: 'Sign out',
      today: "Today's bookings", doctors: 'Doctor schedules', services: 'Services & prices', closures: 'Holidays & closures', reports: 'Reports', noshow: 'No-shows', patients: 'Patients',
      time: 'Time', patient: 'Patient', phone: 'Phone', service: 'Service', doctor: 'Doctor', status: 'Status', deposit: 'Deposit', actions: 'Actions',
      confirmed: 'Confirmed', pending: 'Awaiting payment', cancelled: 'Cancelled', attended: 'Attended', noShowL: 'No-show', upcoming: 'Upcoming',
      markAttended: 'Attended', markNoShow: 'No-show', undo: 'Undo', cancel: 'Cancel', cancelAsk: 'Cancel this appointment? The deposit will be refunded and the patient notified.',
      noBookings: 'No appointments on this day', prev: 'Previous', next: 'Next', todayBtn: 'Today',
      workDays: 'Working days & hours', dayOff: 'Day off', addRange: '+ Add hours', remove: 'Remove', breaks: 'Break times (every working day)', addBreak: '+ Add break',
      doctorServices: 'Services offered', activeDoc: 'Available for booking', save: 'Save', saved: 'Saved', from: 'From', to: 'To',
      sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday',
      nameAr: 'Arabic name', nameEn: 'English name', duration: 'Duration (min)', price: 'Price (SAR)', depositSar: 'Deposit (SAR)', active: 'Active', addService: 'Add service', add: 'Add',
      closeNew: 'Add closure / vacation', clinicWide: 'Whole clinic', reason: 'Reason (optional)', existing: 'Current closures', noClosures: 'No closures',
      conflict: 'Warning: confirmed appointments fall in this period and must be cancelled or moved manually:',
      last7: 'Last 7 days', last30: 'Last 30 days', thisMonth: 'This month', last90: 'Last 90 days', day: 'Daily', week: 'Weekly', month: 'Monthly',
      total: 'Total bookings', attendedK: 'Attended', noShowK: 'No-shows', cancelledK: 'Cancelled', upcomingK: 'Upcoming', depositsK: 'Deposits collected', valueK: 'Service value', rate: 'No-show rate',
      byDoctor: 'By doctor', byService: 'By service', exportReport: 'Export report (Excel)', exportBookings: 'Export bookings (Excel)', exportPatients: 'Export patients (Excel)',
      flagged: 'Flagged', flagNote: 'A patient is flagged after 2 or more no-shows.', noNoShows: 'No no-shows recorded',
      search: 'Search name or phone...', visits: 'Visits', noShows: 'No-shows', last: 'Last visit', nextAppt: 'Next appointment', email: 'Email', history: 'Visit history', noPatients: 'No patients yet',
      sar: 'SAR', noData: 'No data in this period', lang: 'العربية', err: 'Something went wrong', wait: 'Loading...',
    },
  };
  Object.assign(T.ar, {
    blog: 'المدونة', marketing: 'التسويق والسيو', newPost: 'مقال جديد', edit: 'تعديل', del: 'حذف', delAsk: 'حذف هذا المقال نهائياً؟', draft: 'مسودة', published: 'منشور', scheduled: 'مجدول', preview: 'معاينة', back: 'رجوع',
    slug: 'الرابط (إنجليزي، شرطات)', category: 'التصنيف', cover: 'رابط صورة الغلاف (https)', publishAt: 'تاريخ النشر', titleAr: 'العنوان بالعربية', titleEn: 'العنوان بالإنجليزية', excAr: 'ملخص بالعربية', excEn: 'ملخص بالإنجليزية', bodyAr: 'المقال بالعربية', bodyEn: 'المقال بالإنجليزية',
    mdHelp: 'التنسيق: ## عنوان، ### عنوان فرعي، - قائمة، **عريض**، [نص](رابط)', viewLive: 'عرض المقال', noPosts: 'لا توجد مقالات',
    secAddr: 'العنوان والتواصل', secHours: 'ساعات العمل', secGoogle: 'Google', secSocial: 'التواصل الاجتماعي', secTrack: 'التتبع والتحليلات', street_ar: 'الشارع (عربي)', street_en: 'الشارع (إنجليزي)', district_ar: 'الحي (عربي)', district_en: 'الحي (إنجليزي)', city_ar: 'المدينة (عربي)', city_en: 'المدينة (إنجليزي)', postal: 'الرمز البريدي', whatsapp: 'واتساب (966...)', lat: 'خط العرض', lng: 'خط الطول',
    weekday: 'السبت - الخميس', friday: 'الجمعة (اتركه فارغاً إن كان مغلقاً)', mapsUrl: 'رابط العيادة على خرائط Google', reviewUrl: 'رابط تقييم Google', ogImage: 'صورة المشاركة (https)', ga4: 'معرّف GA4 (G-XXXXXXXXXX)', metaPixel: 'معرّف Meta Pixel', consent: 'إظهار موافقة ملفات الارتباط (موصى به)',
    stPlaces: 'تقييمات Google (Places)', stIg: 'إنستغرام', connected: 'متصل', notConnected: 'غير متصل (يتطلب مفتاحاً في ملف .env)', sitemapNote: 'رابط خريطة الموقع لإرساله إلى Search Console:',
  });
  Object.assign(T.en, {
    blog: 'Blog', marketing: 'Marketing & SEO', newPost: 'New article', edit: 'Edit', del: 'Delete', delAsk: 'Delete this article permanently?', draft: 'Draft', published: 'Published', scheduled: 'Scheduled', preview: 'Preview', back: 'Back',
    slug: 'URL slug (English, dashes)', category: 'Category', cover: 'Cover image URL (https)', publishAt: 'Publish date', titleAr: 'Arabic title', titleEn: 'English title', excAr: 'Arabic summary', excEn: 'English summary', bodyAr: 'Arabic article', bodyEn: 'English article',
    mdHelp: 'Formatting: ## heading, ### subheading, - list, **bold**, [text](link)', viewLive: 'View article', noPosts: 'No articles yet',
    secAddr: 'Address & contact', secHours: 'Opening hours', secGoogle: 'Google', secSocial: 'Social media', secTrack: 'Tracking & analytics', street_ar: 'Street (Arabic)', street_en: 'Street (English)', district_ar: 'District (Arabic)', district_en: 'District (English)', city_ar: 'City (Arabic)', city_en: 'City (English)', postal: 'Postal code', whatsapp: 'WhatsApp (966...)', lat: 'Latitude', lng: 'Longitude',
    weekday: 'Sat - Thu', friday: 'Friday (leave empty if closed)', mapsUrl: 'Google Maps link for the clinic', reviewUrl: 'Google review link', ogImage: 'Share image (https)', ga4: 'GA4 ID (G-XXXXXXXXXX)', metaPixel: 'Meta Pixel ID', consent: 'Show cookie consent banner (recommended)',
    stPlaces: 'Google reviews (Places)', stIg: 'Instagram', connected: 'Connected', notConnected: 'Not connected (needs a key in .env)', sitemapNote: 'Sitemap URL to submit in Search Console:',
  });  const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5];
  const TABS = ['today', 'doctors', 'services', 'closures', 'reports', 'noshow', 'patients', 'blog', 'marketing'];

  const S = { lang: localStorage.getItem('albadr_admin_lang') || 'ar', tab: 'today', token: sessionStorage.getItem('albadr_admin_token') || '', cfg: null, date: null, rpt: null, timer: null };
  const root = document.getElementById('adminApp');
  const t = (k) => T[S.lang][k] || k;
  const nm = (o) => (S.lang === 'en' ? o.name_en : o.name_ar);

  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'class') e.className = v;
      else if (k === 'value') e.value = v;
      else if (k === 'checked') e.checked = !!v;
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    return e;
  }
  const toast = (msg) => { const n = h('div', { class: 'toast' }, msg); document.body.append(n); setTimeout(() => n.remove(), 2200); };
  const num = (n) => Number(n || 0).toLocaleString('en-US');
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const fmtDate = (s) => new Date(s + 'T00:00:00Z').toLocaleDateString(S.lang === 'ar' ? 'ar-SA' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

  async function api(path, opts = {}) {
    const r = await fetch('/api/admin' + path, { method: opts.method || 'GET', headers: Object.assign({ 'X-Admin-Token': S.token }, opts.body ? { 'Content-Type': 'application/json' } : {}), body: opts.body ? JSON.stringify(opts.body) : undefined });
    if (r.status === 401) { logout(); throw new Error('auth'); }
    if (opts.blob) { if (!r.ok) throw new Error(t('err')); return r.blob(); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || t('err'));
    return j;
  }
  const guard = (fn) => async (...a) => { try { await fn(...a); } catch (e) { if (e.message !== 'auth') toast(e.message); } };

  function logout() { S.token = ''; sessionStorage.removeItem('albadr_admin_token'); S.cfg = null; clearInterval(S.timer); renderLogin(); }
  function setLang(l) { S.lang = l; localStorage.setItem('albadr_admin_lang', l); document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'; }

  function renderLogin(error) {
    setLang(S.lang);
    const inp = h('input', { type: 'password', placeholder: t('token'), autocomplete: 'current-password' });
    const err = h('div', { class: 'err' }, error || '');
    const go = guard(async () => {
      S.token = inp.value.trim();
      try { await api('/ping'); } catch (e) { if (e.message === 'auth') return renderLogin(t('bad')); throw e; }
      sessionStorage.setItem('albadr_admin_token', S.token);
      boot();
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    root.replaceChildren(h('div', { class: 'a-login' }, h('img', { class: 'a-logo', src: 'assets/logo.png', alt: 'Al Badr Elite Dental' }), h('h1', {}, 'Al Badr Elite Dental'), h('div', {}, t('login')), inp, err, h('button', { class: 'btn gold', onclick: go }, t('enter')),
      h('button', { class: 'btn sm', onclick: () => { setLang(S.lang === 'ar' ? 'en' : 'ar'); renderLogin(); } }, t('lang'))));
    inp.focus();
  }

  async function boot() {
    try { const p = await api('/ping'); S.today = p.today; S.date = S.date || p.today; S.cfg = await api('/settings'); } catch (e) { if (e.message !== 'auth') renderLogin(e.message); return; }
    if (!S.rpt) S.rpt = { from: addDays(S.today, -29), to: addDays(S.today, 30), group: 'day' };
    shell();
  }

  function shell() {
    setLang(S.lang);
    const main = h('main', { id: 'tabBody' });
    root.replaceChildren(
      h('div', { class: 'a-top' }, h('img', { class: 'a-logo', src: 'assets/logo.png', alt: 'Al Badr Elite Dental' }), h('h1', {}, 'Al Badr Elite Dental — ' + t('title')),
        h('button', { class: 'btn sm', onclick: () => { setLang(S.lang === 'ar' ? 'en' : 'ar'); shell(); } }, t('lang')),
        h('button', { class: 'btn sm', onclick: logout }, t('logout'))),
      h('div', { class: 'a-tabs' }, TABS.map((k) => h('button', { class: k === S.tab ? 'on' : '', onclick: () => { S.tab = k; shell(); } }, t(k)))),
      main);
    clearInterval(S.timer);
    guard(async () => { await VIEWS[S.tab](main); })();
  }

  const statusPill = (b) => {
    if (b.status === 'cancelled') return h('span', { class: 'pill mute' }, t('cancelled'));
    if (b.status === 'pending_payment') return h('span', { class: 'pill warn' }, t('pending'));
    if (b.attendance === 'no_show') return h('span', { class: 'pill bad' }, t('noShowL'));
    if (b.attendance === 'attended') return h('span', { class: 'pill ok' }, t('attended'));
    return h('span', { class: 'pill' }, t('confirmed'));
  };
  const svcName = (id) => { const s = S.cfg.services[id]; return s ? nm(s) : id; };
  const docName = (id) => { const d = S.cfg.doctors[id]; return d ? nm(d) : id; };
  const waLink = (phone) => 'https://wa.me/' + String(phone).replace(/\D/g, '');

  // ---------- Today ----------
  async function viewToday(main) {
    const render = async () => {
      const { date, bookings } = await api('/day?date=' + S.date);
      const live = bookings.filter((b) => b.status === 'confirmed');
      const act = guard(async (id, a) => { await api(`/bookings/${id}/${a}`, { method: 'POST', body: {} }); await render(); });
      const nowStart = (b) => Date.parse(`${b.date}T${b.time}:00+03:00`) <= Date.now();
      main.replaceChildren(
        h('div', { class: 'bar' },
          h('button', { class: 'btn', onclick: () => { S.date = addDays(S.date, -1); render(); } }, t('prev')),
          h('input', { type: 'date', value: S.date, onchange: (e) => { if (e.target.value) { S.date = e.target.value; render(); } } }),
          h('button', { class: 'btn', onclick: () => { S.date = addDays(S.date, 1); render(); } }, t('next')),
          h('button', { class: 'btn', onclick: () => { S.date = S.today; render(); } }, t('todayBtn')),
          h('strong', { class: 'grow' }, fmtDate(date))),
        h('div', { class: 'kpis' },
          h('div', { class: 'kpi' }, h('b', {}, num(live.length)), h('span', {}, t('confirmed'))),
          h('div', { class: 'kpi' }, h('b', {}, num(live.filter((b) => b.attendance === 'attended').length)), h('span', {}, t('attended'))),
          h('div', { class: 'kpi bad' }, h('b', {}, num(live.filter((b) => b.attendance === 'no_show').length)), h('span', {}, t('noShowL'))),
          h('div', { class: 'kpi' }, h('b', {}, num(bookings.filter((b) => b.status === 'cancelled').length)), h('span', {}, t('cancelled')))),
        h('div', { class: 'card' }, bookings.length ? h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' },
          h('thead', {}, h('tr', {}, ['time', 'patient', 'phone', 'service', 'doctor', 'deposit', 'status', 'actions'].map((k) => h('th', {}, t(k))))),
          h('tbody', {}, bookings.map((b) => h('tr', {},
            h('td', {}, b.time + ' (' + b.duration + 'm)'),
            h('td', {}, b.patient.name),
            h('td', { dir: 'ltr' }, h('a', { href: waLink(b.patient.phone), target: '_blank', rel: 'noopener', style: 'color:var(--gold2)' }, '+' + b.patient.phone)),
            h('td', {}, svcName(b.serviceId)), h('td', {}, docName(b.doctorId)),
            h('td', {}, b.depositPaid ? b.deposit + ' ' + t('sar') : '—'),
            h('td', {}, statusPill(b)),
            h('td', {}, b.status === 'confirmed' ? h('div', { class: 'actions' },
              b.attendance ? h('button', { class: 'btn sm', onclick: () => act(b.id, 'clear') }, t('undo')) : [
                nowStart(b) ? h('button', { class: 'btn sm', onclick: () => act(b.id, 'attended') }, t('markAttended')) : null,
                nowStart(b) ? h('button', { class: 'btn sm bad', onclick: () => act(b.id, 'no_show') }, t('markNoShow')) : null,
                h('button', { class: 'btn sm bad', onclick: () => { if (confirm(t('cancelAsk'))) act(b.id, 'cancel'); } }, t('cancel'))]) : null)))))) : h('div', { class: 'empty' }, t('noBookings'))));
    };
    await render();
    S.timer = setInterval(() => render().catch(() => {}), 60000);
  }

  // ---------- Doctors ----------
  function viewDoctors(main) {
    const ids = Object.keys(S.cfg.doctors);
    S.docId = S.docId && S.cfg.doctors[S.docId] ? S.docId : ids[0];
    const d = JSON.parse(JSON.stringify(S.cfg.doctors[S.docId]));
    const sel = h('select', { onchange: (e) => { S.docId = e.target.value; viewDoctors(main); } }, ids.map((id) => h('option', { value: id, selected: id === S.docId }, nm(S.cfg.doctors[id]))));
    const rangeEditor = (list, onChange) => {
      const box = h('div', { class: 'ranges' });
      const draw = () => {
        box.replaceChildren(...list.map((r, i) => h('div', { class: 'range' },
          h('input', { type: 'time', value: r[0], onchange: (e) => { r[0] = e.target.value; onChange(); } }), '—',
          h('input', { type: 'time', value: r[1], onchange: (e) => { r[1] = e.target.value; onChange(); } }),
          h('button', { class: 'btn sm', onclick: () => { list.splice(i, 1); onChange(true); draw(); } }, t('remove')))));
      };
      draw(); return box;
    };
    const weekRows = DAY_ORDER.map((i) => {
      d.week[i] = d.week[i] || [];
      const holder = h('div', {});
      const draw = () => {
        const on = d.week[i].length > 0;
        holder.replaceChildren(on ? h('div', {}, rangeEditor(d.week[i], (re) => { if (re) draw(); }), h('button', { class: 'btn sm', style: 'margin-top:6px', onclick: () => { d.week[i].push(['16:00', '21:00']); draw(); } }, t('addRange'))) : h('span', { class: 'off' }, t('dayOff')));
        chk.checked = on;
      };
      const chk = h('input', { type: 'checkbox', onchange: (e) => { d.week[i] = e.target.checked ? [['09:00', '22:00']] : []; draw(); } });
      draw();
      return h('div', { class: 'day-row' }, h('label', {}, chk, t(DAYS[i])), holder);
    });
    const breakBox = h('div', {});
    const drawBreaks = () => breakBox.replaceChildren(rangeEditor(d.breaks, () => {}), h('button', { class: 'btn sm', style: 'margin-top:6px', onclick: () => { d.breaks.push(['13:00', '14:00']); drawBreaks(); } }, t('addBreak')));
    drawBreaks();
    const active = h('input', { type: 'checkbox', checked: d.active, onchange: (e) => { d.active = e.target.checked; } });
    const svcChips = h('div', { class: 'chips' }, Object.entries(S.cfg.services).map(([id, s]) => h('label', {}, h('input', { type: 'checkbox', checked: d.services.includes(id), onchange: (e) => { d.services = e.target.checked ? [...new Set([...d.services, id])] : d.services.filter((x) => x !== id); } }), nm(s))));
    const save = guard(async () => {
      const res = await api('/doctors/' + S.docId, { method: 'PUT', body: { week: d.week, breaks: d.breaks, services: d.services, active: d.active } });
      S.cfg.doctors[S.docId] = res; toast(t('saved'));
    });
    main.replaceChildren(
      h('div', { class: 'bar' }, sel, h('label', { class: 'chips' }, h('span', {}, active, ' ', t('activeDoc')))),
      h('div', { class: 'grid2' },
        h('div', { class: 'card' }, h('h2', {}, t('workDays')), weekRows),
        h('div', {},
          h('div', { class: 'card' }, h('h2', {}, t('breaks')), breakBox),
          h('div', { class: 'card' }, h('h2', {}, t('doctorServices')), svcChips))),
      h('button', { class: 'btn gold', onclick: save }, t('save')));
  }

  // ---------- Services ----------
  function viewServices(main) {
    const durOpts = []; for (let m = 30; m <= 240; m += 30) durOpts.push(m);
    const mkRow = (id, s, isNew) => {
      const f = {
        name_ar: h('input', { class: 'svc-in', value: s.name_ar || '', placeholder: t('nameAr') }),
        name_en: h('input', { class: 'svc-in', value: s.name_en || '', placeholder: t('nameEn'), dir: 'ltr' }),
        duration: h('select', {}, durOpts.map((m) => h('option', { value: m, selected: m === (s.duration || 30) }, m))),
        price: h('input', { type: 'number', min: 0, value: s.price || 0, style: 'width:100px' }),
        deposit: h('input', { type: 'number', min: 0, max: 200, value: s.deposit === undefined ? 100 : s.deposit, style: 'width:80px' }),
        active: h('input', { type: 'checkbox', checked: s.active !== false }),
      };
      const save = guard(async () => {
        const body = { name_ar: f.name_ar.value, name_en: f.name_en.value, duration: +f.duration.value, price: +f.price.value, deposit: +f.deposit.value, active: f.active.checked };
        if (isNew) { const r = await api('/services', { method: 'POST', body }); S.cfg.services[r.id] = r.service; }
        else S.cfg.services[id] = await api('/services/' + id, { method: 'PUT', body });
        toast(t('saved')); viewServices(main);
      });
      return h('tr', {}, h('td', {}, f.name_ar), h('td', {}, f.name_en), h('td', {}, f.duration), h('td', {}, f.price), h('td', {}, f.deposit), h('td', {}, f.active), h('td', {}, h('button', { class: 'btn sm gold', onclick: save }, isNew ? t('add') : t('save'))));
    };
    main.replaceChildren(h('div', { class: 'card' }, h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' },
      h('thead', {}, h('tr', {}, ['nameAr', 'nameEn', 'duration', 'price', 'depositSar', 'active', ''].map((k) => h('th', {}, k ? t(k) : '')))),
      h('tbody', {}, Object.entries(S.cfg.services).map(([id, s]) => mkRow(id, s, false)))))),
    h('div', { class: 'card' }, h('h2', {}, t('addService')), h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' }, h('tbody', {}, mkRow(null, {}, true))))));
  }

  // ---------- Closures ----------
  function viewClosures(main) {
    const from = h('input', { type: 'date', value: S.today }), to = h('input', { type: 'date', value: S.today });
    const who = h('select', {}, h('option', { value: '' }, t('clinicWide')), Object.entries(S.cfg.doctors).map(([id, d]) => h('option', { value: id }, nm(d))));
    const reason = h('input', { placeholder: t('reason'), maxlength: 100 });
    const warn = h('div', {});
    const add = guard(async () => {
      const r = await api('/closures', { method: 'POST', body: { from: from.value, to: to.value || from.value, doctorId: who.value || null, reason: reason.value } });
      S.cfg.closures.push(r.closure); toast(t('saved')); viewClosures(main);
      if (r.conflicts.length) main.prepend(h('div', { class: 'warnbox' }, h('strong', {}, t('conflict')), h('ul', { style: 'margin:8px 20px' }, r.conflicts.map((b) => h('li', {}, `${b.date} ${b.time} — ${b.patient.name} (${docName(b.doctorId)})`)))));
    });
    const del = guard(async (id) => { await api('/closures/' + id, { method: 'DELETE', body: {} }); S.cfg.closures = S.cfg.closures.filter((c) => c.id !== id); viewClosures(main); });
    const list = S.cfg.closures.slice().sort((a, b) => a.from.localeCompare(b.from));
    main.replaceChildren(
      h('div', { class: 'card' }, h('h2', {}, t('closeNew')), h('div', { class: 'bar' }, h('label', {}, t('from') + ' ', from), h('label', {}, t('to') + ' ', to), who, h('span', { class: 'grow' }, reason), h('button', { class: 'btn gold', onclick: add }, t('add'))), warn),
      h('div', { class: 'card' }, h('h2', {}, t('existing')), list.length ? h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' }, h('tbody', {}, list.map((c) => h('tr', {},
        h('td', {}, c.from === c.to ? c.from : c.from + ' → ' + c.to), h('td', {}, c.doctorId ? docName(c.doctorId) : t('clinicWide')), h('td', {}, c.reason || ''),
        h('td', {}, h('button', { class: 'btn sm bad', onclick: () => del(c.id) }, t('remove')))))))) : h('div', { class: 'empty' }, t('noClosures'))));
  }

  // ---------- Reports ----------
  async function download(path, name) {
    const blob = await api(path, { blob: true });
    const a = h('a', { href: URL.createObjectURL(blob), download: name }); document.body.append(a); a.click(); a.remove();
  }
  async function viewReports(main) {
    const R = S.rpt;
    const r = await api(`/report?from=${R.from}&to=${R.to}&group=${R.group}`);
    const set = (from, to) => { R.from = from; R.to = to; viewReports(main).catch(() => {}); };
    const ms = S.today.slice(0, 8) + '01';
    const max = Math.max(1, ...r.series.map((s) => s.total));
    const COL = { attended: '#3ecf8e', upcoming: '#d4af37', noShow: '#ff6b6b', cancelled: '#5b6f68' };
    const kpi = (v, l, c) => h('div', { class: 'kpi ' + (c || '') }, h('b', {}, v), h('span', {}, l));
    const brk = (rows) => h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, ['', 'total', 'attendedK', 'noShowK', 'cancelledK', 'depositsK'].map((k) => h('th', {}, k === 'total' ? t('total') : k ? t(k) : '')))),
      h('tbody', {}, rows.map((x) => h('tr', {}, h('td', {}, nm(x)), h('td', {}, num(x.total)), h('td', {}, num(x.attended)), h('td', {}, num(x.noShow)), h('td', {}, num(x.cancelled)), h('td', {}, num(x.deposits) + ' ' + t('sar')))))));
    main.replaceChildren(
      h('div', { class: 'bar' },
        h('button', { class: 'btn', onclick: () => set(addDays(S.today, -6), S.today) }, t('last7')), h('button', { class: 'btn', onclick: () => set(addDays(S.today, -29), S.today) }, t('last30')),
        h('button', { class: 'btn', onclick: () => set(ms, S.today) }, t('thisMonth')), h('button', { class: 'btn', onclick: () => set(addDays(S.today, -89), S.today) }, t('last90')),
        h('input', { type: 'date', value: R.from, onchange: (e) => e.target.value && set(e.target.value, R.to) }), '→', h('input', { type: 'date', value: R.to, onchange: (e) => e.target.value && set(R.from, e.target.value) }),
        h('select', { onchange: (e) => { R.group = e.target.value; viewReports(main).catch(() => {}); } }, ['day', 'week', 'month'].map((g) => h('option', { value: g, selected: g === R.group }, t(g)))),
        h('span', { class: 'grow' }),
        h('button', { class: 'btn gold', onclick: guard(() => download(`/export?type=report&from=${R.from}&to=${R.to}`, `albadr-report-${R.from}_${R.to}.xlsx`)) }, t('exportReport')),
        h('button', { class: 'btn', onclick: guard(() => download(`/export?type=bookings&from=${R.from}&to=${R.to}`, `albadr-bookings-${R.from}_${R.to}.xlsx`)) }, t('exportBookings'))),
      h('div', { class: 'kpis' }, kpi(num(r.totals.total), t('total')), kpi(num(r.totals.attended), t('attendedK')), kpi(num(r.totals.noShow), t('noShowK'), 'bad'), kpi(r.noShowRate + '%', t('rate'), 'bad'),
        kpi(num(r.totals.cancelled), t('cancelledK')), kpi(num(r.totals.upcoming), t('upcomingK')), kpi(num(r.totals.deposits) + ' ' + t('sar'), t('depositsK')), kpi(num(r.totals.value) + ' ' + t('sar'), t('valueK'))),
      h('div', { class: 'card' }, r.series.length ? [h('div', { class: 'bars' }, r.series.map((s) => h('div', { class: 'col', title: `${s.key}: ${s.total}` },
        h('small', {}, s.total), h('div', { class: 'stack', style: `height:${Math.round((s.total / max) * 140)}px` }, ['noShow', 'cancelled', 'upcoming', 'attended'].map((k) => s[k] ? h('i', { style: `height:${(s[k] / s.total) * 100}%;background:${COL[k]}` }) : null)),
        h('small', {}, R.group === 'month' ? s.key : s.key.slice(5))))),
        h('div', { class: 'legend' }, [['attended', 'attendedK'], ['upcoming', 'upcomingK'], ['noShow', 'noShowK'], ['cancelled', 'cancelledK']].map(([c, k]) => h('span', {}, h('i', { style: 'background:' + COL[c] }), t(k))))]         : h('div', { class: 'empty' }, t('noData'))),
      h('div', { class: 'grid2' }, h('div', { class: 'card' }, h('h2', {}, t('byDoctor')), brk(r.byDoctor)), h('div', { class: 'card' }, h('h2', {}, t('byService')), brk(r.byService))));
  }

  // ---------- Patients & no-shows ----------
  function patientTable(list, extra) {
    const body = h('tbody', {});
    for (const p of list) {
      const detail = h('tr', { hidden: true }, h('td', { colspan: 8 }, h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl hist' },
        h('thead', {}, h('tr', {}, h('th', {}, t('history')), h('th', {}, t('service')), h('th', {}, t('doctor')), h('th', {}, t('status')))),
        h('tbody', {}, p.history.map((x) => h('tr', {}, h('td', {}, x.date + ' ' + x.time), h('td', {}, svcName(x.serviceId)), h('td', {}, docName(x.doctorId)), h('td', {}, statusPill({ status: x.status, attendance: x.attendance })))))))));
      body.append(h('tr', { class: p.flagged ? 'flag' : '', style: 'cursor:pointer', onclick: () => { detail.hidden = !detail.hidden; } },
        h('td', {}, p.name, p.flagged ? [' ', h('span', { class: 'pill bad' }, t('flagged'))] : null),
        h('td', { dir: 'ltr' }, h('a', { href: waLink(p.phone), target: '_blank', rel: 'noopener', style: 'color:var(--gold2)', onclick: (e) => e.stopPropagation() }, '+' + p.phone)),
        h('td', {}, p.email || '—'), h('td', {}, num(p.visits)), h('td', {}, num(p.noShows)), h('td', {}, p.lastVisit || '—'), h('td', {}, p.next || '—'), extra ? h('td', {}, extra(p)) : h('td', {})), detail);
    }
    return h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, ['patient', 'phone', 'email', 'visits', 'noShows', 'last', 'nextAppt', ''].map((k) => h('th', {}, k ? t(k) : '')))), body));
  }
  async function viewPatients(main) {
    const { patients } = await api('/patients');
    const q = h('input', { placeholder: t('search'), style: 'min-width:260px' });
    const holder = h('div', { class: 'card' });
    const draw = () => {
      const s = q.value.trim().toLowerCase();
      const list = patients.filter((p) => !s || p.name.toLowerCase().includes(s) || p.phone.includes(s.replace(/\D/g, '') || '\u0000'));
      holder.replaceChildren(list.length ? patientTable(list) : h('div', { class: 'empty' }, t('noPatients')));
    };
    q.addEventListener('input', draw); draw();
    main.replaceChildren(h('div', { class: 'bar' }, q, h('span', { class: 'grow' }), h('button', { class: 'btn gold', onclick: guard(() => download('/export?type=patients', 'albadr-patients.xlsx')) }, t('exportPatients'))), holder);
  }
  async function viewNoShow(main) {
    const { patients } = await api('/patients');
    const list = patients.filter((p) => p.noShows > 0).sort((a, b) => b.noShows - a.noShows);
    main.replaceChildren(h('p', { style: 'color:var(--text3);margin-bottom:14px' }, t('flagNote')), h('div', { class: 'card' }, list.length ? patientTable(list) : h('div', { class: 'empty' }, t('noNoShows'))));
  }

  // ---------- Blog CMS ----------
  const field = (label, input, hint) => h('label', { class: 'fld' }, h('span', {}, label), input, hint ? h('small', { style: 'color:var(--text3)' }, hint) : null);
  const toLocalInput = (s) => { const d = new Date(s); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

  async function viewBlog(main) {
    const list = await api('/posts');
    const st = (p) => (p.status === 'draft' ? t('draft') : p.live ? t('published') : t('scheduled'));
    main.replaceChildren(h('div', { class: 'card' }, h('button', { class: 'btn gold', onclick: () => editPost(main, null) }, t('newPost')), h('div', { class: 'tbl-wrap', style: 'margin-top:14px' },
      list.length ? h('table', { class: 'tbl' }, h('tbody', {}, list.map((p) => h('tr', {},
        h('td', {}, S.lang === 'en' ? p.title_en : p.title_ar), h('td', {}, st(p)), h('td', {}, p.publishedAt.slice(0, 10)),
        h('td', {}, h('button', { class: 'btn sm', onclick: () => editPost(main, p.slug) }, t('edit')), ' ',
          p.live ? h('a', { class: 'btn sm', href: '/blog/' + p.slug, target: '_blank', rel: 'noopener' }, t('viewLive')) : null, ' ',
          h('button', { class: 'btn sm bad', onclick: guard(async () => { if (!confirm(t('delAsk'))) return; await api('/posts/' + p.slug, { method: 'DELETE' }); viewBlog(main); }) }, t('del'))))))) : h('div', { class: 'empty' }, t('noPosts')))));
  }

  const editPost = guard(async (main, slug) => {
    const p = slug ? await api('/posts/' + slug) : { status: 'draft', publishedAt: new Date().toISOString(), category: '', cover: '' };
    const f = {};
    const txt = (k, lbl, dir) => { f[k] = h('input', { value: p[k] || '', dir }); return field(lbl, f[k]); };
    const area = (k, lbl, rows, dir) => { f[k] = h('textarea', { rows, dir, style: 'width:100%' }, p[k] || ''); return field(lbl, f[k]); };
    f.status = h('select', {}, ['draft', 'published'].map((s) => h('option', { value: s, selected: s === p.status }, t(s === 'draft' ? 'draft' : 'published'))));
    f.publishedAt = h('input', { type: 'datetime-local', value: toLocalInput(p.publishedAt) });
    const prev = h('div', { class: 'card', style: 'display:none' });
    const body = () => { const o = {}; for (const k of Object.keys(f)) o[k] = f[k].value; o.publishedAt = f.publishedAt.value ? new Date(f.publishedAt.value).toISOString() : undefined; return o; };
    main.replaceChildren(h('div', { class: 'card' },
      h('button', { class: 'btn sm', onclick: () => viewBlog(main) }, t('back')),
      h('div', { class: 'fld-grid' }, txt('slug', t('slug'), 'ltr'), txt('category', t('category'), 'ltr'), field(t('status'), f.status), field(t('publishAt'), f.publishedAt)),
      txt('cover', t('cover'), 'ltr'), txt('title_ar', t('titleAr'), 'rtl'), txt('title_en', t('titleEn'), 'ltr'),
      area('excerpt_ar', t('excAr'), 2, 'rtl'), area('excerpt_en', t('excEn'), 2, 'ltr'),
      h('small', { style: 'color:var(--text3)' }, t('mdHelp')),
      area('body_ar', t('bodyAr'), 14, 'rtl'), area('body_en', t('bodyEn'), 14, 'ltr'),
      h('div', { style: 'display:flex;gap:10px;margin-top:12px' },
        h('button', { class: 'btn gold', onclick: guard(async () => { await api(slug ? '/posts/' + slug : '/posts', { method: slug ? 'PUT' : 'POST', body: body() }); toast(t('saved')); viewBlog(main); }) }, t('save')),
        h('button', { class: 'btn', onclick: guard(async () => { const r = await api('/posts/preview', { method: 'POST', body: body() }); prev.style.display = ''; prev.innerHTML = '<div dir="rtl">' + r.ar + '</div><hr><div dir="ltr">' + r.en + '</div>'; }) }, t('preview')))), prev);
  });

  // ---------- Marketing / SEO settings ----------
  async function viewMarketing(main) {
    const { site, status } = await api('/site');
    const c = site.clinic, f = { clinic: {}, hours: {}, google: {}, social: {}, tracking: {} };
    const inp = (grp, obj, k, lbl, dir) => { f[grp][k] = h('input', { value: obj[k] || '', dir: dir || 'ltr' }); return field(lbl, f[grp][k]); };
    const cl = (k, dir) => inp('clinic', c, k, t(k), dir);
    const hr = (k, i) => { const v = (c.hours[k] || [])[i] || ''; return h('input', { type: 'time', value: v }); };
    const wk = [hr('weekday', 0), hr('weekday', 1)], fr = [hr('friday', 0), hr('friday', 1)];
    f.consent = h('input', { type: 'checkbox', checked: site.tracking.consent !== false });
    f.og = h('input', { value: site.ogImage || '', dir: 'ltr' });
    const chip = (ok, label) => h('div', {}, ok ? '✅ ' : '⚪ ', label + ': ', ok ? t('connected') : t('notConnected'));
    const save = guard(async () => {
      const val = (g) => Object.fromEntries(Object.entries(f[g]).map(([k, e]) => [k, e.value]));
      const body = {
        clinic: Object.assign(val('clinic'), { hours: { weekday: [wk[0].value, wk[1].value], friday: [fr[0].value, fr[1].value] } }),
        google: val('google'), social: val('social'), tracking: Object.assign(val('tracking'), { consent: f.consent.checked }), ogImage: f.og.value,
      };
      await api('/site', { method: 'PUT', body }); toast(t('saved')); viewMarketing(main);
    });
    main.replaceChildren(
      h('div', { class: 'card' }, chip(status.places, t('stPlaces')), chip(status.instagram, t('stIg')), h('div', { style: 'margin-top:8px' }, t('sitemapNote') + ' ', h('code', { dir: 'ltr' }, status.publicUrl + '/sitemap.xml'))),
      h('div', { class: 'card' }, h('h2', {}, t('secAddr')), h('div', { class: 'fld-grid' }, ['street_ar', 'district_ar', 'city_ar'].map((k) => cl(k, 'rtl')), ['street_en', 'district_en', 'city_en', 'postal', 'phone', 'whatsapp', 'email', 'lat', 'lng'].map((k) => (k === 'phone' || k === 'email' ? inp('clinic', c, k, k === 'phone' ? t('phone') : t('email')) : cl(k))))),
      h('div', { class: 'card' }, h('h2', {}, t('secHours')), h('div', { class: 'fld-grid' }, field(t('weekday'), h('div', {}, wk)), field(t('friday'), h('div', {}, fr)))),
      h('div', { class: 'card' }, h('h2', {}, t('secGoogle')), h('div', { class: 'fld-grid' }, inp('google', site.google, 'mapsUrl', t('mapsUrl')), inp('google', site.google, 'reviewUrl', t('reviewUrl')), field(t('ogImage'), f.og))),
      h('div', { class: 'card' }, h('h2', {}, t('secSocial')), h('div', { class: 'fld-grid' }, ['instagram', 'snapchat', 'tiktok', 'x', 'facebook', 'youtube'].map((k) => inp('social', site.social, k, k)))),
      h('div', { class: 'card' }, h('h2', {}, t('secTrack')), h('div', { class: 'fld-grid' }, inp('tracking', site.tracking, 'ga4', t('ga4')), inp('tracking', site.tracking, 'metaPixel', t('metaPixel'))), h('label', { style: 'display:flex;gap:8px;margin-top:10px' }, f.consent, t('consent'))),
      h('button', { class: 'btn gold', onclick: save }, t('save')));
  }
  const VIEWS = { today: viewToday, doctors: viewDoctors, services: viewServices, closures: viewClosures, reports: viewReports, noshow: viewNoShow, patients: viewPatients, blog: viewBlog, marketing: viewMarketing };

  if (S.token) boot(); else renderLogin();
})();
