'use strict';
// Server-side SEO: head injection, JSON-LD, placeholders, blog pages, sitemap and robots
const fs = require('fs');
const path = require('path');
const cfg = require('./config');
const site = require('./site');
const posts = require('./posts');

const esc = posts.esc;
const NAME_AR = 'البدر ايليت لطب الأسنان', NAME_EN = 'Al Badr Elite Dental';
let ratingProvider = () => null;

const PAGES = {
  'index.html': { path: '/', ar: ['{n} | عيادة أسنان فاخرة في {d}، {c}', 'عيادة أسنان في {d} {c}: زراعة، فينير وابتسامة هوليود، تقويم وإنفزلاين، تبييض وعلاج عصب. احجز موعدك أونلاين مع أطباء متخصصين.'] },
  'about.html': { ar: ['من نحن | {n}', 'تعرّف على قصة {n} في {d}، {c}: قيمنا والتقنيات الحديثة التي نستخدمها وفريقنا الطبي.'] },
  'services.html': { ar: ['خدمات الأسنان | {n} في {d}', 'جميع خدمات عيادتنا في {d}، {c}: زراعة الأسنان، الفينيرز، التقويم، التبييض، علاج العصب، أسنان الأطفال وتجميل الأسنان.'] },
  'doctors.html': { ar: ['أطباء الأسنان | {n}', 'تعرّف على أطباء {n} في {c}: التخصصات والمؤهلات وسنوات الخبرة، واحجز مع الطبيب الذي تفضله.'] },
  'gallery.html': { ar: ['صور قبل وبعد | {n}', 'نتائج حقيقية لحالات الزراعة والفينيرز والتقويم والتبييض في عيادتنا بـ{d}، {c}.'] },
  'blog.html': { ar: ['مدونة صحة الأسنان | {n}', 'مقالات من أطباء الأسنان: أفضل وقت للتقويم، الفينيرز مقابل التلبيسات، حساسية التبييض والمزيد.'] },
  'reviews.html': { ar: ['تقييمات المرضى | {n}', 'اقرأ تقييمات مرضى {n} على Google وآراءهم في تجربتهم.'] },
  'offers.html': { ar: ['عروض وباقات الأسنان | {n}', 'عروض وباقات حالية في {n}، {d} {c}: خصم على أول تنظيف وباقات التبييض والتقويم.'] },
  'contact.html': { ar: ['احجز موعد أسنان أونلاين | {n}', 'احجز موعدك في عيادة أسنان {d}، {c} بثلاث خطوات: الخدمة، الطبيب، الوقت. تأكيد فوري وتذكيرات عبر واتساب.'] },
  'service-implants.html': { svc: 'implants', ar: ['زراعة الأسنان في {c} | {n}', 'زراعة أسنان موجهة رقمياً في {d}، {c}. خطوات العلاج والأسعار الإرشادية والأسئلة الشائعة.'] },
  'service-veneers.html': { svc: 'veneers', ar: ['فينيرز وابتسامة هوليود في {c} | {n}', 'فينيرز وابتسامة هوليود في {d}، {c}. تصميم ابتسامة مخصص وأسعار إرشادية.'] },
  'service-orthodontics.html': { svc: 'orthodontics', ar: ['تقويم الأسنان وإنفزلاين في {c} | {n}', 'تقويم معدني وشفاف وإنفزلاين في {d}، {c} مع خطة علاج واضحة للمدة والتكلفة.'] },
  'service-whitening.html': { svc: 'whitening', ar: ['تبييض الأسنان في {c} | {n}', 'تبييض أسنان احترافي في {d}، {c} مع فحص مسبق لتقليل الحساسية.'] },
  'service-root-canal.html': { svc: 'root-canal', ar: ['علاج عصب الأسنان في {c} | {n}', 'علاج جذور وعصب الأسنان بأحدث التقنيات في {d}، {c}، لإنقاذ السن الطبيعي.'] },
  'service-pediatric.html': { svc: 'pediatric', ar: ['طب أسنان الأطفال في {c} | {n}', 'رعاية أسنان الأطفال في {d}، {c} في بيئة لطيفة وآمنة تناسب الصغار.'] },
  'service-cosmetic.html': { svc: 'cosmetic', ar: ['تجميل الأسنان في {c} | {n}', 'تجميل الأسنان في {d}، {c}: تحسين الشكل واللون والابتسامة بأسلوب طبيعي.'] },
};

