# SSCY Site Launch Checklist

Running checklist of everything needed to make the new site work live.
Updated as work progresses.

---

## Recent Progress (2026-04-21)

- Moved off `pietsuess/clients` → own repo `SaltSpringCentre/website` (private) with SSCY Cloudflare account
- Site deployed via GitHub Pages at `saltspringcentre.github.io/website/`
- Full blog migration: 680 WordPress posts exported from Flywheel → converted to local markdown under `posts/` (330MB after image dedupe + compression)
- **3 Cloudflare Workers live** in SSCY's CF account (subdomain `executive-2ef.workers.dev`):
  - `sscy-retreat-guru` — API proxy, wired into offerings/calendar/event pages (bug fix today: unwraps single-program array response)
  - `sscy-mailchimp-sync` — Mailchimp Send webhook → auto-commits newsletter markdown to `posts/`. Also `/subscribe` endpoint for footer signup form with double opt-in + auto-populated required merge fields.
  - `sscy-acuity` — deployed but blocked at Acuity API level (Powerhouse plan required). Site falls back to iframe embed with slug `5618a029`.
- Footer subscribe form wired on all 30 pages → worker → Mailchimp, live + tested
- Listen bar: copy honest about Spotify login requirement, content centered, mobile X dismiss removed
- Shop: emoji icons stripped, always-visible product preview images, taller 3-col cards

---

## 0. Data Source Migration (hardcoded → live)

**The big picture:** Most site content is hardcoded in `events-data.js` as a
placeholder. As SSCY's third-party accounts come online, each category
migrates to its live API source.

| Data | Current source | Target source | Status |
|---|---|---|---|
| Retreat Guru programs | Retreat Guru API (via `sscy-retreat-guru` worker) | same | ✓ Live |
| Retreats (extra placeholders) | `events-data.js` EVENTS (7 descriptions) | Retreat Guru API only | Partial |
| Weekly yoga classes (9) | `events-data.js` CLASSES_DATA | Acuity API via `sscy-acuity` worker | Plan-blocked at Acuity |
| Wellness treatments (10) | `events-data.js` TREATMENTS_DATA | Acuity API via `sscy-acuity` worker | Plan-blocked at Acuity |
| Community gatherings (4) | `events-data.js` COMMUNITY_DATA | Google Calendar via Apps Script | Code ready, needs deploy |
| Music for Peace concerts | `events-data.js` EVENTS | Square Online (tickets) | Hardcoded |
| Blog posts | `posts/*.md` + `posts/index.json` | same | ✓ Live (WP → markdown complete) |
| Newsletter archive | Mailchimp Send webhook → `posts/` | same | ✓ Live |
| Shop products | `shop.html` PRODUCTS array | Custom storefront + Square Web Payments (Path 1) | Blocked on Square credentials |
| Community calendar overlays | Google Calendar embed | same | ✓ Live |
| Community dashboard (9 tabs) | Google Sheets via Apps Script | same | ✓ Live |

### Migration tasks

**Retreats → Retreat Guru** (unblocked, waiting on SSCY)
- [ ] SSCY adds year-round program templates to Retreat Guru (Yoga & Wellness Weekends, Breath as Gateway, Ayurveda & Yoga I Want More, Yoga Intensive, Going Deeper Silent, Annual Community Retreat, Personal Retreats)
- [ ] Once live in RG API, delete the 7 placeholder retreat entries from `events-data.js`
- [ ] Verify offerings.html and calendar widget still show them
- [ ] Delete hardcoded retreat cards from offerings.html

