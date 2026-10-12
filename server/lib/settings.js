'use strict';
// Admin-editable settings (services, doctor schedules, closures) persisted over the config defaults
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cfg = require('./config');

const DIR = process.env.DATA_DIR || path.join(cfg.ROOT, 'data');
const FILE = path.join(DIR, 'settings.json');
fs.mkdirSync(DIR, { recursive: true });

let saved = { services: {}, doctors: {}, closures: [] };
try { saved = Object.assign(saved, JSON.parse(fs.readFileSync(FILE, 'utf8'))); } catch (_) { /* defaults */ }

const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
const toMin = (hm) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };

function persist() {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(saved, null, 2));
  fs.renameSync(tmp, FILE);
}

function apply() {
  for (const [id, s] of Object.entries(saved.services)) {
    cfg.SERVICES[id] = Object.assign(cfg.SERVICES[id] || {}, s);
  }
  for (const [id, d] of Object.entries(saved.doctors)) {
    if (cfg.DOCTORS[id]) Object.assign(cfg.DOCTORS[id], d);
  }
  for (const d of Object.values(cfg.DOCTORS)) { d.breaks = d.breaks || []; if (d.active === undefined) d.active = true; }
}

function cleanRanges(list, what) {
  if (!Array.isArray(list)) throw new Error(what + ' must be a list');
  const out = list.map((r) => {
    if (!Array.isArray(r) || !isTime(r[0]) || !isTime(r[1]) || toMin(r[0]) >= toMin(r[1])) throw new Error('Invalid time range in ' + what);
    return [r[0], r[1]];
  }).sort((a, b) => toMin(a[0]) - toMin(b[0]));
  for (let i = 1; i < out.length; i++) if (toMin(out[i][0]) < toMin(out[i - 1][1])) throw new Error('Overlapping ranges in ' + what);
  return out;
}

function intIn(v, min, max, what) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${what} must be a whole number between ${min} and ${max}`);
  return n;
}

function saveService(id, body) {
  const cur = cfg.SERVICES[id] || {};
  const s = {
    name_ar: String(body.name_ar !== undefined ? body.name_ar : cur.name_ar || '').trim().slice(0, 80),
    name_en: String(body.name_en !== undefined ? body.name_en : cur.name_en || '').trim().slice(0, 80),
    duration: intIn(body.duration !== undefined ? body.duration : cur.duration, 15, 480, 'Duration'),
    price: intIn(body.price !== undefined ? body.price : cur.price || 0, 0, 1000000, 'Price'),
    deposit: intIn(body.deposit !== undefined ? body.deposit : cur.deposit || 100, 0, 200, 'Deposit'),
    active: body.active !== undefined ? !!body.active : cur.active !== false,
  };
  if (!s.name_ar || !s.name_en) throw new Error('Arabic and English names are required');
  if (s.duration % cfg.SLOT_STEP !== 0) throw new Error('Duration must be a multiple of ' + cfg.SLOT_STEP + ' minutes');
  saved.services[id] = s; persist(); apply();
  return cfg.SERVICES[id];
}

function createService(body) {
  const base = String(body.name_en || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'service';
  let id = base;
  while (cfg.SERVICES[id]) id = base + '-' + crypto.randomBytes(2).toString('hex');
  return { id, service: saveService(id, body) };
}

function saveDoctor(id, body) {
  const doc = cfg.DOCTORS[id];
  if (!doc) throw new Error('Unknown doctor');
  const d = {};
  if (body.week !== undefined) {
    d.week = {};
    for (let i = 0; i < 7; i++) d.week[i] = cleanRanges((body.week || {})[i] || [], 'working hours');
  }
  if (body.breaks !== undefined) d.breaks = cleanRanges(body.breaks, 'breaks');
  if (body.services !== undefined) {
    if (!Array.isArray(body.services) || body.services.some((s) => !cfg.SERVICES[s])) throw new Error('Unknown service');
    d.services = body.services;
  }
  if (body.active !== undefined) d.active = !!body.active;
  saved.doctors[id] = Object.assign(saved.doctors[id] || {}, d); persist(); apply();
  return doc;
}

function addClosure(body) {
  if (!isDate(body.from)) throw new Error('Invalid start date');
  const to = body.to || body.from;
  if (!isDate(to) || to < body.from) throw new Error('Invalid end date');
  let doctorId = body.doctorId || null;
  if (doctorId && !cfg.DOCTORS[doctorId]) throw new Error('Unknown doctor');
  const c = { id: 'C' + crypto.randomBytes(3).toString('hex'), from: body.from, to, doctorId, reason: String(body.reason || '').slice(0, 100) };
  saved.closures.push(c); persist();
  return c;
}

function removeClosure(id) {
  const n = saved.closures.length;
  saved.closures = saved.closures.filter((c) => c.id !== id);
  if (saved.closures.length === n) return false;
  persist(); return true;
}

const closures = () => saved.closures;
function isClosed(doctorId, date) {
  return saved.closures.some((c) => (!c.doctorId || c.doctorId === doctorId) && date >= c.from && date <= c.to);
}

apply();
module.exports = { saveService, createService, saveDoctor, addClosure, removeClosure, closures, isClosed };