const fill = (s, st) => s.replace(/\{n\}/g, NAME_AR).replace(/\{d\}/g, st.clinic.district_ar).replace(/\{c\}/g, st.clinic.city_ar);
const ldJson = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '')}</script>`;
const base = () => cfg.PUBLIC_URL.replace(/\/$/, '');
const clinicId = () => base() + '/#clinic';
const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();

function fmt12(t, lang) {
  const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? (lang === 'ar' ? 'م' : 'PM') : (lang === 'ar' ? 'ص' : 'AM');
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}${m ? ':' + String(m).padStart(2, '0') : ''} ${ap}`;
}
const hoursText = (pair, lang) => `${fmt12(pair[0], lang)} ${lang === 'ar' ? 'إلى' : 'to'} ${fmt12(pair[1], lang)}`;

function mapQuery(st) {
  const c = st.clinic;
  if (c.lat && c.lng) return `${c.lat},${c.lng}`;
  return [c.street_en, NAME_EN, c.district_en, c.city_en, 'Saudi Arabia'].filter(Boolean).join(' ');
}
const mapsView = (st) => st.google.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapQuery(st));
function directionsUrl(st) {
  let u = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(mapQuery(st));
  if (cfg.env.GOOGLE_PLACE_ID) u += '&destination_place_id=' + encodeURIComponent(cfg.env.GOOGLE_PLACE_ID);
  return u;
}
const embedUrl = (st) => 'https://www.google.com/maps?output=embed&q=' + encodeURIComponent(mapQuery(st));

function localBlocks(st) {
  const c = st.clinic, addrAr = [c.street_ar, c.district_ar, c.city_ar].filter(Boolean).join('، '), addrEn = [c.street_en, c.district_en, c.city_en].filter(Boolean).join(', ');
  const reviewUrl = st.google.reviewUrl || cfg.REVIEW_URL;
  const tel = c.phone.replace(/[^\d+]/g, '');
  const dual = (ar, en, tag) => `<${tag || 'span'} data-ar="${esc(ar)}" data-en="${esc(en)}">${esc(ar)}</${tag || 'span'}>`;
  const hoursHtml = `<p class="nap-hours">${dual(`السبت - الخميس: ${hoursText(c.hours.weekday, 'ar')}`, `Sat - Thu: ${hoursText(c.hours.weekday, 'en')}`)}<br>${c.hours.friday.length ? dual(`الجمعة: ${hoursText(c.hours.friday, 'ar')}`, `Fri: ${hoursText(c.hours.friday, 'en')}`) : dual('الجمعة: مغلق', 'Fri: Closed')}</p>`;
  const buttons = `<div class="gbp-actions">
<a class="btn btn-primary" href="${esc(directionsUrl(st))}" target="_blank" rel="noopener" data-track="directions">${dual('الاتجاهات', 'Get directions')}</a>
<a class="btn btn-ghost" href="tel:${esc(tel)}" data-track="call">${dual('اتصل بنا', 'Call us')}</a>
${reviewUrl ? `<a class="btn btn-ghost" href="${esc(reviewUrl)}" target="_blank" rel="noopener" data-track="review">${dual('قيّم تجربتك على Google', 'Review us on Google')}</a>` : ''}
<a class="btn btn-ghost" href="${esc(mapsView(st))}" target="_blank" rel="noopener">${dual('افتح في خرائط Google', 'Open in Google Maps')}</a></div>`;
  const nap = `<address class="nap"><strong>${dual(NAME_AR, NAME_EN)}</strong>
<p>${dual(addrAr, addrEn)}</p><p><a href="tel:${esc(tel)}" dir="ltr">${esc(c.phone)}</a></p>${hoursHtml}</address>`;
  const map = `<iframe class="map-frame" title="${esc(NAME_EN)} map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${esc(embedUrl(st))}"></iframe>`;
  return { nap, buttons, map, addrAr, addrEn };
}

