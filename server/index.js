'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cfg = require('./lib/config');
const store = require('./lib/store');
const av = require('./lib/availability');
const calendar = require('./lib/calendar');
const notify = require('./lib/notify');
const payments = require('./lib/payments');
const scheduler = require('./lib/scheduler');
const subscribers = require('./lib/subscribers');
const settings = require('./lib/settings');
const adminLib = require('./lib/admin');
const site = require('./lib/site');
const posts = require('./lib/posts');
const seo = require('./lib/seo');
const instagram = require('./lib/instagram');
let reviewCache = { data: null, exp: 0 };
seo.setRatingProvider(() => (reviewCache.data && reviewCache.data.source === 'google' ? reviewCache.data : null));
const clean = (v, n) => String(v || '').replace(/[^\w.\-+ %]/g, '').slice(0, n);

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > 100000) { reject(new HttpError(413, 'Payload too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (_) { reject(new HttpError(400, 'Invalid JSON')); } });
    req.on('error', reject);
  });
}

const hits = new Map();
function rateLimit(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now); hits.set(ip, arr);
  if (arr.length > 30) throw new HttpError(429, 'Too many requests');
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (!v.some((t) => now - t < 60000)) hits.delete(k); }, 120000).unref();

function normalizePhone(p) {
  let d = String(p || '').replace(/[\s\-()+]/g, '').replace(/[٠-٩]/g, (c) => '٠١٢٣٤٥٦٧٨٩'.indexOf(c));
  if (/^05\d{8}$/.test(d)) d = '966' + d.slice(1);
  else if (/^5\d{8}$/.test(d)) d = '966' + d;
  else if (/^009665\d{8}$/.test(d)) d = d.slice(2);
  return /^9665\d{8}$/.test(d) ? d : null;
}

const hoursUntil = (b) => (av.epoch(b.date, b.time) - Date.now()) / 3600e3;
const canChange = (b) => b.status === 'confirmed' && hoursUntil(b) >= cfg.CHANGE_CUTOFF_HOURS;

function publicView(b) {
  return {
    id: b.id, status: b.status, serviceId: b.serviceId, doctorId: b.doctorId,
    service: cfg.SERVICES[b.serviceId], doctor: { name_ar: cfg.DOCTORS[b.doctorId].name_ar, name_en: cfg.DOCTORS[b.doctorId].name_en },
    date: b.date, time: b.time, duration: b.duration, name: b.patient.name,
    deposit: b.deposit, depositPaid: !!b.paymentId, canChange: canChange(b),
    refundOnCancel: !!b.paymentId && hoursUntil(b) >= cfg.FREE_REFUND_HOURS,
    holdUntil: b.holdUntil || null,
  };
}

async function confirm(b) {
  b.status = 'confirmed'; b.holdUntil = null; b.confirmedAt = Date.now();
  b.reminders = {};
  await calendar.sync(b, 'upsert');
  store.save();
  notify.confirmation(b);
}

function authBooking(id, token) {
  const b = store.get(id);
  if (!b || !token || b.token.length !== String(token).length || !crypto.timingSafeEqual(Buffer.from(b.token), Buffer.from(String(token)))) throw new HttpError(404, 'Booking not found');
  return b;
}

const authFails = new Map();
function adminAuth(req) {
  const ip = req.socket.remoteAddress, now = Date.now();
  const fails = (authFails.get(ip) || []).filter((t) => now - t < 600000);
  if (fails.length >= 10) throw new HttpError(429, 'Too many failed attempts');
  const t = String(req.headers['x-admin-token'] || '');
  const want = cfg.env.ADMIN_TOKEN || '';
  if (!want || t.length !== want.length || !crypto.timingSafeEqual(Buffer.from(t), Buffer.from(want))) {
    fails.push(now); authFails.set(ip, fails);
    throw new HttpError(401, 'Unauthorized');
  }
}

