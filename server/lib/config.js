'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

// Minimal .env loader
try {
  const raw = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
    }
  }
} catch (_) { /* no .env */ }

const env = process.env;

const SLOT_STEP = 30;
const WEEK_DEFAULT = { 0: [['09:00', '22:00']], 1: [['09:00', '22:00']], 2: [['09:00', '22:00']], 3: [['09:00', '22:00']], 4: [['09:00', '22:00']], 5: [['14:00', '21:00']], 6: [['09:00', '22:00']] };

const SERVICES = {
  implants: { name_ar: 'زراعة الأسنان', name_en: 'Dental Implants', duration: 90, deposit: 200 },
  veneers: { name_ar: 'الفينير وابتسامة هوليود', name_en: 'Veneers & Hollywood Smile', duration: 60, deposit: 200 },
  orthodontics: { name_ar: 'تقويم الأسنان وإنفزلاين', name_en: 'Orthodontics & Invisalign', duration: 45, deposit: 150 },
  whitening: { name_ar: 'تبييض الأسنان', name_en: 'Teeth Whitening', duration: 60, deposit: 100 },
  'root-canal': { name_ar: 'علاج العصب', name_en: 'Root Canal Treatment', duration: 90, deposit: 150 },
  pediatric: { name_ar: 'أسنان الأطفال', name_en: 'Pediatric Dentistry', duration: 30, deposit: 100 },
  cosmetic: { name_ar: 'تجميل الأسنان', name_en: 'Cosmetic Dentistry', duration: 45, deposit: 150 },
  checkup: { name_ar: 'كشف واستشارة', name_en: 'Check-up & Consultation', duration: 30, deposit: 100 },
};

const PRICES = { implants: 3999, veneers: 1500, orthodontics: 6000, whitening: 900, 'root-canal': 700, pediatric: 200, cosmetic: 500, checkup: 150 };
Object.keys(SERVICES).forEach((k) => { SERVICES[k].price = PRICES[k]; SERVICES[k].active = true; });

const DOCTORS = {
  khalid: { name_ar: 'الطبيب 1 - الاسم يضاف لاحقاً', name_en: 'Doctor 1 - Name coming soon', title_ar: 'استشاري زراعة الأسنان', title_en: 'Implant Consultant', services: ['implants', 'checkup', 'cosmetic'], calendarId: env.CAL_KHALID || '', week: WEEK_DEFAULT },
  sarah: { name_ar: 'الطبيب 2 - الاسم يضاف لاحقاً', name_en: 'Doctor 2 - Name coming soon', title_ar: 'أخصائية الفينير وتجميل الأسنان', title_en: 'Veneers & Cosmetic Specialist', services: ['veneers', 'cosmetic', 'whitening', 'checkup'], calendarId: env.CAL_SARAH || '', week: WEEK_DEFAULT },
  rayan: { name_ar: 'الطبيب 3 - الاسم يضاف لاحقاً', name_en: 'Doctor 3 - Name coming soon', title_ar: 'أخصائي تقويم الأسنان', title_en: 'Orthodontist', services: ['orthodontics', 'checkup'], calendarId: env.CAL_RAYAN || '', week: WEEK_DEFAULT },
  lina: { name_ar: 'الطبيب 4 - الاسم يضاف لاحقاً', name_en: 'Doctor 4 - Name coming soon', title_ar: 'أخصائية علاج الجذور', title_en: 'Endodontist', services: ['root-canal', 'checkup'], calendarId: env.CAL_LINA || '', week: WEEK_DEFAULT },
  huda: { name_ar: 'الطبيب 5 - الاسم يضاف لاحقاً', name_en: 'Doctor 5 - Name coming soon', title_ar: 'أخصائية أسنان الأطفال', title_en: 'Pediatric Dentist', services: ['pediatric', 'checkup'], calendarId: env.CAL_HUDA || '', week: WEEK_DEFAULT },
  nasser: { name_ar: 'الطبيب 6 - الاسم يضاف لاحقاً', name_en: 'Doctor 6 - Name coming soon', title_ar: 'أخصائي التجميل والترميمات', title_en: 'Cosmetic & Restorative', services: ['cosmetic', 'whitening', 'checkup', 'veneers'], calendarId: env.CAL_NASSER || '', week: WEEK_DEFAULT },
};

module.exports = {
  ROOT, env, SLOT_STEP, SERVICES, DOCTORS,
  PORT: parseInt(env.PORT || '3000', 10),
  PUBLIC_URL: (env.PUBLIC_URL || 'http://localhost:' + (env.PORT || '3000')).replace(/\/$/, ''),
  TZ_OFFSET: '+03:00',
  MIN_LEAD_MIN: 120,
  HORIZON_DAYS: 60,
  HOLD_MIN: 10,
  CHANGE_CUTOFF_HOURS: 4,
  FREE_REFUND_HOURS: 24,
  DEPOSIT_REQUIRED: String(env.DEPOSIT_REQUIRED || 'true') === 'true',
  CLINIC_PHONE: '920088123',
  OFFER_CODE: 'FIRST20',
  REVIEW_DELAY_HOURS: 24,
  REVIEW_URL: env.GOOGLE_REVIEW_URL || (env.GOOGLE_PLACE_ID ? 'https://search.google.com/local/writereview?placeid=' + env.GOOGLE_PLACE_ID : ''),
};
