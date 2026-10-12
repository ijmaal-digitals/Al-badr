'use strict';
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

const DIR = process.env.DATA_DIR || path.join(cfg.ROOT, 'data');
const FILE = path.join(DIR, 'subscribers.json');
fs.mkdirSync(DIR, { recursive: true });
let list = [];
try { list = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (_) { list = []; }

function save() {
  fs.writeFileSync(FILE + '.tmp', JSON.stringify(list, null, 2));
  fs.renameSync(FILE + '.tmp', FILE);
}

module.exports = {
  all: () => list,
  add({ email, phone, source, lang }) {
    const hit = list.find((s) => s.email === email);
    if (hit) return { ...hit, isNew: false };
    const sub = { email, phone, source, lang, createdAt: Date.now(), code: cfg.OFFER_CODE };
    list.push(sub); save();
    return { ...sub, isNew: true };
  },
};
