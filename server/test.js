'use strict';
// End-to-end smoke test in mock mode: node server/test.js
const os = require('os');
const fs = require('fs');
const path = require('path');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'albadr-'));
process.env.ADMIN_TOKEN = 'test-admin-token';
['MOYASAR_SECRET_KEY', 'MOYASAR_PUBLISHABLE_KEY', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'WHATSAPP_TOKEN', 'TWILIO_SID', 'RESEND_API_KEY'].forEach((k) => { process.env[k] = ''; });
const assert = require('assert');
const { server } = require('./index');
const av = require('./lib/availability');

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const j = async (p, o) => { const r = await fetch(base + p, o); return { s: r.status, b: await r.json().catch(() => ({})) }; };
  const post = (p, body) => j(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  const cfgR = await j('/api/config');
  assert.equal(cfgR.s, 200); assert(cfgR.b.payment.mock);

  const days = (await j('/api/availability?doctor=khalid&service=implants&from=' + av.riyadhToday() + '&days=10')).b.days;
  const day = Object.keys(days).find((d) => days[d] > 0);
  assert(day, 'has an available day');
  const slots = (await j(`/api/availability?doctor=khalid&service=implants&date=${day}`)).b.slots;
  assert(slots.length > 0);

  const body = { serviceId: 'implants', doctorId: 'khalid', date: day, time: slots[0], lang: 'en', patient: { name: 'Test Patient', phone: '0551234567', email: 'a@b.co' } };
  let r = await post('/api/bookings', body);
  assert.equal(r.s, 201); assert.equal(r.b.status, 'pending_payment'); assert.equal(r.b.amountHalalas, 20000);
  const { id, token } = r.b;

  // Slot is held: a second booking (and overlapping 30-min steps within the 90-min implant) must fail
  assert.equal((await post('/api/bookings', body)).s, 409);
  const after = (await j(`/api/availability?doctor=khalid&service=implants&date=${day}`)).b.slots;
  assert(!after.includes(slots[0]));

  assert.equal((await post(`/api/bookings/${id}/pay`, { token: 'x'.repeat(48), mock: true })).s, 404);
  r = await post(`/api/bookings/${id}/pay`, { token, mock: true });
  assert.equal(r.s, 200); assert.equal(r.b.status, 'confirmed'); assert(r.b.depositPaid);

  r = await j('/api/bookings/by-token/' + token); assert.equal(r.b.status, 'confirmed');
  assert.equal((await post('/api/bookings', { ...body, patient: { name: 'X', phone: '123' } })).s, 400);

  const other = slots[slots.length - 1];
  r = await post(`/api/bookings/by-token/${token}/reschedule`, { date: day, time: other });
  assert.equal(r.s, 200); assert.equal(r.b.time, other);

  r = await post(`/api/bookings/by-token/${token}/cancel`, {});
  assert.equal(r.s, 200); assert.equal(r.b.status, 'cancelled');
  assert(!!(await j(`/api/availability?doctor=khalid&service=implants&date=${day}`)).b.slots.includes(other), 'slot freed');

  // Wrong doctor/service pairing and lead-time
  assert.equal((await post('/api/bookings', { ...body, doctorId: 'huda' })).s, 400);
  // Static hardening
  for (const p of ['/server/index.js', '/data/bookings.json', '/.env.example', '/package.json', '/..%2F..%2Fwindows/win.ini']) {
    const s = (await fetch(base + p)).status; assert(s === 404 || s === 400, p + ' -> ' + s);
  }
  assert.equal((await fetch(base + '/contact.html')).status, 200);
  assert.equal((await j('/api/admin/bookings')).s, 401);

  r = await post('/api/subscribe', { email: 'x@y.co', lang: 'en' });
  assert.equal(r.s, 200); assert.equal(r.b.code, 'FIRST20');
  assert.equal((await post('/api/subscribe', { email: 'bad' })).s, 400);

  // Review request fires 24h after the visit ends, once
  const store = require('./lib/store'); const sched = require('./lib/scheduler');
  const past = new Date(Date.now() + 3 * 3600e3 - 25 * 3600e3);
  const pb = { id: 'RV1', token: 'r'.repeat(48), status: 'confirmed', serviceId: 'checkup', doctorId: 'khalid', date: past.toISOString().slice(0, 10), time: past.toISOString().slice(11, 16), duration: 30, patient: { name: 'R', phone: '966551234567', email: '' }, lang: 'ar', createdAt: Date.now() - 9e8, reminders: { h24: true, h2: true } };
  store.add(pb);
  await sched.tick(); assert.equal(pb.reminders.review, true);
  const out = fs.readFileSync(path.join(process.env.DATA_DIR, 'outbox.log'), 'utf8');
  assert(/لزيارتك/.test(out), 'review request sent');

  // Admin dashboard API
  const A = (p, o = {}) => j('/api/admin' + p, { ...o, headers: { 'X-Admin-Token': 'test-admin-token', ...(o.body ? { 'Content-Type': 'application/json' } : {}) } });
  const Ap = (p, body, method = 'POST') => A(p, { method, body: JSON.stringify(body) });
  assert.equal((await j('/api/admin/settings')).s, 401);
  assert.equal((await j('/api/admin/settings', { headers: { 'X-Admin-Token': 'nope' } })).s, 401);
  r = await A('/settings'); assert.equal(r.s, 200); assert(r.b.doctors.khalid.week['0'].length);

  assert.equal((await Ap('/services/whitening', { duration: 45 }, 'PUT')).s, 400);
  r = await Ap('/services/whitening', { duration: 90, price: 1100, deposit: 150 }, 'PUT');
  assert.equal(r.s, 200); assert.equal(r.b.price, 1100);
  assert.equal((await j('/api/config')).b.services.whitening.duration, 90);
  r = await Ap('/services', { name_ar: 'تنظيف', name_en: 'Cleaning', duration: 30, price: 250, deposit: 100 });
  assert.equal(r.s, 201); const newId = r.b.id;
  assert.equal((await Ap('/services/' + newId, { active: false }, 'PUT')).s, 200);
  assert(!(await j('/api/config')).b.services[newId], 'inactive service hidden');

  // Closures and breaks change availability
  const sl = async () => (await j(`/api/availability?doctor=khalid&service=checkup&date=${day}`)).b.slots;
  const before = await sl(); assert(before.length > 0);
  r = await Ap('/closures', { from: day, to: day, doctorId: 'khalid', reason: 'test' });
  assert.equal(r.s, 201); assert.equal((await sl()).length, 0);
  assert.equal((await Ap('/closures/' + r.b.closure.id, {}, 'DELETE')).s, 200);
  assert.equal((await sl()).length, before.length);
  assert.equal((await Ap('/closures', { from: day, to: '2000-01-01' })).s, 400);
  r = await Ap('/closures', { from: day, to: day }); assert.equal((await sl()).length, 0); // clinic-wide
  await Ap('/closures/' + r.b.closure.id, {}, 'DELETE');
  assert.equal((await Ap('/doctors/khalid', { breaks: [['10:00', '09:00']] }, 'PUT')).s, 400);
  assert.equal((await Ap('/doctors/khalid', { breaks: [['00:00', '23:30']] }, 'PUT')).s, 200);
  assert.equal((await sl()).length, 0, 'break covers the day');
  await Ap('/doctors/khalid', { breaks: [] }, 'PUT');
  const dow = new Date(day + 'T00:00:00Z').getUTCDay();
  const wk = (await A('/settings')).b.doctors.khalid.week; wk[dow] = [];
  assert.equal((await Ap('/doctors/khalid', { week: wk }, 'PUT')).s, 200); assert.equal((await sl()).length, 0, 'day off');
  wk[dow] = [['09:00', '22:00']]; await Ap('/doctors/khalid', { week: wk }, 'PUT');
  assert.equal((await sl()).length, before.length);

  // Attendance, no-show tracking, reports, patients, export
  const pb2 = { ...pb, id: 'RV2', token: 'q'.repeat(48), time: pb.time, reminders: { h24: true, h2: true, review: true } };
  store.add(pb2);
  assert.equal((await Ap('/bookings/RV1/no_show', {})).s, 200); assert.equal((await Ap('/bookings/RV2/no_show', {})).s, 200);
  assert.equal((await Ap('/bookings/' + id + '/attended', {})).s, 409, 'cancelled booking');
  r = await A('/patients'); const me = r.b.patients.find((p) => p.phone === '966551234567');
  assert.equal(me.noShows, 2); assert(me.flagged);
  r = await A(`/report?from=${av.addDays(av.riyadhToday(), -5)}&to=${av.addDays(av.riyadhToday(), 5)}&group=week`);
  assert.equal(r.s, 200); assert(r.b.totals.noShow >= 2); assert(r.b.byDoctor.length);
  assert.equal((await A('/day?date=' + pb.date)).b.bookings.length >= 2, true);
  for (const type of ['report', 'bookings', 'patients']) {
    const x = await fetch(base + `/api/admin/export?type=${type}&from=2026-01-01&to=2027-06-01`, { headers: { 'X-Admin-Token': 'test-admin-token' } });
    const buf = Buffer.from(await x.arrayBuffer());
    assert.equal(x.status, 200); assert.equal(buf.slice(0, 2).toString(), 'PK'); assert(/spreadsheetml/.test(x.headers.get('content-type')));
    fs.writeFileSync(path.join(process.env.DATA_DIR, type + '.xlsx'), buf);
  }
  assert.equal((await Ap('/bookings/RV1/clear', {})).s, 200);

  // ---- Marketing / SEO ----
  const txt = async (p) => { const x = await fetch(base + p); return { s: x.status, t: await x.text() }; };
  const ldOf = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  let pg = await txt('/');
  assert.equal(pg.s, 200); assert(/<link rel="canonical" href="[^"]+\/">/.test(pg.t)); assert(pg.t.includes('og:locale'));
  let ld = ldOf(pg.t); const clinic = ld.find((x) => [].concat(x['@type']).includes('Dentist'));
  assert(clinic && clinic.address.addressRegion === 'الشرائع'); assert(!clinic.aggregateRating, 'no fabricated rating');
  assert(pg.t.includes('id="location"') && !pg.t.includes('LOCAL_BLOCK') && pg.t.includes('google.com/maps'));
  assert(ldOf((await txt('/service-implants.html')).t).some((x) => x['@type'] === 'FAQPage'));
  assert(ldOf((await txt('/service-implants.html')).t).some((x) => x['@type'] === 'MedicalProcedure'));
  assert(!(await txt('/contact.html')).t.includes('Olaya'));
  assert(!(await txt('/admin.html')).t.includes('application/ld+json'));
  assert((await txt('/blog.html')).t.includes('/blog/veneers-vs-crowns'));
  const bp = await txt('/blog/veneers-vs-crowns');
  assert.equal(bp.s, 200); assert(ldOf(bp.t).some((x) => x['@type'] === 'BlogPosting')); assert(bp.t.includes('<base href="/">'));
  assert.equal((await txt('/blog/nope')).s, 404);
  const sm = await txt('/sitemap.xml'); assert(sm.t.includes('/blog/best-time-for-braces') && sm.t.includes('service-implants.html') && !sm.t.includes('admin.html'));
  const rb = await txt('/robots.txt'); assert(/Disallow: \/admin\.html/.test(rb.t) && /Sitemap:/.test(rb.t));
  assert.equal((await j('/api/site')).b.clinic.whatsapp.length > 5, true);
  assert.equal((await j('/api/instagram')).b.connected, false);
  assert.equal((await fetch(base + '/api/admin/site')).status, 401);

  assert.equal((await A('/posts')).b.length, 3);
  let np = { slug: 'x-test', status: 'draft', title_ar: 'ع', title_en: 'T', excerpt_ar: 'ع', excerpt_en: 'E', body_ar: 'نص <script>alert(1)</script> [x](javascript:alert(1))', body_en: '## H\n- a\n- **b**' };
  r = await Ap('/posts', np); assert.equal(r.s, 201);
  assert.equal((await txt('/blog/x-test')).s, 404, 'draft hidden');
  assert.equal((await Ap('/posts', np)).s, 400, 'duplicate slug');
  assert.equal((await Ap('/posts', { ...np, slug: 'Bad Slug' })).s, 400);
  assert.equal((await Ap('/posts/x-test', { ...np, status: 'published', publishedAt: '2020-01-01T00:00:00Z' }, 'PUT')).s, 200);
  const live = await txt('/blog/x-test');
  assert.equal(live.s, 200); assert(!/<script>alert/.test(live.t) && !/href="javascript:/.test(live.t) && live.t.includes('<h2>H</h2>'));
  assert(ldOf(live.t).length >= 2);
  assert.equal((await Ap('/posts/x-test', { ...np, status: 'published', publishedAt: '2099-01-01T00:00:00Z' }, 'PUT')).s, 200);
  assert.equal((await txt('/blog/x-test')).s, 404, 'scheduled hidden');
  assert.equal((await Ap('/x', {}, 'DELETE')).s, 404);
  assert.equal((await Ap('/posts/x-test', {}, 'DELETE')).s, 200); assert.equal((await A('/posts')).b.length, 3);

  assert.equal((await Ap('/site', { tracking: { ga4: 'bad' } }, 'PUT')).s, 400);
  assert.equal((await Ap('/site', { social: { instagram: 'https://evil.com/x' } }, 'PUT')).s, 400);
  assert.equal((await Ap('/site', { clinic: { lat: '24.7', lng: '' } }, 'PUT')).s, 400, 'needs both coordinates');
  r = await Ap('/site', { clinic: { street_ar: 'شارع تجريبي', lat: '24.7136', lng: '46.6753' }, social: { instagram: 'https://www.instagram.com/albadr' }, tracking: { ga4: 'G-TEST12345', metaPixel: '123456789012345' } }, 'PUT');
  assert.equal(r.s, 200);
  pg = await txt('/'); ld = ldOf(pg.t); const c2 = ld.find((x) => [].concat(x['@type']).includes('Dentist'));
  assert(c2.geo && c2.geo.latitude === 24.7136 && c2.sameAs.some((u) => u.includes('instagram.com')));
  assert(pg.t.includes('G-TEST12345') && pg.t.includes('id="igFeed"'));
  assert(!pg.t.includes('</script><script>alert'), 'site JSON escaped');

  // Attribution is stored and exported
  const bk = { ...body, time: slots[1], payDeposit: false, attribution: { utm_source: 'google', utm_medium: 'organic', utm_campaign: 'gbp' } };
  r = await post('/api/bookings', bk); assert.equal(r.s, 201);
  assert.equal(require('./lib/store').get(r.b.id).source.src, 'google');

  console.log('ALL TESTS PASSED');
  server.close(); process.exit(0);
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
