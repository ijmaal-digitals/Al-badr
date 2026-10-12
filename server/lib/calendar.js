'use strict';
// Google Calendar via service account (no dependencies). Silently disabled when not configured.
const crypto = require('crypto');
const cfg = require('./config');

const EMAIL = cfg.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const KEY = (cfg.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const enabled = () => !!(EMAIL && KEY);

let tokenCache = { token: '', exp: 0 };
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');

async function accessToken() {
  if (tokenCache.token && tokenCache.exp > Date.now() + 60000) return tokenCache.token;
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'RS256', typ: 'JWT' });
  const claim = b64({ iss: EMAIL, scope: 'https://www.googleapis.com/auth/calendar', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const sig = crypto.createSign('RSA-SHA256').update(`${head}.${claim}`).sign(KEY).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claim}.${sig}` }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('Google token error: ' + JSON.stringify(j));
  tokenCache = { token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return tokenCache.token;
}

async function api(method, path, body) {
  const r = await fetch('https://www.googleapis.com/calendar/v3' + path, {
    method,
    headers: { Authorization: 'Bearer ' + (await accessToken()), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 204) return {};
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Google Calendar ${r.status}: ${JSON.stringify(j.error || j)}`);
  return j;
}

const busyCache = new Map();
async function busy(doc, startMs, endMs) {
  if (!enabled() || !doc.calendarId) return [];
  const key = doc.calendarId + startMs;
  const hit = busyCache.get(key);
  if (hit && hit.exp > Date.now()) return hit.v;
  const j = await api('POST', '/freeBusy', {
    timeMin: new Date(startMs).toISOString(), timeMax: new Date(endMs).toISOString(),
    items: [{ id: doc.calendarId }],
  });
  const v = ((j.calendars || {})[doc.calendarId] || {}).busy || [];
  const out = v.map((x) => [Date.parse(x.start), Date.parse(x.end)]);
  busyCache.set(key, { v: out, exp: Date.now() + 60000 });
  return out;
}

function eventBody(b, doc, svc) {
  const start = new Date(Date.parse(`${b.date}T${b.time}:00${cfg.TZ_OFFSET}`));
  const end = new Date(start.getTime() + b.duration * 60000);
  return {
    summary: `${svc.name_en} - ${b.patient.name}`,
    description: `Patient: ${b.patient.name}\nPhone: ${b.patient.phone}\nEmail: ${b.patient.email || '-'}\nNotes: ${b.patient.notes || '-'}\nBooking: ${b.id}`,
    start: { dateTime: start.toISOString(), timeZone: 'Asia/Riyadh' },
    end: { dateTime: end.toISOString(), timeZone: 'Asia/Riyadh' },
  };
}

async function sync(b, action) {
  const doc = cfg.DOCTORS[b.doctorId];
  if (!enabled() || !doc || !doc.calendarId) { b.calendarEventId = b.calendarEventId || null; return; }
  const cal = encodeURIComponent(doc.calendarId);
  try {
    if (action === 'delete') {
      if (b.calendarEventId) await api('DELETE', `/calendars/${cal}/events/${b.calendarEventId}`);
      b.calendarEventId = null;
    } else if (b.calendarEventId) {
      await api('PUT', `/calendars/${cal}/events/${b.calendarEventId}`, eventBody(b, doc, cfg.SERVICES[b.serviceId]));
    } else {
      const ev = await api('POST', `/calendars/${cal}/events`, eventBody(b, doc, cfg.SERVICES[b.serviceId]));
      b.calendarEventId = ev.id;
    }
    busyCache.clear();
  } catch (e) { console.error('[calendar]', e.message); }
}

module.exports = { enabled, busy, sync };
