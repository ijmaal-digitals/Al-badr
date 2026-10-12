'use strict';
// Blog CMS store + a small, safe Markdown renderer (all input is HTML-escaped first)
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

const DIR = process.env.DATA_DIR || path.join(cfg.ROOT, 'data');
const FILE = path.join(DIR, 'posts.json');
fs.mkdirSync(DIR, { recursive: true });

const SEED = [
  {
    slug: 'best-time-for-braces', category: 'orthodontics', status: 'published', publishedAt: '2025-01-05T08:00:00.000Z', cover: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80',
    title_ar: 'ما أفضل وقت لبدء التقويم؟', title_en: 'What Is the Best Time to Start Braces?',
    excerpt_ar: 'تعرّف على العمر المناسب لبدء تقويم الأسنان، والفرق بين التقويم المعدني والشفاف، ومتى يجب زيارة أخصائي التقويم.',
    excerpt_en: 'Learn the right age to start orthodontic treatment, how braces differ from clear aligners, and when to see an orthodontist.',
    body_ar: 'لا يوجد عمر واحد يناسب الجميع لبدء التقويم، لكن هناك مراحل يكون فيها التدخل أسهل وأكثر فاعلية.\n\n## متى يُنصح بالفحص الأول؟\nتوصي الجمعيات المتخصصة بأن يُعرض الطفل على أخصائي تقويم في حدود سن السابعة، لا لبدء العلاج بالضرورة، بل لرصد نمو الفكين وترتيب الأسنان مبكراً.\n\n## العمر الأنسب للعلاج\n- **من 11 إلى 14 سنة:** غالباً تكتمل الأسنان الدائمة وما زال الفكان في طور النمو، وهي مرحلة شائعة لبدء التقويم.\n- **المراهقون والبالغون:** يمكن علاجهم بنجاح في أي عمر ما دامت اللثة والعظم سليمين.\n\n## تقويم معدني أم شفاف؟\nالتقويم المعدني مناسب لمعظم الحالات بما فيها المعقدة، بينما يوفّر التقويم الشفاف مظهراً أخف وإمكانية إزالته للتنظيف، ويحتاج التزاماً بارتداء يومي كافٍ.\n\n## الخلاصة\nأفضل وقت هو بعد فحص أخصائي يحدد حالتك. [احجز استشارة تقويم](/contact.html?service=orthodontics) لنضع لك خطة واضحة بالمدة والتكلفة.',
    body_en: 'There is no single best age for braces, but some stages make treatment easier and more effective.\n\n## When should the first check be?\nSpecialist associations recommend an orthodontic screening around age 7. It does not always mean starting treatment; it lets the orthodontist monitor jaw growth and tooth eruption early.\n\n## The most common ages for treatment\n- **Ages 11 to 14:** most permanent teeth have erupted while the jaws are still growing, which is a common time to start.\n- **Teenagers and adults:** can be treated successfully at any age as long as gums and bone are healthy.\n\n## Metal braces or clear aligners?\nMetal braces suit most cases, including complex ones. Clear aligners are more discreet and removable for cleaning, but they need consistent daily wear.\n\n## Bottom line\nThe best time is after a specialist examines you. [Book an orthodontic consultation](/contact.html?service=orthodontics) and we will outline a clear plan with timeline and cost.',
  },
  {
    slug: 'veneers-vs-crowns', category: 'cosmetic', status: 'published', publishedAt: '2025-01-12T08:00:00.000Z', cover: 'https://images.unsplash.com/photo-1588776814546-ec7e7a730d1a?auto=format&fit=crop&w=1200&q=80',
    title_ar: 'الفينيرز أم التلبيسات: أيهما أنسب لك؟', title_en: 'Veneers vs Crowns: Which One Is Right for You?',
    excerpt_ar: 'مقارنة واضحة بين الفينيرز والتلبيسات من حيث الاستخدام والتحضير والعمر الافتراضي والتكلفة.',
    excerpt_en: 'A clear comparison of veneers and crowns: uses, tooth preparation, longevity and cost.',
    body_ar: 'يخلط كثيرون بين الفينيرز والتلبيسات (التيجان)، لكن لكل منهما استخداماً مختلفاً.\n\n## ما هو الفينير؟\nقشرة رقيقة من البورسلين أو السيراميك تُلصق على الوجه الأمامي للسن لتحسين الشكل واللون والمسافات. يحتاج عادةً إزالة طبقة رقيقة جداً من المينا.\n\n## ما هو التلبيس؟\nغطاء يحيط بالسن بالكامل. يُستخدم عند وجود تسوس كبير أو سن مكسور أو بعد علاج العصب لحمايته وتقويته.\n\n## كيف تختار؟\n- **الفينير:** أسنان سليمة نسبياً وهدفك تجميلي.\n- **التلبيس:** سن ضعيف أو مرمّم بشكل كبير ويحتاج حماية.\n\nتعتمد مدة بقاء أي منهما على العناية بالنظافة وعادات الإطباق، ويحدد الطبيب الخيار الأنسب بعد الفحص والتصوير. [اعرف المزيد عن الفينيرز](/service-veneers.html) أو [احجز موعد تقييم](/contact.html?service=veneers).',
    body_en: 'Veneers and crowns are often confused, but each serves a different purpose.\n\n## What is a veneer?\nA thin porcelain or ceramic shell bonded to the front of a tooth to improve shape, colour and spacing. It usually needs a very thin layer of enamel to be removed.\n\n## What is a crown?\nA cap that covers the whole tooth. It is used for large cavities, a broken tooth, or after root canal treatment to protect and strengthen it.\n\n## How to choose\n- **Veneer:** relatively healthy teeth and a cosmetic goal.\n- **Crown:** a weak or heavily restored tooth that needs protection.\n\nHow long either lasts depends on oral hygiene and bite habits, and your dentist decides after an exam and imaging. [Learn more about veneers](/service-veneers.html) or [book an assessment](/contact.html?service=veneers).',
  },
  {
    slug: 'teeth-whitening-sensitivity', category: 'whitening', status: 'published', publishedAt: '2025-01-19T08:00:00.000Z', cover: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1200&q=80',
    title_ar: 'هل تبييض الأسنان يسبب حساسية؟', title_en: 'Does Teeth Whitening Cause Sensitivity?',
    excerpt_ar: 'متى تكون حساسية التبييض مؤقتة، وكيف تقللها، ومن يجب أن يستشير الطبيب قبل التبييض.',
    excerpt_en: 'When whitening sensitivity is temporary, how to reduce it, and who should see a dentist first.',
    body_ar: 'الحساسية من الآثار الجانبية الشائعة للتبييض، وغالباً تكون مؤقتة وتزول خلال أيام.\n\n## لماذا تحدث؟\nتخترق مواد التبييض المينا وقد تُهيّج العصب مؤقتاً، خاصة إذا كانت اللثة منحسرة أو كان هناك تسوس أو شروخ دقيقة.\n\n## كيف تقللها؟\n- إجراء التبييض عند الطبيب بعد فحص الأسنان واللثة.\n- استخدام معجون مخصص للأسنان الحساسة قبل الجلسة وبعدها.\n- تجنب المشروبات الباردة أو الساخنة جداً لمدة يومين.\n\n## من يحتاج استشارة أولاً؟\nمن لديهم تسوس أو لثة ملتهبة أو حساسية شديدة أصلاً، والحوامل، والأطفال. قد يؤجَّل التبييض أو تُعدَّل الطريقة.\n\n[احجز فحصاً قبل التبييض](/contact.html?service=whitening) لنحدد البروتوكول المناسب لك.',
    body_en: 'Sensitivity is a common side effect of whitening and is usually temporary, fading within a few days.\n\n## Why does it happen?\nWhitening agents pass through enamel and can briefly irritate the nerve, especially with receding gums, cavities or hairline cracks.\n\n## How to reduce it\n- Have whitening done by a dentist after an exam of teeth and gums.\n- Use a sensitivity toothpaste before and after the session.\n- Avoid very hot or cold drinks for two days.\n\n## Who should get advice first?\nPeople with cavities, inflamed gums or existing severe sensitivity, plus pregnant women and children. Whitening may be postponed or adapted.\n\n[Book a pre-whitening check](/contact.html?service=whitening) and we will choose the right protocol for you.',
  },
];

