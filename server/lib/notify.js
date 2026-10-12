'use strict';
// WhatsApp (Meta Cloud API), SMS (Twilio), Email (Resend). Unconfigured channels log to data/outbox.log.
const fs = require('fs');
const path = require('path');
const cfg = require('./config');
const e = cfg.env;

const LOG = path.join(process.env.DATA_DIR || path.join(cfg.ROOT, 'data'), 'outbox.log');
function outbox(channel, to, text) {
  const line = `${new Date().toISOString()} [MOCK ${channel}] -> ${to}\n${text}\n---\n`;
  try { fs.appendFileSync(LOG, line); } catch (_) { /* ignore */ }
  console.log(line.trim());
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function fmtDate(date, lang) {
  const d = new Date(date + 'T12:00:00Z');
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function ctx(b) {
  const lang = b.lang === 'en' ? 'en' : 'ar';
  const svc = cfg.SERVICES[b.serviceId];
  const doc = cfg.DOCTORS[b.doctorId];
  return {
    lang, name: b.patient.name,
    service: svc['name_' + lang], doctor: doc['name_' + lang],
    date: fmtDate(b.date, lang), time: b.time,
    link: `${cfg.PUBLIC_URL}/manage.html?t=${b.token}`,
  };
}

function text(kind, b) {
  const c = ctx(b);
  if (c.lang === 'ar') {
    if (kind === 'confirm') return `مرحباً ${c.name}، تم تأكيد موعدك في البدر إيليت لطب الأسنان.\n${c.service} مع ${c.doctor}\n${c.date} - ${c.time}\nلتعديل أو إلغاء الموعد: ${c.link}`;
    if (kind === 'r24') return `تذكير: موعدك غداً ${c.time} (${c.service}) مع ${c.doctor}. لتعديل أو إلغاء الموعد: ${c.link}`;
    if (kind === 'r2') return `تذكير: موعدك بعد ساعتين، الساعة ${c.time} في البدر إيليت لطب الأسنان. ${c.link}`;
    if (kind === 'cancel') return `تم إلغاء موعدك ${c.date} ${c.time}. للحجز مجدداً: ${cfg.PUBLIC_URL}/contact.html`;
    if (kind === 'resched') return `تم تغيير موعدك إلى ${c.date} - ${c.time} مع ${c.doctor}. ${c.link}`;
    if (kind === 'review') return `شكراً ${c.name} لزيارتك البدر إيليت لطب الأسنان 🦷 رأيك يهمنا، قيّم تجربتك مع ${c.doctor}: ${cfg.REVIEW_URL || cfg.PUBLIC_URL + '/reviews.html'}`;
  } else {
    if (kind === 'review') return `Thank you ${c.name} for visiting Al Badr Elite Dental! Please rate your experience with ${c.doctor}: ${cfg.REVIEW_URL || cfg.PUBLIC_URL + '/reviews.html'}`;
    if (kind === 'confirm') return `Hi ${c.name}, your appointment at Al Badr Elite Dental is confirmed.\n${c.service} with ${c.doctor}\n${c.date} at ${c.time}\nReschedule or cancel: ${c.link}`;
    if (kind === 'r24') return `Reminder: your appointment is tomorrow at ${c.time} (${c.service}) with ${c.doctor}. Reschedule or cancel: ${c.link}`;
    if (kind === 'r2') return `Reminder: your appointment is in 2 hours, at ${c.time}, Al Badr Elite Dental. ${c.link}`;
    if (kind === 'cancel') return `Your appointment on ${c.date} at ${c.time} was cancelled. Book again: ${cfg.PUBLIC_URL}/contact.html`;
    if (kind === 'resched') return `Your appointment was moved to ${c.date} at ${c.time} with ${c.doctor}. ${c.link}`;
  }
  return '';
}

async function whatsapp(b, kind) {
  const body = text(kind, b);
  const to = b.patient.phone;
  if (!e.WHATSAPP_TOKEN || !e.WHATSAPP_PHONE_ID) return outbox('WHATSAPP', to, body);
  const c = ctx(b);
  const template = kind === 'r24' ? e.WHATSAPP_TEMPLATE_REMINDER : kind === 'review' ? e.WHATSAPP_TEMPLATE_REVIEW || 'review_request' : e.WHATSAPP_TEMPLATE_CONFIRM;
  const params = kind === 'review' ? [c.name, c.doctor, cfg.REVIEW_URL || cfg.PUBLIC_URL + '/reviews.html'] : [c.name, c.service, c.doctor, c.date, c.time, c.link];
  const r = await fetch(`https://graph.facebook.com/v20.0/${e.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + e.WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', to, type: 'template',
      template: {
        name: template, language: { code: c.lang },
        components: [{ type: 'body', parameters: params.map((t) => ({ type: 'text', text: String(t) })) }],
      },
    }),
  });
  if (!r.ok) throw new Error('WhatsApp ' + r.status + ' ' + (await r.text()));
}

async function sms(b, kind) {
  const body = text(kind, b);
  const to = '+' + b.patient.phone;
  if (!e.TWILIO_SID || !e.TWILIO_AUTH_TOKEN || !e.TWILIO_FROM) return outbox('SMS', to, body);
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${e.TWILIO_SID}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`${e.TWILIO_SID}:${e.TWILIO_AUTH_TOKEN}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: to, From: e.TWILIO_FROM, Body: body }),
  });
  if (!r.ok) throw new Error('SMS ' + r.status + ' ' + (await r.text()));
}

