'use strict';

function getCurrentLanguage() {
    const saved = localStorage.getItem('albadr_lang');
    if (saved === 'ar' || saved === 'en') {
        return saved;
    }
    return 'ar';
}

function updateLocalizedText(lang) {
    const useArabic = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = useArabic ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-ar][data-en]').forEach((el) => {
        el.textContent = useArabic ? el.dataset.ar : el.dataset.en;
    });

    document.querySelectorAll('[data-ar-placeholder][data-en-placeholder]').forEach((el) => {
        el.setAttribute('placeholder', useArabic ? el.dataset.arPlaceholder : el.dataset.enPlaceholder);
    });

    const navMap = {
        'index.html': { ar: 'الرئيسية', en: 'Home' },
        'about.html': { ar: 'من نحن', en: 'About' },
        'services.html': { ar: 'الخدمات', en: 'Services' },
        'doctors.html': { ar: 'الأطباء', en: 'Doctors' },
        'gallery.html': { ar: 'قبل/بعد', en: 'Before/After' },
        'blog.html': { ar: 'المدونة', en: 'Blog' },
        'reviews.html': { ar: 'التقييمات', en: 'Reviews' },
        'offers.html': { ar: 'العروض', en: 'Offers' },
        'contact.html': { ar: 'التواصل والحجز', en: 'Contact & Booking' }
    };

    document.querySelectorAll('.desktop-nav a, .mobile-drawer a').forEach((link) => {
        const href = link.getAttribute('href');
        if (href && navMap[href]) {
            link.textContent = useArabic ? navMap[href].ar : navMap[href].en;
        }
    });

    const closeBtn = document.getElementById('closeMobileMenu');
    if (closeBtn && !closeBtn.dataset.ar) {
        closeBtn.textContent = useArabic ? 'إغلاق' : 'Close';
    }

    document.querySelectorAll('option[data-ar][data-en]').forEach((option) => {
        option.textContent = useArabic ? option.dataset.ar : option.dataset.en;
    });

    const langBtnText = document.getElementById('langLabel');
    if (langBtnText) {
        langBtnText.textContent = useArabic ? 'English' : 'العربية';
    }
}

function showToast(message) {
    let wrap = document.getElementById('toastWrap');
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'toastWrap';
        wrap.className = 'toast-wrap';
        document.body.appendChild(wrap);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    wrap.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function toggleLanguage() {
    const current = getCurrentLanguage();
    const next = current === 'ar' ? 'en' : 'ar';
    localStorage.setItem('albadr_lang', next);
    updateLocalizedText(next);
    window.dispatchEvent(new CustomEvent('langchange', { detail: next }));
    showToast(next === 'ar' ? 'تم تغيير اللغة للعربية' : 'Language switched to English');
}

function initMobileDrawer() {
    const drawer = document.getElementById('mobileDrawer');
    const openBtn = document.getElementById('openMobileMenu');
    const closeBtn = document.getElementById('closeMobileMenu');
    if (!drawer) return;

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            drawer.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    const closeDrawer = () => {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeDrawer);
    }

    drawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDrawer();
        }
    });
}

function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.ba-slider');
    sliders.forEach((slider) => {
        const after = slider.querySelector('.ba-after');
        const handle = slider.querySelector('.ba-handle');
        if (!after || !handle) return;

        let dragging = false;
        const move = (clientX) => {
            const rect = slider.getBoundingClientRect();
            const raw = ((clientX - rect.left) / rect.width) * 100;
            const value = Math.min(95, Math.max(5, raw));
            after.style.width = `${value}%`;
            handle.style.insetInlineStart = `${value}%`;
        };

        const start = (clientX) => {
            dragging = true;
            move(clientX);
        };

        slider.addEventListener('mousedown', (e) => start(e.clientX));
        window.addEventListener('mousemove', (e) => {
            if (dragging) move(e.clientX);
        });
        window.addEventListener('mouseup', () => {
            dragging = false;
        });

        slider.addEventListener('touchstart', (e) => {
            if (e.touches[0]) start(e.touches[0].clientX);
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (dragging && e.touches[0]) {
                move(e.touches[0].clientX);
            }
        }, { passive: true });
        window.addEventListener('touchend', () => {
            dragging = false;
        });
    });
}

function initFaq() {
    document.querySelectorAll('.faq-q').forEach((button) => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            if (!item) return;
            const isOpen = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach((entry) => entry.classList.remove('active'));
            if (!isOpen) {
                item.classList.add('active');
            }
        });
    });
}

