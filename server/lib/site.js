'use strict';
// Clinic / marketing settings: env defaults, overridden by values saved from the admin dashboard
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

const DIR = process.env.DATA_DIR || path.join(cfg.ROOT, 'data');
const FILE = path.join(DIR, 'site.json');
fs.mkdirSync(DIR, { recursive: true });

const env = cfg.env;
const DEFAULTS = () => ({
  clinic: {
    street_ar: 'مجمع البدر إيليت - شارع الفردوس - مخطط 1، أمام جمعية غيث', street_en: 'Al Badr Elite Complex, Al Firdous St., Plan 1, opposite Ghaith Association', district_ar: 'الشرائع', district_en: 'Al Shara\'i', city_ar: 'مكة المكرمة', city_en: 'Makkah', postal: '',
    phone: cfg.CLINIC_PHONE, whatsapp: '966551234567', email: 'info@albadr-elite.sa', lat: '21.4773', lng: '39.9448',
    hours: { weekday: ['09:00', '22:00'], friday: ['14:00', '21:00'] },
  },
  google: { mapsUrl: env.GOOGLE_MAPS_URL || 'https://maps.app.goo.gl/s3fTzDKsjNmF9FGp8', reviewUrl: env.GOOGLE_REVIEW_URL || '' },
  social: { instagram: '', snapchat: '', tiktok: '', x: '', facebook: '', youtube: '' },
  tracking: { ga4: env.GA4_ID || '', metaPixel: env.META_PIXEL_ID || '', consent: true },
  ogImage: '',
});

let saved = {};
try { saved = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (_) { saved = {}; }

function merge(base, over) {
  for (const k of Object.keys(base)) {
    if (over && over[k] !== undefined) {
      if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) merge(base[k], over[k]);
      else base[k] = over[k];
    }
  }
  return base;
}
const get = () => merge(DEFAULTS(), saved);

const str = (v, max, what) => {
  const s = String(v === undefined || v === null ? '' : v).trim();
  if (s.length > max) throw new Error(what + ' is too long');
  return s;
};
const url = (v, what, hosts) => {
  const s = str(v, 300, what);
  if (!s) return '';
  let u;
  try { u = new URL(s); } catch (_) { throw new Error(what + ' must be a full https:// link'); }
  if (u.protocol !== 'https:') throw new Error(what + ' must start with https://');
  if (hosts && !hosts.some((h) => u.hostname === h || u.hostname.endsWith('.' + h))) throw new Error(what + ' must be a ' + hosts[0] + ' link');
  return u.toString();
};
const time = (v, what) => { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) throw new Error(what + ' must be HH:MM'); return v; };
const hoursPair = (v, what, optional) => {
  if (optional && (!v || !v[0] || !v[1])) return [];
  if (!Array.isArray(v)) throw new Error(what + ' invalid');
  const r = [time(v[0], what), time(v[1], what)];
  if (r[0] >= r[1]) throw new Error(what + ': closing time must be after opening time');
  return r;
};

function save(body) {
  const cur = get(), b = body || {};
  const c = Object.assign({}, cur.clinic, b.clinic || {});
  const next = {
    clinic: {
      street_ar: str(c.street_ar, 150, 'Street (AR)'), street_en: str(c.street_en, 150, 'Street (EN)'),
      district_ar:       str(c.district_ar, 60, 'District (AR)') || 'الشرائع', district_en: str(c.district_en, 60, 'District (EN)') || 'Al Shara\'i',
            city_ar: str(c.city_ar, 60, 'City (AR)') || 'مكة المكرمة', city_en: str(c.city_en, 60, 'City (EN)') || 'Makkah', postal: str(c.postal, 10, 'Postal code'),
      phone: str(c.phone, 20, 'Phone').replace(/[^\d+]/g, ''), whatsapp: str(c.whatsapp, 20, 'WhatsApp').replace(/\D/g, ''), email: str(c.email, 120, 'Email'),
      lat: str(c.lat, 12, 'Latitude'), lng: str(c.lng, 12, 'Longitude'),
      hours: { weekday: hoursPair((c.hours || {}).weekday, 'Sat-Thu hours'), friday: hoursPair((c.hours || {}).friday, 'Friday hours', true) },
    },
    google: {
      mapsUrl: url((b.google || cur.google).mapsUrl, 'Google Maps link', ['google.com', 'goo.gl', 'g.page', 'maps.app.goo.gl', 'g.co']),
      reviewUrl: url((b.google || cur.google).reviewUrl, 'Google review link', ['google.com', 'g.page', 'goo.gl', 'g.co']),
    },
    social: {},
    tracking: {},
    ogImage: url(b.ogImage !== undefined ? b.ogImage : cur.ogImage, 'Share image'),
  };
  if (!next.clinic.phone) throw new Error('Phone is required');
  if (next.clinic.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.clinic.email)) throw new Error('Invalid email');
  for (const k of ['lat', 'lng']) if (next.clinic[k] && !/^-?\d{1,3}(\.\d+)?$/.test(next.clinic[k])) throw new Error('Invalid coordinates');
  if (!!next.clinic.lat !== !!next.clinic.lng) throw new Error('Enter both latitude and longitude');
  const soc = Object.assign({}, cur.social, b.social || {});
  const HOSTS = { instagram: ['instagram.com'], snapchat: ['snapchat.com'], tiktok: ['tiktok.com'], x: ['x.com', 'twitter.com'], facebook: ['facebook.com', 'fb.com'], youtube: ['youtube.com', 'youtu.be'] };
  for (const k of Object.keys(HOSTS)) next.social[k] = url(soc[k], k, HOSTS[k]);
  const tr = Object.assign({}, cur.tracking, b.tracking || {});
  const ga = str(tr.ga4, 20, 'GA4 ID').toUpperCase(), px = str(tr.metaPixel, 20, 'Meta Pixel ID');
  if (ga && !/^G-[A-Z0-9]{4,14}$/.test(ga)) throw new Error('GA4 ID looks like G-XXXXXXXXXX');
  if (px && !/^\d{8,20}$/.test(px)) throw new Error('Meta Pixel ID is a number (8-20 digits)');
  next.tracking = { ga4: ga, metaPixel: px, consent: tr.consent !== false };
  saved = next;
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(saved, null, 2));
  fs.renameSync(tmp, FILE);
  return get();
}

const pub = () => { const s = get(); return { clinic: s.clinic, google: { mapsUrl: s.google.mapsUrl, reviewUrl: s.google.reviewUrl || cfg.REVIEW_URL }, social: s.social, tracking: { ga4: s.tracking.ga4, metaPixel: s.tracking.metaPixel, consent: s.tracking.consent }, ogImage: s.ogImage }; };

module.exports = { get, save, pub };
