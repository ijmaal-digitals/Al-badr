'use strict';
const cfg = require('./config');
const store = require('./store');
const calendar = require('./calendar');
const settings = require('./settings');

const pad = (n) => String(n).padStart(2, '0');
const toMin = (hm) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
const fromMin = (m) => pad(Math.floor(m / 60)) + ':' + pad(m % 60);
const epoch = (date, time) => Date.parse(`${date}T${time}:00${cfg.TZ_OFFSET}`);

function riyadhToday() {
  const d = new Date(Date.now() + 3 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}
function addDays(date, n) {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function weekday(date) { return new Date(date + 'T00:00:00Z').getUTCDay(); }
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

function isActive(b, now) {
  return b.status === 'confirmed' || (b.status === 'pending_payment' && b.holdUntil > now);
}

function localBusy(doctorId, date, excludeId) {
  const now = Date.now();
  return store.all()
    .filter((b) => b.doctorId === doctorId && b.date === date && b.id !== excludeId && isActive(b, now))
    .map((b) => [epoch(b.date, b.time), epoch(b.date, b.time) + b.duration * 60000]);
}

async function slotsFor(doctorId, serviceId, date, excludeId) {
  const doc = cfg.DOCTORS[doctorId];
  const svc = cfg.SERVICES[serviceId];
  if (!doc || !svc || !doc.services.includes(serviceId) || !isDate(date)) return [];
  if (doc.active === false || svc.active === false || settings.isClosed(doctorId, date)) return [];
  const today = riyadhToday();
  if (date < today || date > addDays(today, cfg.HORIZON_DAYS)) return [];
  const windows = doc.week[weekday(date)] || [];
  if (!windows.length) return [];
  const breaks = (doc.breaks || []).map(([a, b]) => [toMin(a), toMin(b)]);

  const busy = localBusy(doctorId, date, excludeId);
  try { busy.push(...(await calendar.busy(doc, epoch(date, '00:00'), epoch(date, '00:00') + 86400000))); } catch (e) { /* ignore calendar errors */ }

  const earliest = Date.now() + cfg.MIN_LEAD_MIN * 60000;
  const out = [];
  for (const [from, to] of windows) {
    for (let t = toMin(from); t + svc.duration <= toMin(to); t += cfg.SLOT_STEP) {
      const s = epoch(date, fromMin(t));
      const e = s + svc.duration * 60000;
      if (s < earliest) continue;
      if (breaks.some(([bs, be]) => t < be && t + svc.duration > bs)) continue;
      if (busy.some(([bs, be]) => s < be && e > bs)) continue;
      out.push(fromMin(t));
    }
  }
  return out;
}

// Which dates in a range have at least one free slot
async function daysFor(doctorId, serviceId, from, days) {
  const res = {};
  const start = isDate(from) && from > riyadhToday() ? from : riyadhToday();
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    if (d > addDays(riyadhToday(), cfg.HORIZON_DAYS)) break;
    res[d] = (await slotsFor(doctorId, serviceId, d)).length;
  }
  return res;
}

module.exports = { localBusy, slotsFor, daysFor, epoch, isDate, isTime, riyadhToday, addDays, isActive };
