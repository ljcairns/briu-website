# Overnight QA Report — 2026-03-13

Reviewed all 14 pages listed for QA. 8 exist, 6 do not.

---

## Missing Pages (6 of 14)

These pages have no HTML files in the repository:

| Page | Status |
|------|--------|
| `about/` | Does not exist |
| `refer/` | Does not exist |
| `free-audit/` | Does not exist |
| `press/` | Does not exist |
| `why-now/pricing-logic/` | Does not exist |
| `build/simulator/` | Does not exist |

---

## Page-by-Page Findings

### discovery/index.html — 3 issues

1. **No components.js** — No shared nav, footer, or contact modal. Page is completely standalone with all CSS inline. No `#site-nav`, `#site-footer`, or `#site-modal` placeholders.
2. **Placeholder form endpoint** — Line ~937: form action is `https://formspree.io/f/your-form-id` (non-functional placeholder).
3. **No chat-bubble.js, shared.js, or ambient.js** — Completely disconnected from shared site infrastructure.

### agents/index.html — Clean

- components.js: Yes
- shared.css: Yes
- All links valid, no broken images, no placeholders
- Includes shared.js, ambient.js, chat-bubble.js

### prospects/live/index.html — 1 issue

1. **Broken image** — Line ~355: `<img src="/images/briu-logo.png">` — the `/images/` directory does not exist. Logo files are at `/briu-logo-transparent.png` and `/logo.png` in repo root.

- No components.js (likely intentional — standalone live demo page with `noindex`)
- Auto-refreshes every 30s + JS polls every 15s

### prospects/value-prism/index.html — Clean

- components.js: Yes
- shared.css: Yes
- All links valid, no broken images, no placeholders
- Has `noindex, nofollow` (appropriate for prospect page)

### prospects/speaking/index.html — Clean (1 minor note)

- components.js: Yes
- shared.css: Yes
- All links valid, no broken images, no placeholders
- **Minor:** Email subject line contains an em-dash character (`%E2%80%94`) which conflicts with brand voice rules against em dashes.

### build/velocity/index.html — 2 issues

1. **Nav/footer won't render** — `components.js` is loaded but the page is missing `#site-nav`, `#site-footer`, and `#site-modal` placeholder divs. Components.js has nothing to inject into.
2. **Missing shared scripts** — No `shared.js`, `ambient.js`, or `chat-bubble.js` script tags.

### build/operations/index.html — Clean

- components.js: Yes (with all placeholder divs)
- shared.css: Yes
- Data fetches (`/data/ops-data.json`, `/data/discord-activity.json`) reference files that exist
- Graceful error handling on data fetches
- Includes shared.js, ambient.js, chat-bubble.js

### industries/index.html — 1 issue

1. **Missing ambient.js** — Has ambient orb divs in DOM but does not load `ambient.js`, so orb animations won't run.

- components.js: Yes
- shared.css: Yes
- All links valid (`/discovery/?industry=...` pattern)
- Minor: `shared.js` loaded without cache-busting param unlike other pages

---

## Summary

| Severity | Count | Description |
|----------|-------|-------------|
| **Missing pages** | 6 | about, refer, free-audit, press, why-now/pricing-logic, build/simulator |
| **Broken image** | 1 | prospects/live — `/images/briu-logo.png` does not exist |
| **Placeholder URL** | 1 | discovery — formspree form action never replaced |
| **Nav/footer broken** | 2 | discovery (no components.js), build/velocity (missing placeholder divs) |
| **Missing ambient.js** | 1 | industries page |
| **Clean pages** | 4 | agents, prospects/value-prism, prospects/speaking, build/operations |
