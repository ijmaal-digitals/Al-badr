'use strict';
const store = require('./store');
const notify = require('./notify');
const availability = require('./availability');
const cfg = require('./config');

async function tick() {
  const now = Date.now();
  for (const b of store.all()) {
    if (b.status === 'pending_payment' && b.holdUntil <= now) { b.status = 'expired'; store.save(); continue; }
    if (b.status !== 'confirmed') continue;
    const start = availability.epoch(b.date, b.time);
    b.reminders = b.reminders || {};
    // Review request: 24h after the appointment ends, only within a 3-day window
    const endAt = start + b.duration * 60000;
    if (b.attendance === 'no_show') continue;
    if (!b.reminders.review && now >= endAt + cfg.REVIEW_DELAY_HOURS * 3600e3) {
      b.reminders.review = true; store.save();
      if (now < endAt + 72 * 3600e3) await notify.reviewRequest(b);
      continue;
    }
    const until = start - now;
    // Skip the 24h reminder when the booking was created less than 24h out
    if (!b.reminders.h24 && until <= 24 * 3600e3 && until > 3 * 3600e3 && start - b.createdAt > 24 * 3600e3) {
      b.reminders.h24 = true; store.save();
      await notify.reminder24(b);
    }
    if (!b.reminders.h2 && until <= 2 * 3600e3 && until > 0 && start - b.createdAt > 2 * 3600e3) {
      b.reminders.h2 = true; store.save();
      await notify.reminder2(b);
    }
  }
}

function start() { setInterval(() => tick().catch((e) => console.error('[scheduler]', e)), 60000); }
module.exports = { start, tick };
