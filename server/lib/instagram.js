'use strict';
// Instagram feed via the Instagram API with Instagram Login (long-lived token). Cached; stale copy served on failure.
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

const DIR = process.env.DATA_DIR || path.join(cfg.ROOT, 'data');
const FILE = path.join(DIR, 'ig.json');
let state = {};
try { state = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (_) { state = {}; }
let cache = { data: null, exp: 0 };

const token = () => state.token || cfg.env.INSTAGRAM_ACCESS_TOKEN || '';
const enabled = () => !!token();
function persist() { try { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(state)); } catch (e) { console.error('[instagram]', e.message); } }

async function refreshIfDue() {
  const t = token();
  if (!t || Date.now() - (state.refreshedAt || 0) < 30 * 86400e3) return;
  try {
    const r = await fetch('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + encodeURIComponent(t));
    if (!r.ok) throw new Error('refresh ' + r.status);
    const j = await r.json();
    if (j.access_token) { state = { token: j.access_token, refreshedAt: Date.now() }; persist(); }
  } catch (e) { console.error('[instagram]', e.message); }
}

async function feed() {
  if (!enabled()) return { connected: false, posts: [] };
  if (cache.data && cache.exp > Date.now()) return cache.data;
  try {
    await refreshIfDue();
    const r = await fetch('https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=9&access_token=' + encodeURIComponent(token()));
    if (!r.ok) throw new Error('media ' + r.status);
    const j = await r.json();
    const posts = (j.data || []).map((m) => ({ id: m.id, type: m.media_type, image: m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url, link: m.permalink, caption: String(m.caption || '').slice(0, 140) })).filter((m) => m.image && /^https:\/\/www\.instagram\.com\//.test(m.link || ''));
    cache = { data: { connected: true, posts }, exp: Date.now() + 3600e3 };
  } catch (e) {
    console.error('[instagram]', e.message);
    if (!cache.data) return { connected: true, posts: [] };
    cache.exp = Date.now() + 10 * 60e3;
  }
  return cache.data;
}

module.exports = { feed, enabled };