function localSection(st) {
  const b = localBlocks(st), c = st.clinic;
  const h2Ar = `طبيب أسنان في ${c.district_ar}، ${c.city_ar}`, h2En = `Dentist in ${c.district_en}, ${c.city_en}`;
  const pAr = `تبحث عن عيادة أسنان قريبة منك في ${c.district_ar}؟ ${NAME_AR} عيادة متخصصة في ${c.city_ar} تقدم زراعة الأسنان والفينيرز والتقويم والتبييض وعلاج العصب وأسنان الأطفال مع إمكانية الحجز أونلاين.`;
  const pEn = `Looking for a dental clinic near you in ${c.district_en}? ${NAME_EN} is a specialist clinic in ${c.city_en} offering implants, veneers, braces, whitening, root canal and pediatric dentistry with online booking.`;
  return `<section class="section alt local-block" id="location"><div class="container split"><div><span class="eyebrow" data-ar="موقعنا" data-en="Find Us">موقعنا</span><h2 data-ar="${esc(h2Ar)}" data-en="${esc(h2En)}">${esc(h2Ar)}</h2><p class="lead" data-ar="${esc(pAr)}" data-en="${esc(pEn)}">${esc(pAr)}</p>${b.nap}${b.buttons}</div><div class="card map-card">${b.map}</div></div></section>`;
}
function contactCard(st) {
  const b = localBlocks(st);
  return `<div class="card reveal"><h2 data-ar="معلومات التواصل" data-en="Contact Information">معلومات التواصل</h2>${b.nap}<p><a href="mailto:${esc(st.clinic.email)}">${esc(st.clinic.email)}</a></p>${b.buttons}${b.map}</div>`;
}
function instagramSection(st) {
  if (!st.social.instagram) return '';
  return `<section class="section" id="instagram"><div class="container"><span class="eyebrow">Instagram</span><h2 data-ar="تابعنا على إنستغرام" data-en="Follow us on Instagram">تابعنا على إنستغرام</h2><div id="igFeed" class="ig-feed" data-profile="${esc(st.social.instagram)}"></div></div></section>`;
}
function postCards() {
  const list = posts.live();
  if (!list.length) return '<p class="muted" data-ar="سيتم نشر مقالات جديدة قريباً." data-en="New articles are coming soon.">سيتم نشر مقالات جديدة قريباً.</p>';
  return '<div class="grid-3">' + list.map((p) => `<article class="card post-card reveal">${p.cover ? `<a href="/blog/${esc(p.slug)}"><img class="thumb" src="${esc(p.cover)}" alt="${esc(p.title_ar)}" loading="lazy"></a>` : ''}${p.category ? `<span class="pill">${esc(p.category)}</span>` : ''}<h3><a href="/blog/${esc(p.slug)}" data-ar="${esc(p.title_ar)}" data-en="${esc(p.title_en)}">${esc(p.title_ar)}</a></h3><p class="muted" data-ar="${esc(p.excerpt_ar)}" data-en="${esc(p.excerpt_en)}">${esc(p.excerpt_ar)}</p><a class="read-more" href="/blog/${esc(p.slug)}" data-ar="اقرأ المقال" data-en="Read article">اقرأ المقال</a></article>`).join('') + '</div>';
}

// ---------- JSON-LD ----------
function clinicNode(st) {
  const c = st.clinic, u = base();
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const hours = [{ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: c.hours.weekday[0], closes: c.hours.weekday[1] }];
  if (c.hours.friday.length) hours.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: c.hours.friday[0], closes: c.hours.friday[1] });
  const n = {
    '@context': 'https://schema.org', '@type': ['Dentist', 'MedicalBusiness'], '@id': clinicId(), name: NAME_AR, alternateName: NAME_EN, url: u + '/',
    image: st.ogImage || undefined, telephone: c.phone, email: c.email || undefined, medicalSpecialty: 'Dentistry', priceRange: 'SAR',
    address: { '@type': 'PostalAddress', streetAddress: c.street_ar || undefined, addressLocality: c.city_ar, addressRegion: c.district_ar, postalCode: c.postal || undefined, addressCountry: 'SA' },
    areaServed: { '@type': 'City', name: c.city_en },
    openingHoursSpecification: hours, hasMap: mapsView(st),
    contactPoint: [{ '@type': 'ContactPoint', telephone: c.phone, contactType: 'reservations', areaServed: 'SA', availableLanguage: ['Arabic', 'English'] }],
    potentialAction: { '@type': 'ReserveAction', target: { '@type': 'EntryPoint', urlTemplate: u + '/contact.html', actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'] }, result: { '@type': 'Reservation', name: 'Dental appointment' } },
    sameAs: Object.values(st.social).filter(Boolean).concat(st.google.mapsUrl ? [st.google.mapsUrl] : []),
    makesOffer: Object.entries(cfg.SERVICES).filter(([, s]) => s.active !== false).map(([id, s]) => ({ '@type': 'Offer', priceCurrency: 'SAR', price: String(s.price), itemOffered: { '@type': 'MedicalProcedure', name: s.name_en } })),
  };
  if (c.lat && c.lng) n.geo = { '@type': 'GeoCoordinates', latitude: Number(c.lat), longitude: Number(c.lng) };
  const r = ratingProvider();
  if (r && r.rating && r.total) n.aggregateRating = { '@type': 'AggregateRating', ratingValue: r.rating, reviewCount: r.total, bestRating: 5 };
  return n;
}
const crumbs = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: base() + it[1] })) });