async function routeAdmin(req, res, url) {
  adminAuth(req);
  const p = url.pathname.slice('/api/admin'.length), q = url.searchParams, m = req.method;
  const today = av.riyadhToday();
  const range = () => {
    const from = av.isDate(q.get('from')) ? q.get('from') : av.addDays(today, -29);
    const to = av.isDate(q.get('to')) ? q.get('to') : today;
    if (to < from || Date.parse(to) - Date.parse(from) > 800 * 86400000) throw new HttpError(400, 'Invalid date range');
    return [from, to];
  };
  const wrap = (fn) => { try { return fn(); } catch (e) { if (e instanceof HttpError) throw e; throw new HttpError(400, e.message); } };

  if (m === 'GET' && p === '/ping') return send(res, 200, { ok: true, today });
  if (m === 'GET' && p === '/settings') return send(res, 200, adminLib.settingsView());
  if (m === 'GET' && p === '/day') {
    const d = av.isDate(q.get('date')) ? q.get('date') : today;
    return send(res, 200, { date: d, bookings: adminLib.bookingsOn(d) });
  }
  if (m === 'GET' && p === '/report') {
    const [from, to] = range();
    return send(res, 200, adminLib.report(from, to, ['day', 'week', 'month'].includes(q.get('group')) ? q.get('group') : 'day'));
  }
  if (m === 'GET' && p === '/patients') return send(res, 200, { noShowFlag: 2, patients: adminLib.patients() });
  if (m === 'GET' && p === '/bookings') { const [from, to] = range(); return send(res, 200, store.all().filter((b) => b.date >= from && b.date <= to).map((b) => adminLib.row(b))); }
  if (m === 'GET' && p === '/export') {
    const [from, to] = range();
    const type = ['report', 'bookings', 'patients'].includes(q.get('type')) ? q.get('type') : 'report';
    const buf = adminLib.exportBook(type, from, to);
    res.writeHead(200, { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="albadr-${type}-${from}_${to}.xlsx"`, 'Cache-Control': 'no-store', 'Content-Length': buf.length });
    return res.end(buf);
  }

  if (m === 'GET' && p === '/site') return send(res, 200, { site: site.get(), status: { places: !!(cfg.env.GOOGLE_PLACES_KEY && cfg.env.GOOGLE_PLACE_ID), instagram: instagram.enabled(), publicUrl: cfg.PUBLIC_URL } });
  if (m === 'GET' && p === '/posts') return send(res, 200, posts.all().map((x) => ({ ...x, body_ar: undefined, body_en: undefined, live: posts.isLive(x) })));
  let mm;
  if (m === 'GET' && (mm = p.match(/^\/posts\/([a-z0-9-]+)$/))) {
    const x = posts.get(mm[1]);
    if (!x) throw new HttpError(404, 'Not found');
    return send(res, 200, x);
  }
  if (m === 'GET') return send(res, 404, { error: 'Not found' });

  const body = await readBody(req);
  if (m === 'PUT' && p === '/site') return send(res, 200, wrap(() => site.save(body)));
  if (m === 'POST' && p === '/posts/preview') return send(res, 200, { ar: posts.render(body.body_ar), en: posts.render(body.body_en) });
  if (m === 'POST' && p === '/posts') return send(res, 201, wrap(() => posts.create(body)));
  if (m === 'PUT' && (mm = p.match(/^\/posts\/([a-z0-9-]+)$/))) {
    const x = wrap(() => posts.update(mm[1], body));
    if (!x) throw new HttpError(404, 'Not found');
    return send(res, 200, x);
  }
  if (m === 'DELETE' && (mm = p.match(/^\/posts\/([a-z0-9-]+)$/))) {
    if (!posts.remove(mm[1])) throw new HttpError(404, 'Not found');
    return send(res, 200, { ok: true });
  }
  if (m === 'POST' && p === '/services') return send(res, 201, wrap(() => settings.createService(body)));
  if (m === 'PUT' && (mm = p.match(/^\/services\/([a-z0-9-]+)$/))) {
    if (!cfg.SERVICES[mm[1]]) throw new HttpError(404, 'Unknown service');
    return send(res, 200, wrap(() => settings.saveService(mm[1], body)));
  }
  if (m === 'PUT' && (mm = p.match(/^\/doctors\/([a-z0-9-]+)$/))) {
    wrap(() => settings.saveDoctor(mm[1], body));
    return send(res, 200, adminLib.settingsView().doctors[mm[1]]);
  }
  if (m === 'POST' && p === '/closures') {
    const c = wrap(() => settings.addClosure(body));
    return send(res, 201, { closure: c, conflicts: adminLib.conflicts(c) });
  }
  if (m === 'DELETE' && (mm = p.match(/^\/closures\/(C[a-f0-9]+)$/))) {
    if (!settings.removeClosure(mm[1])) throw new HttpError(404, 'Not found');
    return send(res, 200, { ok: true });
  }
  if (m === 'POST' && (mm = p.match(/^\/bookings\/([A-Z0-9]+)\/(attended|no_show|clear|cancel)$/))) {
    const b = store.get(mm[1]);
    if (!b) throw new HttpError(404, 'Booking not found');
    if (mm[2] === 'cancel') {
      if (b.status !== 'confirmed') throw new HttpError(409, 'Only confirmed bookings can be cancelled');
      if (b.paymentId) { const r = await payments.refund(b.paymentId); b.refunded = r.ok; }
      b.status = 'cancelled'; b.cancelledAt = Date.now(); b.cancelledBy = 'clinic';
      await calendar.sync(b, 'delete');
      store.save(); notify.cancelled(b);
    } else {
      if (b.status !== 'confirmed') throw new HttpError(409, 'Booking is not confirmed');
      if (mm[2] !== 'clear' && av.epoch(b.date, b.time) > Date.now()) throw new HttpError(409, 'Appointment has not started yet');
      if (mm[2] === 'clear') delete b.attendance; else b.attendance = mm[2] === 'no_show' ? 'no_show' : 'attended';
      store.save();
    }
    return send(res, 200, adminLib.row(b));
  }
  return send(res, 404, { error: 'Not found' });
}

async function routeApi(req, res, url) {
  const p = url.pathname;
  const q = url.searchParams;
  const m = req.method;

  if (m === 'GET' && p === '/api/config') {
    return send(res, 200, {
      services: Object.fromEntries(Object.entries(cfg.SERVICES).filter(([, s]) => s.active !== false)),
      doctors: Object.fromEntries(Object.entries(cfg.DOCTORS).filter(([, d]) => d.active !== false).map(([k, d]) => [k, { name_ar: d.name_ar, name_en: d.name_en, title_ar: d.title_ar, title_en: d.title_en, services: d.services.filter((s) => cfg.SERVICES[s] && cfg.SERVICES[s].active !== false) }])),
      depositRequired: cfg.DEPOSIT_REQUIRED, today: av.riyadhToday(), horizonDays: cfg.HORIZON_DAYS,
      payment: { mock: payments.mock(), publishableKey: payments.publishableKey },
    });
  }

  if (m === 'GET' && p === '/api/availability') {
    const doctor = q.get('doctor'), service = q.get('service'), date = q.get('date');
    if (!cfg.DOCTORS[doctor] || !cfg.SERVICES[service]) throw new HttpError(400, 'Invalid doctor or service');
    if (date) return send(res, 200, { date, slots: await av.slotsFor(doctor, service, date) });
    const days = Math.min(parseInt(q.get('days') || '35', 10) || 35, 62);
    return send(res, 200, { days: await av.daysFor(doctor, service, q.get('from'), days) });
  }

  if (m === 'POST' && p === '/api/bookings') {
    const b = await readBody(req);
    const doc = cfg.DOCTORS[b.doctorId], svc = cfg.SERVICES[b.serviceId];
    if (!doc || !svc || !doc.services.includes(b.serviceId)) throw new HttpError(400, 'Invalid doctor or service');
    if (!av.isDate(b.date) || !av.isTime(b.time)) throw new HttpError(400, 'Invalid date or time');
    const pt = b.patient || {};
    const name = String(pt.name || '').trim().slice(0, 80);
    const phone = normalizePhone(pt.phone);
    const email = String(pt.email || '').trim().slice(0, 120);
    if (name.length < 2) throw new HttpError(400, 'Name is required');
    if (!phone) throw new HttpError(400, 'Invalid Saudi mobile number');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Invalid email');
    if (!(await av.slotsFor(b.doctorId, b.serviceId, b.date)).includes(b.time)) throw new HttpError(409, 'Slot no longer available');
    // Re-check synchronously to avoid a race after the async availability lookup
    const s = av.epoch(b.date, b.time), e = s + svc.duration * 60000;
    if (av.localBusy(b.doctorId, b.date).some(([bs, be]) => s < be && e > bs)) throw new HttpError(409, 'Slot no longer available');

    const needPay = cfg.DEPOSIT_REQUIRED || b.payDeposit === true;
    const booking = {
      id: 'B' + crypto.randomBytes(4).toString('hex').toUpperCase(), token: crypto.randomBytes(24).toString('hex'),
      status: 'pending_payment', serviceId: b.serviceId, doctorId: b.doctorId, date: b.date, time: b.time, duration: svc.duration,
      patient: { name, phone, email, notes: String(pt.notes || '').slice(0, 300) }, lang: b.lang === 'en' ? 'en' : 'ar',
      source: b.attribution && typeof b.attribution === 'object' ? { src: clean(b.attribution.utm_source, 40), med: clean(b.attribution.utm_medium, 40), camp: clean(b.attribution.utm_campaign, 60), click: b.attribution.gclid ? 'gclid' : b.attribution.fbclid ? 'fbclid' : '' } : undefined,
      deposit: svc.deposit, paymentId: null, createdAt: Date.now(), holdUntil: Date.now() + cfg.HOLD_MIN * 60000, reminders: {},
    };
    store.add(booking);
    if (!needPay) { booking.deposit = 0; await confirm(booking); }
    return send(res, 201, { ...publicView(booking), token: booking.token, manageUrl: `${cfg.PUBLIC_URL}/manage.html?t=${booking.token}`, amountHalalas: svc.deposit * 100 });
  }

  let mm;
  if (m === 'POST' && (mm = p.match(/^\/api\/bookings\/([A-Z0-9]+)\/pay$/))) {
    const body = await readBody(req);
    const b = authBooking(mm[1], body.token);
    if (b.status === 'confirmed') return send(res, 200, publicView(b));
    if (b.status !== 'pending_payment' || b.holdUntil < Date.now()) throw new HttpError(410, 'Reservation expired');
    if (payments.mock()) {
      if (!body.mock) throw new HttpError(400, 'Mock payment only');
      b.paymentId = 'mock_' + crypto.randomBytes(6).toString('hex');
    } else {
      if (!body.paymentId) throw new HttpError(400, 'paymentId required');
      const v = await payments.verify(String(body.paymentId), b.deposit * 100);
      if (!v.paid) throw new HttpError(402, 'Payment not completed: ' + v.status);
      if (store.all().some((x) => x.paymentId === body.paymentId)) throw new HttpError(409, 'Payment already used');
      b.paymentId = String(body.paymentId);
    }
    await confirm(b);
    return send(res, 200, publicView(b));
  }

  if (m === 'GET' && (mm = p.match(/^\/api\/bookings\/by-token\/([a-f0-9]+)$/))) {
    const b = store.byToken(mm[1]);
    if (!b) throw new HttpError(404, 'Booking not found');
    return send(res, 200, publicView(b));
  }

  if (m === 'POST' && (mm = p.match(/^\/api\/bookings\/by-token\/([a-f0-9]+)\/(cancel|reschedule)$/))) {
    const b = store.byToken(mm[1]);
    if (!b) throw new HttpError(404, 'Booking not found');
    if (!canChange(b)) throw new HttpError(403, `Changes are only possible up to ${cfg.CHANGE_CUTOFF_HOURS} hours before the appointment. Please call ${cfg.CLINIC_PHONE}.`);
    if (mm[2] === 'cancel') {
      const refundable = !!b.paymentId && hoursUntil(b) >= cfg.FREE_REFUND_HOURS;
      if (refundable) { const r = await payments.refund(b.paymentId); b.refunded = r.ok; }
      b.status = 'cancelled'; b.cancelledAt = Date.now();
      await calendar.sync(b, 'delete');
      store.save(); notify.cancelled(b);
      return send(res, 200, { ...publicView(b), refunded: !!b.refunded });
    }
    const body = await readBody(req);
    if (!av.isDate(body.date) || !av.isTime(body.time)) throw new HttpError(400, 'Invalid date or time');
    if (!(await av.slotsFor(b.doctorId, b.serviceId, body.date, b.id)).includes(body.time)) throw new HttpError(409, 'Slot no longer available');
    const s = av.epoch(body.date, body.time), e = s + b.duration * 60000;
    if (av.localBusy(b.doctorId, body.date, b.id).some(([bs, be]) => s < be && e > bs)) throw new HttpError(409, 'Slot no longer available');
    b.date = body.date; b.time = body.time; b.reminders = {};
    await calendar.sync(b, 'upsert');
    store.save(); notify.rescheduled(b);
    return send(res, 200, publicView(b));
  }

  if (p.startsWith('/api/admin/')) return routeAdmin(req, res, url);

  if (m === 'GET' && p === '/api/google-reviews') {
    const key = cfg.env.GOOGLE_PLACES_KEY, pid = cfg.env.GOOGLE_PLACE_ID;
    if (!key || !pid) return send(res, 200, { source: 'fallback', reviews: [] });
    // Refreshed from Google at most every 6 hours; stale copy is served if Google fails
    if (!reviewCache.data || reviewCache.exp < Date.now()) {
      try {
        const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(pid)}?languageCode=ar`, { headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews' } });
        if (!r.ok) throw new Error('Places ' + r.status);
        const j = await r.json();
        reviewCache = {
          exp: Date.now() + 6 * 3600e3,
          data: {
            source: 'google', rating: j.rating, total: j.userRatingCount, url: cfg.env.GOOGLE_REVIEW_URL || '',
            reviews: (j.reviews || []).map((x) => ({ name: (x.authorAttribution || {}).displayName, rating: x.rating, text_ar: (x.text || {}).text, text_en: (x.text || {}).text, time: x.relativePublishTimeDescription })),
          },
        };
      } catch (e) {
        console.error('[reviews]', e.message);
        if (!reviewCache.data) return send(res, 200, { source: 'fallback', reviews: [] });
        reviewCache.exp = Date.now() + 10 * 60e3;
      }
    }
    return send(res, 200, reviewCache.data);
  }

  if (m === 'GET' && p === '/api/site') return send(res, 200, site.pub());
  if (m === 'GET' && p === '/api/instagram') return send(res, 200, await instagram.feed());

  if (m === 'POST' && p === '/api/subscribe') {
    const b = await readBody(req);
    const email = String(b.email || '').trim().toLowerCase().slice(0, 120);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Invalid email');
    const phone = b.phone ? normalizePhone(b.phone) : null;
    const sub = subscribers.add({ email, phone, source: String(b.source || 'site').slice(0, 20), lang: b.lang === 'en' ? 'en' : 'ar' });
    if (sub.isNew) notify.welcomeOffer(sub);
    return send(res, 200, { ok: true, code: cfg.OFFER_CODE });
  }

  throw new HttpError(404, 'Not found');
}

const BLOCKED = /^\/(server|data|node_modules)(\/|$)|^\/\.|package(-lock)?\.json$/i;
function serveStatic(req, res, url) {
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch (_) { res.writeHead(400); return res.end(); }
  if (rel.includes('\0') || BLOCKED.test(rel)) { res.writeHead(404); return res.end('Not found'); }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(cfg.ROOT, rel);
  if (!file.startsWith(cfg.ROOT + path.sep) || !MIME[path.extname(file).toLowerCase()]) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    const ext = path.extname(file).toLowerCase();
    if (ext === '.html') {
      try { buf = Buffer.from(seo.page(path.basename(file), buf.toString('utf8')), 'utf8'); } catch (e) { console.error('[seo]', e); }
    }
    res.writeHead(200, { 'Content-Type': MIME[ext], 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    try {
      if (req.method === 'POST') rateLimit(req.socket.remoteAddress);
      await routeApi(req, res, url);
    } catch (err) {
      if (!(err instanceof HttpError)) console.error(err);
      if (!res.headersSent) send(res, err.status || 500, { error: err.status ? err.message : 'Server error' });
    }
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  const hdr = { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' };
  if (url.pathname === '/sitemap.xml') { res.writeHead(200, { ...hdr, 'Content-Type': 'application/xml; charset=utf-8' }); return res.end(seo.sitemap()); }
  if (url.pathname === '/robots.txt') { res.writeHead(200, { ...hdr, 'Content-Type': 'text/plain; charset=utf-8' }); return res.end(seo.robots()); }
  const pm = url.pathname.match(/^\/blog\/([a-z0-9-]+)\/?$/);
  if (pm) {
    let html = null;
    try { html = seo.postPage(pm[1]); } catch (e) { console.error('[seo]', e); }
    if (!html) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Not found'); }
    res.writeHead(200, { ...hdr, 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }
  serveStatic(req, res, url);
});

if (require.main === module) {
  server.listen(cfg.PORT, () => {
    console.log(`Al Badr Elite Dental running at ${cfg.PUBLIC_URL}`);
    console.log(`Payments: ${payments.mock() ? 'MOCK' : 'Moyasar'} | Calendar: ${calendar.enabled() ? 'Google' : 'off'} | Deposit required: ${cfg.DEPOSIT_REQUIRED}`);
    scheduler.start();
  });
}
module.exports = { server };
