'use strict';
const cfg = require('./config');
const store = require('./store');
const av = require('./availability');
const settings = require('./settings');
const xlsx = require('./xlsx');

const NOSHOW_FLAG = 2;
const isCounted = (b) => b.status === 'confirmed' || b.status === 'cancelled';
const endAt = (b) => av.epoch(b.date, b.time) + b.duration * 60000;
const isPast = (b) => endAt(b) <= Date.now();
const price = (b) => (cfg.SERVICES[b.serviceId] || {}).price || 0;
const dName = (id, l) => { const d = cfg.DOCTORS[id]; return d ? (l === 'en' ? d.name_en : d.name_ar) : id; };
const sName = (id, l) => { const s = cfg.SERVICES[id]; return s ? (l === 'en' ? s.name_en : s.name_ar) : id; };

function row(b) {
  return {
    id: b.id, date: b.date, time: b.time, duration: b.duration, status: b.status, attendance: b.attendance || '',
    serviceId: b.serviceId, doctorId: b.doctorId, patient: b.patient, deposit: b.deposit, depositPaid: !!b.paymentId, refunded: !!b.refunded,
    price: price(b), createdAt: b.createdAt,
  };
}

function bookingsOn(date) {
  return store.all().filter((b) => b.date === date && (b.status === 'confirmed' || b.status === 'pending_payment' || b.status === 'cancelled'))
    .sort((a, b) => a.time.localeCompare(b.time)).map(row);
}

function inRange(from, to) {
  return store.all().filter((b) => b.date >= from && b.date <= to && isCounted(b));
}

function weekStart(date) { return av.addDays(date, -((new Date(date + 'T00:00:00Z').getUTCDay() + 1) % 7)); }
function keyOf(date, group) {
  if (group === 'month') return date.slice(0, 7);
  if (group === 'week') return weekStart(date);
  return date;
}

function report(from, to, group) {
  const list = inRange(from, to);
  const blank = () => ({ total: 0, attended: 0, noShow: 0, cancelled: 0, upcoming: 0, deposits: 0, value: 0 });
  const add = (o, b) => {
    o.total++;
    if (b.status === 'cancelled') o.cancelled++;
    else if (b.attendance === 'no_show') o.noShow++;
    else if (b.attendance === 'attended' || isPast(b)) { o.attended++; o.value += price(b); }
    else o.upcoming++;
    if (b.paymentId && !b.refunded) o.deposits += b.deposit || 0;
  };
  const totals = blank(), series = {}, byDoctor = {}, byService = {};
  for (const b of list) {
    const k = keyOf(b.date, group);
    add(totals, b);
    add(series[k] = series[k] || blank(), b);
    add(byDoctor[b.doctorId] = byDoctor[b.doctorId] || blank(), b);
    add(byService[b.serviceId] = byService[b.serviceId] || blank(), b);
  }
  const done = totals.attended + totals.noShow;
  return {
    from, to, group, totals, noShowRate: done ? Math.round((totals.noShow / done) * 1000) / 10 : 0,
    series: Object.keys(series).sort().map((k) => ({ key: k, ...series[k] })),
    byDoctor: Object.entries(byDoctor).map(([id, v]) => ({ id, name_ar: dName(id, 'ar'), name_en: dName(id, 'en'), ...v })).sort((a, b) => b.total - a.total),
    byService: Object.entries(byService).map(([id, v]) => ({ id, name_ar: sName(id, 'ar'), name_en: sName(id, 'en'), ...v })).sort((a, b) => b.total - a.total),
  };
}

function patients() {
  const map = new Map();
  for (const b of store.all()) {
    if (!isCounted(b)) continue;
    const k = b.patient.phone;
    const p = map.get(k) || { phone: k, name: b.patient.name, email: '', visits: 0, noShows: 0, cancelled: 0, lastVisit: '', next: '', history: [] };
    p.name = b.patient.name || p.name;
    if (b.patient.email) p.email = b.patient.email;
    if (b.status === 'cancelled') p.cancelled++;
    else if (b.attendance === 'no_show') p.noShows++;
    else if (b.attendance === 'attended' || isPast(b)) { p.visits++; if (b.date > p.lastVisit) p.lastVisit = b.date; }
    else if (!p.next || b.date < p.next) p.next = b.date;
    p.history.push({ id: b.id, date: b.date, time: b.time, serviceId: b.serviceId, doctorId: b.doctorId, status: b.status, attendance: b.attendance || '', price: price(b) });
    map.set(k, p);
  }
  return [...map.values()].map((p) => {
    p.history.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    p.flagged = p.noShows >= NOSHOW_FLAG;
    return p;
  }).sort((a, b) => (b.lastVisit || b.next || '').localeCompare(a.lastVisit || a.next || ''));
}