function faqNode(html) {
  const out = [];
  const re = /<button class="faq-q"[^>]*data-en="([^"]*)"[^>]*>([^<]*)<\/button><div class="faq-a"><p[^>]*data-en="([^"]*)"[^>]*>([^<]*)<\/p>/g;
  let m;
  while ((m = re.exec(html))) out.push({ '@type': 'Question', name: stripTags(m[2]), acceptedAnswer: { '@type': 'Answer', text: stripTags(m[4]) } });
  return out.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: out } : null;
}

function doctorNodes() {
  return Object.values(cfg.DOCTORS).filter((d) => d.active !== false).map((d) => ({ '@context': 'https://schema.org', '@type': 'Physician', name: d.name_ar, alternateName: d.name_en, medicalSpecialty: 'Dentistry', description: d.title_ar, worksFor: { '@id': clinicId() } }));
}

function pageGraph(file, st, html) {
  const def = PAGES[file], g = [];
  const u = '/' + (file === 'index.html' ? '' : file);
  if (file === 'index.html') {
    g.push(clinicNode(st));
    g.push({ '@context': 'https://schema.org', '@type': 'WebSite', url: base() + '/', name: NAME_AR, alternateName: NAME_EN, inLanguage: ['ar', 'en'], publisher: { '@id': clinicId() } });
  } else {
    g.push(crumbs([[NAME_EN, '/'], [fill(def.ar[0], st).split(' | ')[0], u]]));
    if (file === 'contact.html' || file === 'about.html') g.push(clinicNode(st));
  }
  if (def.svc && cfg.SERVICES[def.svc]) {
    const s = cfg.SERVICES[def.svc];
    g.push({ '@context': 'https://schema.org', '@type': 'MedicalProcedure', name: s.name_en, alternateName: s.name_ar, description: fill(def.ar[1], st), url: base() + u, provider: { '@id': clinicId() }, areaServed: st.clinic.city_en });
    const f = faqNode(html); if (f) g.push(f);
  }
  if (file === 'doctors.html') g.push(...doctorNodes());
  if (file === 'blog.html') g.push({ '@context': 'https://schema.org', '@type': 'Blog', name: NAME_AR, url: base() + '/blog.html', publisher: { '@id': clinicId() }, blogPost: posts.live().map((p) => ({ '@type': 'BlogPosting', headline: p.title_ar, url: base() + '/blog/' + p.slug, datePublished: p.publishedAt })) });
  return g;
}

