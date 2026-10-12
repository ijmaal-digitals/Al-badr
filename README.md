# Al Badr Elite Dental - Website + Booking System

Static bilingual (AR/EN) site plus a zero-dependency Node.js (18+) backend for online booking.

## Run

```
copy .env.example .env     # fill what you have; blanks run in MOCK mode
npm start                  # http://localhost:3000
npm test                   # end-to-end smoke test (mock mode)
```

Mock mode: payments use a "simulate payment" button, and WhatsApp/SMS/Email/Google Calendar are logged to `data/outbox.log` instead of sent.

## What it does

| Feature | How |
|---|---|
| Doctor-wise calendar | Patient picks doctor; each doctor has own hours and services (`server/lib/config.js`) |
| Service-wise duration | Per-service minutes (30-90) set the slot length automatically |
| Real-time availability | 30-min grid, no overlaps, 2h lead time, 60-day horizon, 10-min unpaid hold, live Google Calendar busy times |
| Deposit 100-200 SAR | Moyasar (mada, Visa/Mastercard, Apple Pay). Server verifies the payment amount before confirming |
| Google Calendar sync | Event created/updated/deleted in each doctor's calendar |
| Confirmation | WhatsApp + SMS + Email, includes manage link |
| Reminders | 24h WhatsApp, 2h SMS (scheduler runs every minute, sent once each) |
| Reschedule/Cancel | `manage.html?t=<token>`; allowed until 4h before; deposit refunded automatically if cancelled 24h+ before |

## Going live (what you must provide)

1. **Moyasar**: `MOYASAR_PUBLISHABLE_KEY`, `MOYASAR_SECRET_KEY`. Apple Pay needs HTTPS on your domain and domain verification in the Moyasar dashboard. For bank transfer, enable it in Moyasar or reconcile manually.
2. **Google Calendar**: create a service account, enable the Calendar API, share each doctor's calendar with the service account email ("Make changes to events"), set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (keep `\n` escapes) and `CAL_*` IDs.
3. **WhatsApp**: Meta Cloud API token + phone ID. Create two approved templates (`booking_confirmation`, `booking_reminder_24h`) in Arabic and English, each with 6 body variables: name, service, doctor, date, time, manage link.
4. **SMS**: Twilio SID/token/from (or swap in a Saudi provider in `server/lib/notify.js`).
5. **Email**: Resend API key and a verified sender domain.
6. **Google Reviews**: `GOOGLE_PLACES_KEY` + `GOOGLE_PLACE_ID` for `/api/google-reviews`.
7. Set `PUBLIC_URL` to your HTTPS domain, change `ADMIN_TOKEN`, and run behind a reverse proxy (Nginx/Caddy) with HTTPS.

Bookings are stored in `data/bookings.json`, admin changes (services, schedules, closures) in `data/settings.json`, and newsletter subscribers in `data/subscribers.json`; back up `data/`, or replace `server/lib/store.js` with a database for scale.

## Admin dashboard

Open `/admin.html` and sign in with `ADMIN_TOKEN` (set a long random value; 10 wrong attempts per 10 minutes locks the IP out). Arabic/English.

| Tab | What it does |
|---|---|
| Today's bookings | Day view with date navigation; mark Attended / No-show (after the start time), undo, or cancel (refunds the deposit and notifies the patient) |
| Doctor schedules | Per doctor: working hours per weekday (multiple ranges), days off, daily break times, services offered, show/hide for booking |
| Services & prices | Add/edit names, duration (30-min steps), price, deposit (max 200 SAR), active flag |
| Holidays & closures | Clinic-wide or per-doctor date ranges; lists confirmed appointments that clash so you can move them |
| Reports | Daily / weekly (Saturday start) / monthly, by doctor and service, no-show rate, deposits; Excel export |
| No-shows | Patients with no-shows; flagged at 2 or more |
| Patients | Searchable database with contact info and visit history; Excel export |

Changes apply to the public booking page immediately. A no-show mark stops the review-request message. Excel files (`.xlsx`) are generated without extra dependencies. The `ADMIN_TOKEN` is kept in the browser tab's session storage; always serve `/admin.html` over HTTPS and consider restricting it by IP at the reverse proxy.


## Marketing & SEO
- **Local SEO**: every page gets a Arabic title/description, canonical URL, Open Graph/Twitter tags and JSON-LD injected by the server (`server/lib/seo.js`). The home page has a "Dentist in الشرائع, Makkah" block with name/address/phone, hours, directions, call, review buttons and a Google Map. The same details are on the contact page.
- **Schema**: `Dentist`/`MedicalBusiness` (address, hours, `hasMap`, `sameAs`, services/prices, reserve action, geo when coordinates are set), `WebSite`, `BreadcrumbList`, `MedicalProcedure` + `FAQPage` on service pages, `Physician` on the doctors page, `BlogPosting` on articles. `aggregateRating` appears only when real Google reviews are connected - ratings are never invented.
- **Blog CMS**: Admin > Blog. Bilingual articles (Markdown-lite), draft / published / scheduled, served at `/blog/<slug>` and listed in the sitemap. Three starter articles are seeded; review them before launch.
- **Sitemap / robots**: `/sitemap.xml` and `/robots.txt` are generated dynamically (admin, manage and API paths are excluded).
- **Settings**: Admin > Marketing & SEO edits address, coordinates, hours, Google links, social links, GA4 / Meta Pixel IDs and the consent banner.
- **Analytics**: GA4 and Meta Pixel load only after cookie consent (disable the banner in settings if you manage consent elsewhere). Events: booking started, booking confirmed (`generate_lead` / `Lead` + `Schedule`), deposit paid (`purchase` / `Purchase`), newsletter signup, phone/WhatsApp/directions clicks, service page views. First-touch UTM / gclid / fbclid is saved on each booking and exported to Excel (Source, Medium, Campaign).
- **Instagram**: set the profile URL in settings and `INSTAGRAM_ACCESS_TOKEN` to show the latest 9 posts; without a token only a follow button is shown.

### SEO go-live checklist
1. Enter the real street, postal code and map coordinates, the real phone/WhatsApp, social links, GA4 and Pixel IDs in Admin > Marketing & SEO. Set `PUBLIC_URL` to the live domain.
2. Claim and verify the Google Business Profile with exactly the same name, address and phone as the site (NAP). Set the appointment link to `https://YOUR-DOMAIN/contact.html?utm_source=google&utm_medium=organic&utm_campaign=gbp` and the website link similarly, to see GBP bookings in your reports.
3. Put the clinic's Maps link in settings, and `GOOGLE_PLACES_KEY` + `GOOGLE_PLACE_ID` in `.env` for live reviews and the rating in schema.
4. Submit `/sitemap.xml` in Google Search Console and test pages with the Rich Results Test.
5. Replace unverified claims in the home hero (4.9 rating, 12,000 cases, 15 years) with real figures.