async function loadReviews() {
    const feed = document.getElementById('googleReviewsFeed');
    if (!feed) return;

    const useArabic = getCurrentLanguage() === 'ar';
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    let reviews;
    let meta = null;
    const endpoint = feed.dataset.endpoint || '/api/google-reviews';

    try {
        const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        reviews = Array.isArray(data.reviews) ? data.reviews : [];
        if (data.source === 'google' && data.rating) meta = data;
        if (!reviews.length) throw new Error('empty');
    } catch (error) {
        reviews = [
            { name: 'نورة العتيبي', rating: 5, text_ar: 'التجربة كانت راقية جداً والدكتورة شرحت كل خطوة بوضوح.', text_en: 'Elegant experience and every treatment step was explained clearly.' },
            { name: 'Faisal A.', rating: 5, text_ar: 'نتائج الزراعة ممتازة وخدمة متابعة احترافية.', text_en: 'Excellent implant results with very professional follow-up.' },
            { name: 'ريم القحطاني', rating: 5, text_ar: 'أفضل عيادة للأسنان التجميلية في مكة من حيث الدقة والاهتمام.', text_en: 'Best cosmetic dental clinic in Makkah for precision and care.' }
        ];
    }

    let summary = document.getElementById('googleReviewsSummary');
    if (meta) {
        if (!summary) {
            summary = document.createElement('div');
            summary.id = 'googleReviewsSummary';
            summary.className = 'review-summary';
            feed.parentNode.insertBefore(summary, feed);
        }
        summary.innerHTML = `<strong>${Number(meta.rating).toFixed(1)}</strong> <span class="review-stars">★★★★★</span> <span class="muted">${meta.total || ''} ${useArabic ? 'تقييم على Google' : 'Google reviews'}</span>`;
    } else if (summary) {
        summary.remove();
    }

    feed.innerHTML = '';
    reviews.slice(0, 6).forEach((review) => {
        const card = document.createElement('article');
        card.className = 'review-card';
        const stars = '★'.repeat(Math.max(1, Math.min(5, Number(review.rating) || 5)));
        const text = useArabic ? (review.text_ar || review.text_en || '') : (review.text_en || review.text_ar || '');
        card.innerHTML = `
            <div class="review-stars">${stars}</div>
            <p>${esc(text)}</p>
            <p class="muted">— ${esc(review.name || 'Patient')}</p>
        `;
        feed.appendChild(card);
    });
}

function buildWhatsAppMessage(formData, lang) {
    const isAr = lang === 'ar';
    const message = isAr
        ? `مرحباً البدر ايليت لطب الأسنان\nالاسم: ${formData.get('name')}\nالجوال: ${formData.get('phone')}\nالخدمة: ${formData.get('service')}\nالطبيب: ${formData.get('doctor')}\nالتاريخ المفضل: ${formData.get('date')}\nملاحظات: ${formData.get('notes') || '-'}`
        : `Hello Al Badr Elite Dental\nName: ${formData.get('name')}\nPhone: ${formData.get('phone')}\nService: ${formData.get('service')}\nDoctor: ${formData.get('doctor')}\nPreferred Date: ${formData.get('date')}\nNotes: ${formData.get('notes') || '-'}`;
    return `https://wa.me/966551234567?text=${encodeURIComponent(message)}`;
}

function initBookingForms() {
    const forms = document.querySelectorAll('.booking-form');
    if (forms.length === 0) return;

    forms.forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const lang = getCurrentLanguage();
            const data = new FormData(form);
            const endpoint = form.dataset.endpoint || '/api/bookings';

            const name = String(data.get('name') || '').trim();
            const phone = String(data.get('phone') || '').trim();
            if (!name || !phone) {
                showToast(lang === 'ar' ? 'يرجى تعبئة الاسم والجوال' : 'Please enter your name and phone number');
                return;
            }

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(data.entries()))
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                showToast(lang === 'ar' ? 'تم إرسال الحجز بنجاح' : 'Booking submitted successfully');
            } catch (error) {
                showToast(lang === 'ar' ? 'تم التحويل إلى واتساب لتأكيد الحجز' : 'Redirecting to WhatsApp for confirmation');
            }

            window.open(buildWhatsAppMessage(data, lang), '_blank', 'noopener');
            form.reset();
        });
    });
}

function initReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (elements.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    elements.forEach((el) => observer.observe(el));
}

function markActiveNav() {
    const file = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.desktop-nav a, .mobile-drawer a').forEach((link) => {
        const href = link.getAttribute('href');
        if (href === file) {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    updateLocalizedText(getCurrentLanguage());
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) langBtn.addEventListener('click', toggleLanguage);
    initMobileDrawer();
    initBeforeAfterSliders();
    initFaq();
    initReveal();
    initBookingForms();
    const svcMatch = location.pathname.match(/service-([a-z-]+)\.html$/);
    if (svcMatch) document.querySelectorAll('a[href="contact.html"]').forEach((a) => { a.href = 'contact.html?service=' + svcMatch[1]; });
    markActiveNav();
    await loadReviews();
    window.addEventListener('langchange', loadReviews);
    setInterval(loadReviews, 30 * 60 * 1000);

    const year = document.getElementById('yearNow');
    if (year) year.textContent = String(new Date().getFullYear());
});
