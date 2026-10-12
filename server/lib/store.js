'use strict';
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

const DIR = process.env.DATA_DIR || path.join(cfg.ROOT, 'data');
const FILE = path.join(DIR, 'bookings.json');
fs.mkdirSync(DIR, { recursive: true });

let bookings = [];
try { bookings = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (_) { bookings = []; }

function save() {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(bookings, null, 2));
  fs.renameSync(tmp, FILE);
}

module.exports = {
  all: () => bookings,
  get: (id) => bookings.find((b) => b.id === id),
  byToken: (t) => bookings.find((b) => b.token === t),
  add(b) { bookings.push(b); save(); return b; },
  update(b) { save(); return b; },
  save,
};
