'use strict';
// Moyasar payments (mada / Visa / Mastercard / Apple Pay). Mock mode when no keys are set.
const cfg = require('./config');
const SECRET = cfg.env.MOYASAR_SECRET_KEY;
const PUB = cfg.env.MOYASAR_PUBLISHABLE_KEY;

const mock = () => !SECRET || !PUB;
const auth = () => 'Basic ' + Buffer.from(SECRET + ':').toString('base64');

async function verify(paymentId, expectedHalalas) {
  const r = await fetch('https://api.moyasar.com/v1/payments/' + encodeURIComponent(paymentId), { headers: { Authorization: auth() } });
  const p = await r.json();
  if (!r.ok) throw new Error('Moyasar ' + r.status);
  return { paid: p.status === 'paid' && p.amount === expectedHalalas && p.currency === 'SAR', status: p.status, payment: p };
}

async function refund(paymentId) {
  if (mock() || !paymentId || paymentId.startsWith('mock_')) return { ok: true, mock: true };
  const r = await fetch(`https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}/refund`, { method: 'POST', headers: { Authorization: auth() } });
  return { ok: r.ok };
}

module.exports = { mock, verify, refund, publishableKey: PUB || '' };