// ---------- head injection ----------
function setHead(html, { title, desc, canonical, ogType, ogImage, st, graph, noindex }) {
  const t = esc(title), d = esc(desc);
  html = /<title>[\s\S]*?<\/title>/.test(html) ? html.replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`) : html.replace('</head>', `<title>${t}</title></head>`);
  html = html.replace(/<meta name="description"[^>]*>/i, '');
  const pub = JSON.stringify(site.pub()).replace(/</g, '\\u003c');
  const tags = [
    `<meta name="description" content="${d}">`, `<link rel="canonical" href="${esc(canonical)}">`,
    noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large">',
    `<meta property="og:type" content="${ogType || 'website'}">`, `<meta property="og:site_name" content="${esc(NAME_AR)}">`, `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`, `<meta property="og:url" content="${esc(canonical)}">`, '<meta property="og:locale" content="ar_SA">', '<meta property="og:locale:alternate" content="en_US">',
    ogImage ? `<meta property="og:image" content="${esc(ogImage)}">` : '', `<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${t}">`, `<meta name="twitter:description" content="${d}">`, ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}">` : '',
    '<meta name="geo.region" content="SA-01"><meta name="geo.placename" content="' + esc(st.clinic.district_en + ', ' + st.clinic.city_en) + '">',
    ...graph.map(ldJson), `<script>window.ALBADR_SITE=${pub};</script>`, '<script src="/js/track.js" defer></script><script src="/js/social.js" defer></script>',
  ].filter(Boolean).join('\n');
  return html.replace('</head>', tags + '\n</head>');
}

function page(file, html) {
  const def = PAGES[file];
  if (!def) return html;
  const st = site.get();
  const u = file === 'index.html' ? '/' : '/' + file;
  html = html.replace('<!--LOCAL_BLOCK-->', () => localSection(st)).replace('<!--CONTACT_CARD-->', () => contactCard(st))
    .replace('<!--POSTS-->', () => postCards()).replace('<!--INSTAGRAM-->', () => instagramSection(st));
  return setHead(html, { title: fill(def.ar[0], st), desc: fill(def.ar[1], st), canonical: base() + (u === '/' ? '/' : u), ogImage: st.ogImage, st, graph: pageGraph(file, st, html) });
}

const SHELL = path.join(cfg.ROOT, 'blog.html');
function postPage(slug) {
  const p = posts.get(slug);
  if (!p || !posts.isLive(p)) return null;
  const st = site.get();
  let html = fs.readFileSync(SHELL, 'utf8');
  const url = base() + '/blog/' + p.slug, date = p.publishedAt.slice(0, 10);
  const main = `<main class="section"><div class="container article"><nav class="crumbs"><a href="/blog.html" data-ar="المدونة" data-en="Blog">المدونة</a></nav><article><header><h1 data-ar="${esc(p.title_ar)}" data-en="${esc(p.title_en)}">${esc(p.title_ar)}</h1><p class="muted"><time datetime="${esc(date)}">${esc(date)}</time></p>${p.cover ? `<img class="article-cover" src="${esc(p.cover)}" alt="${esc(p.title_ar)}">` : ''}</header><div class="post-ar prose" lang="ar" dir="rtl">${posts.render(p.body_ar)}</div><div class="post-en prose" lang="en" dir="ltr">${posts.render(p.body_en)}</div></article><div class="card article-cta"><h3 data-ar="جاهز لابتسامة أفضل؟" data-en="Ready for a better smile?">جاهز لابتسامة أفضل؟</h3><a class="btn btn-primary" href="/contact.html" data-ar="احجز موعدك" data-en="Book your appointment">احجز موعدك</a></div></div></main>`;
  html = html.replace(/<main[\s\S]*<\/main>/, () => main).replace('<head>', '<head><base href="/">');
  const graph = [clinicNode(st), crumbs([[NAME_EN, '/'], ['Blog', '/blog.html'], [p.title_en, '/blog/' + p.slug]]), {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title_ar, alternativeHeadline: p.title_en, description: p.excerpt_ar, image: p.cover || st.ogImage || undefined,
    datePublished: p.publishedAt, dateModified: p.updatedAt || p.publishedAt, inLanguage: ['ar', 'en'], mainEntityOfPage: url, author: { '@id': clinicId() }, publisher: { '@id': clinicId() },
  }];
  return setHead(html, { title: `${p.title_ar} | ${NAME_AR}`, desc: p.excerpt_ar, canonical: url, ogType: 'article', ogImage: p.cover || st.ogImage, st, graph });
}

function sitemap() {
  const u = base(), urls = [];
  const mt = (f) => { try { return fs.statSync(path.join(cfg.ROOT, f)).mtime.toISOString().slice(0, 10); } catch (_) { return undefined; } };
  for (const f of Object.keys(PAGES)) urls.push([f === 'index.html' ? u + '/' : u + '/' + f, mt(f), f === 'index.html' ? '1.0' : f.startsWith('service-') || f === 'contact.html' ? '0.9' : '0.7']);
  for (const p of posts.live()) urls.push([u + '/blog/' + p.slug, (p.updatedAt || p.publishedAt).slice(0, 10), '0.6']);
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(([l, m, pr]) => `<url><loc>${esc(l)}</loc>${m ? `<lastmod>${m}</lastmod>` : ''}<priority>${pr}</priority></url>`).join('\n') + '\n</urlset>\n';
}
const robots = () => `User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /manage.html\nDisallow: /api/\n\nSitemap: ${base()}/sitemap.xml\n`;

module.exports = { page, postPage, sitemap, robots, PAGES, setRatingProvider: (fn) => { ratingProvider = fn; } };