**Classes + Treatments → Acuity** (BLOCKED: API requires Acuity's Powerhouse plan)
- [ ] SSCY upgrades Acuity plan to Powerhouse OR accepts hardcoded CLASSES_DATA / TREATMENTS_DATA permanently
- [ ] If upgraded: wire `sscy-acuity` worker live (already deployed), replace hardcoded arrays

**Community gatherings → Google Calendar** (code ready, needs deployment)
- [x] Apps Script written: `community-events-api.gs`
- [x] events-data.js wired to fetch from Apps Script on page load and replace hardcoded COMMUNITY_DATA (falls back silently if fetch fails)
- [ ] SSCY creates recurring events in the community Google Calendar (`c_t567jg3h1u3hgj7fii50ie8k6k@group.calendar.google.com`):
  - Sunday Satsang — every Sunday, 2:00–3:30 PM, Satsang Room
  - Vancouver Satsang — every Wednesday, 6:30–8:00 PM, online Zoom
  - Kirtan — every Wednesday, 7:00–8:30 PM (paused for summer), Satsang Room
  - Daily Arati — every day, 6:45–7:15 AM, The Temples
- [ ] Deploy `community-events-api.gs` as Apps Script web app:
  - script.google.com → New project (or add to existing SSCY project)
  - Paste `community-events-api.gs`
  - Deploy → New deployment → Web app → Execute as: Me, Access: Anyone
  - Copy deployment URL
- [ ] Replace `COMMUNITY_EVENTS_API_PLACEHOLDER` in `events-data.js` with the Apps Script URL
- [ ] Delete the 4 hardcoded COMMUNITY_DATA entries (overridden at runtime; deleting just reduces fallback)

**Shop → Custom SSCY Storefront + Square Web Payments** (Path 1, BLOCKED on Square credentials)
- [ ] Piet grabs Square Sandbox credentials from developer.squareup.com: Application ID, Access Token, Location ID
- [ ] Build new Cloudflare Worker `sscy-square` with secrets for Access Token + Location + App ID, endpoints `/create-order` + `/create-payment`
- [ ] Add Square Web Payments SDK + checkout flow to `shop.html`: visible cart icon, cart drawer with checkout, customer info form, embedded card form, confirmation
- [ ] Populate real products in `PRODUCTS` array (or pull from Square Catalog API)
- [ ] Test with Square Sandbox test card numbers
- [ ] Switch to Production credentials + deploy
- [ ] Remove the temporary "Shop opening soon" note

---

## 1. Cloudflare Migration

**Status: SSCY has own Cloudflare account (workers deployed at `executive-2ef.workers.dev`). DNS cutover of `saltspringcentre.com` from Jeff's CF pending.**

- [x] Create new Cloudflare account with SSCY email
- [ ] Add `saltspringcentre.com` as a site in SSCY's Cloudflare
- [ ] Copy the two new nameservers Cloudflare provides
- [ ] At GoDaddy: update nameservers (currently pointed at Jeff's Cloudflare)
- [ ] Recreate DNS records in SSCY's Cloudflare account:
  - [ ] MX records for email (Google Workspace — critical, verify before switchover):
    ```
    MX  @  1   aspmx.l.google.com
    MX  @  5   alt1.aspmx.l.google.com
    MX  @  5   alt2.aspmx.l.google.com
    MX  @  10  alt3.aspmx.l.google.com
    MX  @  10  alt4.aspmx.l.google.com
    ```
  - [ ] SPF records (both Google and Sendinblue/Brevo):
    ```
    TXT  @  "v=spf1 include:_spf.google.com ~all"
    TXT  @  "v=spf1 include:spf.sendinblue.com mx ~all"
    TXT  @  "Sendinblue-code:4516c6461275861f21dea0ce807b6f1c"
    ```
  - [ ] DKIM + DMARC records (copy from Jeff's CF)
  - [ ] Existing subdomains (shop., blog., etc. as they get set up)
- [ ] Point `saltspringcentre.com` at GitHub Pages:
  - CNAME `www` → `saltspringcentre.github.io`
  - A records for apex → GitHub Pages IPs (185.199.108.153 etc.)
- [ ] Also handle `saltspringcenter.com` (American spelling, typo-protect — expired, needs renewal at GoDaddy then transfer to SSCY's Cloudflare, redirect to .ca)
- [ ] Enable "Always Use HTTPS"
- [ ] SSL mode: Full (strict)

---

## 2. Cloudflare Workers

### 2a. Retreat Guru API Proxy (✓ LIVE)
- [x] Worker deployed: `sscy-retreat-guru.executive-2ef.workers.dev`
- [x] Secret `RETREAT_GURU_TOKEN` set
- [x] Wired into offerings.html, calendar.html, event.html, m/event.html
- [x] Bug fix 2026-04-21: unwraps single-program array response (Retreat Guru returns `[{...}]` even for single-ID lookups)

### 2b. Mailchimp Sync + Subscribe (✓ LIVE)
- [x] Worker deployed: `sscy-mailchimp-sync.executive-2ef.workers.dev`
- [x] Secrets: `MAILCHIMP_API_KEY`, `MAILCHIMP_DC`, `MAILCHIMP_LIST_ID`, `GITHUB_TOKEN`, `GITHUB_REPO`
- [x] Mailchimp webhook on Send event → auto-commits newsletter markdown to `posts/`
- [x] `/subscribe` endpoint with double opt-in + auto-populated required merge fields
- [x] Footer form wired on all 30 pages

### 2c. Acuity API Proxy (DEPLOYED, plan-blocked)
- [x] Worker deployed: `sscy-acuity.executive-2ef.workers.dev`
- [ ] BLOCKED: Acuity API access requires Powerhouse plan. Site currently falls back to iframe embeds with slug `5618a029`.

### 2d. Square Web Payments Worker (PLAN 1 — to be built)
- [ ] Register a Square Developer application
- [ ] Add secrets: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_APP_ID`, `SQUARE_ENV` (sandbox/production)
- [ ] Build `sscy-square` worker with `/create-order` + `/create-payment` endpoints
- [ ] Integrate Square Web Payments SDK in `shop.html`
- [ ] Future: extend to `donate.html` for on-site donation flow

---

## 3. Blog Migration (✓ DONE — WordPress → local markdown)

- [x] Exported 680 published posts from Flywheel WordPress
- [x] Converted to markdown with frontmatter, stored in `posts/*.md`
- [x] 2925 image URLs → deduped to 2504 → compressed (1200px max, JPEG q82) → flattened PNGs to JPEG → final ~330 MB in `images/`
- [x] Originals (1.7 GB) archived at `My Drive/SSCY/Blog/images-original/`
- [x] `posts/index.json` is single source of truth for blog viewer
- [x] `blog.html` + `post.html` (desktop + mobile) rewritten to read from markdown
- [x] Mailchimp webhook worker auto-appends new newsletters to `posts/` + `index.json`
- [x] `.nojekyll` at repo root so GitHub Pages serves raw `.md` files

---

## 4. Square Payment Setup

### Done
- [x] Donation link with custom amount: `square.link/u/Oa6tCVaL` (wired into all donate buttons)

### To Do
- [ ] Path 1 custom storefront (see section 0 "Shop" migration)
- [ ] Music for Peace concert ticket links (4 active concerts in `events-data.js`)
- [ ] Optional: separate recurring/monthly donation link
- [ ] Optional: dedicated School Roof donation link

---

## 5. Acuity Scheduling Setup

**Status: Account exists, worker deployed, BLOCKED at Acuity plan level.**

Current workaround: site uses Acuity iframe embeds with slug `5618a029` for class/treatment booking (works, no API access required).

- [ ] Decide: upgrade to Powerhouse plan for API access (enables rich in-site rendering) OR keep iframe embeds permanently
- If upgrading:
  - [ ] Note API credentials (already in worker secrets)
  - [ ] Swap `CLASSES_DATA` and `TREATMENTS_DATA` in `events-data.js` for worker fetches
  - [ ] Remove duplicated CLASSES arrays from `calendar.html` and `m/calendar.html`

---

## 6. Contact Form

Current state: `contact.html` uses `mailto:info@saltspringcentre.com` only.

- [ ] Decide: Google Forms embed OR Cloudflare Worker + email relay
- [ ] If Worker: set up Cloudflare Turnstile for spam protection
- [ ] If Google Form: create form, embed iframe in contact.html
- [ ] Test submission end-to-end

---

## 7. Content & Credentials from SSCY

- [ ] **Square Developer credentials** (for Path 1 storefront — currently the main blocker)
- [ ] **Acuity plan decision** (upgrade to Powerhouse, or accept iframe fallback)
- [ ] **Real shop product list with prices**
- [ ] **Additional images** needed — these 404'd on WP, currently substituted:
  - `2021/10/centre-garden-path.jpg`
  - `2021/10/study-group.jpg`
  - `2021/10/temple-ceremony.jpg`
  - `2021/10/yoga-class-outdoor-2.jpg`
  - `2022/05/centre-grounds.jpg`
  - `2022/05/music-satsang-room.jpg`
  - `2024/03/yoga-intensive-group.jpg`
  - `2025/01/yssi-group.jpg`

---

## 8. Pre-Launch Testing

Before switching DNS, run through:

- [ ] Every page loads without console errors (desktop + mobile)
- [ ] Every navigation link works
- [ ] Every donation button opens Square payment link
- [ ] Every class/treatment "Book" button opens Acuity iframe
- [ ] Retreat Guru programs load on offerings.html and calendar.html
- [ ] Individual event detail pages render correctly:
  - [ ] Retreats (event.html?id=spring-cleanse, etc.)
  - [ ] Classes (event.html?id=class-hatha-dorothy, etc.)
  - [ ] Community (event.html?id=community-sunday-satsang, etc.)
  - [ ] Treatments (event.html?id=treatment-abhyanga, etc.)
  - [ ] Retreat Guru programs (event.html?rg=20, etc.)
- [ ] Calendar month/week/day views all show events
- [ ] Blog feed loads + individual post pages render markdown
- [ ] Footer subscribe form successfully adds to Mailchimp (already tested ✓)
- [ ] Contact form submits successfully
- [ ] Images all load (no broken images)
- [ ] SSL padlock shows on every page
- [ ] Mobile site redirects correctly from desktop URLs on phones

---

## 9. DNS Cutover

Only when everything above is green:

- [ ] Final backup of current WordPress site and database
- [ ] At GoDaddy: update nameservers to SSCY's Cloudflare
- [ ] Watch DNS propagation (0–48 hours)
- [ ] Once propagated, verify:
  - [ ] saltspringcentre.com loads the new site
  - [ ] Email still works (send/receive test)
  - [ ] Workers on `executive-2ef.workers.dev` still respond
- [ ] Cancel Flywheel hosting
- [ ] Keep old WP site as read-only archive at `old.saltspringcentre.com` for ~3 months (optional)

---

## 10. Post-Launch

- [ ] Set up Google Analytics or Plausible
- [ ] Submit sitemap to Google Search Console
- [ ] Add Schema.org structured data to event pages for rich search results
- [ ] Set up uptime monitoring (UptimeRobot free tier)
- [ ] Document admin workflow for SSCY staff in `admin-guide.html`

---

## Current Blockers

1. **Square Developer credentials** — blocks Path 1 custom storefront
2. **Acuity Powerhouse plan decision** — blocks rich class/treatment rendering (iframe fallback works in the meantime)
3. **GoDaddy access** for nameserver cutover
4. **SSCY content**: real shop products, missing substituted images

---

*Last updated: 2026-04-21*