async function email(b, kind) {
  if (!b.patient.email) return;
  const c = ctx(b);
  const body = text(kind, b);
  const isReview = kind === 'review';
  const btnUrl = isReview ? (cfg.REVIEW_URL || cfg.PUBLIC_URL + '/reviews.html') : c.link;
  const btnText = isReview ? (c.lang === 'ar' ? 'قيّم تجربتك' : 'Leave a review') : (c.lang === 'ar' ? 'إدارة الموعد' : 'Manage appointment');
  const html = `<div dir="${c.lang === 'ar' ? 'rtl' : 'ltr'}" style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #d4af37;border-radius:12px">
<h2 style="color:#0b3d2e">${c.lang === 'ar' ? 'البدر إيليت لطب الأسنان' : 'Al Badr Elite Dental'}</h2>
<p style="white-space:pre-line">${esc(body.replace(btnUrl, '').replace(c.link, ''))}</p>
<p><a href="${esc(btnUrl)}" style="background:#d4af37;color:#0b3d2e;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">${btnText}</a></p></div>`;
  const subject = { confirm: c.lang === 'ar' ? 'تأكيد موعدك' : 'Appointment confirmed', cancel: c.lang === 'ar' ? 'تم إلغاء الموعد' : 'Appointment cancelled', resched: c.lang === 'ar' ? 'تم تغيير الموعد' : 'Appointment rescheduled', review: c.lang === 'ar' ? 'كيف كانت زيارتك؟' : 'How was your visit?' }[kind] || (c.lang === 'ar' ? 'تذكير بموعدك' : 'Appointment reminder');
  if (!e.RESEND_API_KEY) return outbox('EMAIL', b.patient.email, subject + '\n' + body);
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + e.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: e.EMAIL_FROM, to: [b.patient.email], subject, html }),
  });
  if (!r.ok) throw new Error('Email ' + r.status + ' ' + (await r.text()));
}

async function run(fns) {
  const res = await Promise.allSettled(fns);
  res.forEach((r) => { if (r.status === 'rejected') console.error('[notify]', r.reason && r.reason.message); });
  return res.every((r) => r.status === 'fulfilled');
}

module.exports = {
  confirmation: (b) => run([whatsapp(b, 'confirm'), sms(b, 'confirm'), email(b, 'confirm')]),
  rescheduled: (b) => run([whatsapp(b, 'resched'), sms(b, 'resched'), email(b, 'resched')]),
  cancelled: (b) => run([sms(b, 'cancel'), email(b, 'cancel')]),
  reminder24: (b) => run([whatsapp(b, 'r24')]),
  reminder2: (b) => run([sms(b, 'r2')]),
  reviewRequest: (b) => run([whatsapp(b, 'review'), email(b, 'review')]),
  async welcomeOffer(sub) {
    const ar = sub.lang !== 'en';
    const body = ar
      ? `أهلاً بك في البدر إيليت لطب الأسنان! استخدم الكود ${cfg.OFFER_CODE} للحصول على خصم 20% على أول تنظيف أسنان. احجز الآن: ${cfg.PUBLIC_URL}/contact.html`
      : `Welcome to Al Badr Elite Dental! Use code ${cfg.OFFER_CODE} for 20% off your first cleaning. Book now: ${cfg.PUBLIC_URL}/contact.html`;
    const subject = ar ? 'خصم 20% على أول تنظيف أسنان' : '20% off your first cleaning';
    if (!e.RESEND_API_KEY) outbox('EMAIL', sub.email, subject + '\n' + body);
    else {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: 'Bearer ' + e.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: e.EMAIL_FROM, to: [sub.email], subject, html: `<div dir="${ar ? 'rtl' : 'ltr'}" style="font-family:Arial,sans-serif"><p>${esc(body)}</p></div>` }),
      }).catch((err) => ({ ok: false, status: err.message }));
      if (!r.ok) console.error('[notify] welcome email', r.status);
    }
    return true;
  },
};