let posts = null;
function persist() { const tmp = FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(posts, null, 2)); fs.renameSync(tmp, FILE); }
function load() {
  if (posts) return posts;
  try { posts = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (_) {
    posts = JSON.parse(JSON.stringify(SEED)).map((p) => Object.assign(p, { updatedAt: p.publishedAt }));
    persist();
  }
  return posts;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => (/^(https:\/\/|\/(?!\/)|mailto:|tel:)/i.test(u) ? u : '#');

function inline(t) {
  let s = esc(t);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, a, u) => `<img src="${esc(safeUrl(u.replace(/&amp;/g, '&')))}" alt="${a}" loading="lazy">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, a, u) => {
    const href = safeUrl(u.replace(/&amp;/g, '&'));
    return `<a href="${esc(href)}"${/^https:/i.test(href) ? ' rel="noopener" target="_blank"' : ''}>${a}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return s;
}

function render(md) {
  const out = []; let list = null, para = [];
  const flushP = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
  const flushL = () => { if (list) { out.push(`<${list.t}>${list.items.map((i) => '<li>' + inline(i) + '</li>').join('')}</${list.t}>`); list = null; } };
  for (const raw of String(md || '').split(/\r?\n/)) {
    const l = raw.trimEnd(); let m;
    if (!l.trim()) { flushP(); flushL(); continue; }
    if ((m = l.match(/^(#{2,3})\s+(.+)$/))) { flushP(); flushL(); out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); continue; }
    if ((m = l.match(/^[-*]\s+(.+)$/))) { flushP(); if (!list || list.t !== 'ul') { flushL(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = l.match(/^\d+[.)]\s+(.+)$/))) { flushP(); if (!list || list.t !== 'ol') { flushL(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = l.match(/^>\s?(.+)$/))) { flushP(); flushL(); out.push('<blockquote>' + inline(m[1]) + '</blockquote>'); continue; }
    flushL(); para.push(l.trim());
  }
  flushP(); flushL();
  return out.join('\n');
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const isLive = (p, now) => p.status === 'published' && Date.parse(p.publishedAt) <= (now || Date.now());
const text = (v, max, what, req) => {
  const s = String(v === undefined || v === null ? '' : v).replace(/\r\n/g, '\n').trim();
  if (req && !s) throw new Error(what + ' is required');
  if (s.length > max) throw new Error(what + ' is too long');
  return s;
};

function clean(b, existing) {
  const slug = text(b.slug !== undefined ? b.slug : existing && existing.slug, 80, 'Slug', true).toLowerCase();
  if (!SLUG.test(slug)) throw new Error('Slug may contain only lowercase English letters, numbers and dashes');
  const status = b.status === 'draft' ? 'draft' : 'published';
  let publishedAt = existing ? existing.publishedAt : null;
  if (b.publishedAt) { if (isNaN(Date.parse(b.publishedAt))) throw new Error('Invalid publish date'); publishedAt = new Date(b.publishedAt).toISOString(); }
  if (!publishedAt) publishedAt = new Date().toISOString();
  const cover = text(b.cover !== undefined ? b.cover : existing && existing.cover, 400, 'Cover image');
  if (cover && !/^(https:\/\/|\/(?!\/))/.test(cover)) throw new Error('Cover image must be an https:// link');
  return {
    slug, status, publishedAt, cover, category: text(b.category, 40, 'Category').toLowerCase().replace(/[^a-z0-9-]/g, ''),
    title_ar: text(b.title_ar, 120, 'Arabic title', true), title_en: text(b.title_en, 120, 'English title', true),
    excerpt_ar: text(b.excerpt_ar, 300, 'Arabic summary', true), excerpt_en: text(b.excerpt_en, 300, 'English summary', true),
    body_ar: text(b.body_ar, 20000, 'Arabic article', true), body_en: text(b.body_en, 20000, 'English article', true),
    updatedAt: new Date().toISOString(),
  };
}

function create(b) {
  const p = clean(b, null);
  if (load().some((x) => x.slug === p.slug)) throw new Error('This slug is already used');
  posts.push(p); persist(); return p;
}
function update(slug, b) {
  const i = load().findIndex((x) => x.slug === slug);
  if (i < 0) return null;
  const p = clean(Object.assign({}, b, { slug: b.slug || slug }), posts[i]);
  if (p.slug !== slug && posts.some((x) => x.slug === p.slug)) throw new Error('This slug is already used');
  posts[i] = p; persist(); return p;
}
function remove(slug) {
  const n = load().length; posts = posts.filter((x) => x.slug !== slug);
  if (posts.length === n) return false; persist(); return true;
}

const byDate = (a, b) => b.publishedAt.localeCompare(a.publishedAt);
module.exports = {
  all: () => load().slice().sort(byDate),
  live: () => load().filter((p) => isLive(p)).sort(byDate),
  get: (slug) => load().find((p) => p.slug === slug), isLive, create, update, remove, render, esc,
};