function settingsView() {
  return {
    services: cfg.SERVICES,
    doctors: Object.fromEntries(Object.entries(cfg.DOCTORS).map(([id, d]) => [id, { name_ar: d.name_ar, name_en: d.name_en, title_ar: d.title_ar, title_en: d.title_en, services: d.services, week: d.week, breaks: d.breaks || [], active: d.active !== false, calendar: !!d.calendarId }])),
    closures: settings.closures(),
    noShowFlag: NOSHOW_FLAG,
  };
}

const srcOf = (b) => { const s = b.source || {}; return { src: s.src || (s.click === 'gclid' ? 'google' : s.click === 'fbclid' ? 'facebook' : 'direct'), med: s.med || '', camp: s.camp || '' }; };
const STATUS = { confirmed: 'Confirmed', cancelled: 'Cancelled' };
function exportBook(type, from, to) {
  const L = 'en';
  if (type === 'patients') {
    return xlsx.build([{ name: 'Patients', rows: [
      ['Name', 'Phone', 'Email', 'Visits', 'No-shows', 'Cancelled', 'Last visit', 'Next appointment', 'Flagged'],
      ...patients().map((p) => [p.name, p.phone, p.email, p.visits, p.noShows, p.cancelled, p.lastVisit, p.next, p.flagged ? 'Yes' : '']),
    ] }]);
  }
  if (type === 'bookings') {
    return xlsx.build([{ name: 'Bookings', rows: [
      ['ID', 'Date', 'Time', 'Doctor', 'Service', 'Patient', 'Phone', 'Email', 'Status', 'Attendance', 'Duration (min)', 'Price (SAR)', 'Deposit (SAR)', 'Deposit paid', 'Refunded', 'Source', 'Medium', 'Campaign'],
      ...inRange(from, to).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map((b) => [b.id, b.date, b.time, dName(b.doctorId, L), sName(b.serviceId, L), b.patient.name, b.patient.phone, b.patient.email, STATUS[b.status], b.attendance === 'no_show' ? 'No-show' : b.attendance === 'attended' ? 'Attended' : '', b.duration, price(b), b.deposit, b.paymentId ? 'Yes' : 'No', b.refunded ? 'Yes' : '', srcOf(b).src, srcOf(b).med, srcOf(b).camp]),
    ] }]);
  }
  const r = report(from, to, 'day');
  const head = ['Total', 'Attended', 'No-show', 'Cancelled', 'Upcoming', 'Deposits (SAR)', 'Value (SAR)'];
  const vals = (o) => [o.total, o.attended, o.noShow, o.cancelled, o.upcoming, o.deposits, o.value];
  const wk = report(from, to, 'week'), mo = report(from, to, 'month');
  return xlsx.build([
    { name: 'Summary', rows: [['Metric', 'Value'], ['From', from], ['To', to], ...head.map((h, i) => [h, vals(r.totals)[i]]), ['No-show rate %', r.noShowRate]] },
    { name: 'Daily', rows: [['Date', ...head], ...r.series.map((s) => [s.key, ...vals(s)])] },
    { name: 'Weekly', rows: [['Week starting', ...head], ...wk.series.map((s) => [s.key, ...vals(s)])] },
    { name: 'Monthly', rows: [['Month', ...head], ...mo.series.map((s) => [s.key, ...vals(s)])] },
    { name: 'By doctor', rows: [['Doctor', ...head], ...r.byDoctor.map((s) => [s.name_en, ...vals(s)])] },
    { name: 'By service', rows: [['Service', ...head], ...r.byService.map((s) => [s.name_en, ...vals(s)])] },
  ]);
}

function conflicts(c) {
  return store.all().filter((b) => b.status === 'confirmed' && b.date >= c.from && b.date <= c.to && (!c.doctorId || b.doctorId === c.doctorId)).map(row);
}

module.exports = { bookingsOn, report, patients, settingsView, exportBook, conflicts, row };
