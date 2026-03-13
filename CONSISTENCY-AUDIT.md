# Consistency Audit — HTML Pages

Audited: 2026-03-12
Scope: All 26 HTML files (excluding `node_modules/`)

---

## Reference Pattern (canonical standard)

The majority of public pages follow this pattern:

```
<head>
  charset UTF-8 → viewport → title → description → og:* (6 tags) → twitter:* (4 tags)
  → canonical → favicon → apple-touch-icon → Google Fonts preconnect (2) → font CSS
  → shared.css?v=20260311b → [charts.css] → [articles.css] → <style> overrides
</head>
<body>
  <div class="vignette"></div>
  <div class="ambient-orb ambient-orb-1/2/3"></div>
  <div id="site-nav"></div>
  ...content...
  <div id="site-modal"></div>
  <div id="site-footer"></div>
  <script src="/components.js?v=20260311b"></script>
  <script src="/shared.js?v=20260311b"></script>
  <script src="/ambient.js?v=20260311b"></script>
  <script src="/chat-bubble.js?v=20260311b"></script>
</body>
```

---

## 1. Cache-Bust Version String Drift

| Version       | Pages |
|---------------|-------|
| `v=20260311b` | services, why-now, build landing, privacy, 404, 12 build articles |
| `v=20260311d` | **index.html (homepage)** |
| `v=20260311a` | **brand-in-a-session, dispatch-dashboard, from-comment-to-fix, how-we-built-briu, multi-agent-dispatch, security-methodology, six-layers-deep, the-morning-briefing, voice-profile, we-tried-to-break-our-own-sanitizer, what-a-real-session-actually-costs** (JS files only) |
| `v=20260312a` | **build/cost-arbitrage**, **build/how-we-red-teamed-our-own-agent** |
| `v=20260312`  | **services/calculator** |
| *(none)*      | **chart-preview.html** (no version string at all) |

**Impact:** After a CSS or JS update, stale versions serve old assets. Should be unified.

---

## 2. Nav / Footer / Modal Slot IDs

| Pattern | Pages |
|---------|-------|
| `id="site-nav"`, `id="site-footer"`, `id="site-modal"` | homepage, services, why-now, build, privacy, 404, all 14 build articles |
| `id="nav-slot"`, `id="footer-slot"`, `id="modal-slot"` | **services/calculator** |
| *(none — no nav/footer/modal)* | **chart-preview.html**, **admin** |

**Impact:** If `components.js` only targets one set of IDs, the calculator page will not render the shared nav, footer, or contact modal. Needs ID normalization.

---

## 3. Missing Meta Tags

| Page | canonical | og:* | twitter:* | description |
|------|-----------|------|-----------|-------------|
| **404.html** | Missing | Missing | Missing | Missing |
| **chart-preview.html** | Missing | Missing | Missing | Missing |
| **admin/index.html** | Missing | Missing | Missing | Missing |

All three have `noindex`/`nofollow`, so this is acceptable. Low priority.

---

## 4. Script Loading Differences

### Homepage (`index.html`)
```
components.js → shared.js → ambient.js → chat-bubble.js → interactive.js → dynamic-stats.js → charts.js
```

### Services (`services/index.html`)
```
components.js → shared.js → ambient.js → chat-bubble.js → dynamic-stats.js → charts.js
```
Missing: `interactive.js`

### Why Now (`why-now/index.html`)
```
[Chart.js CDN in <head>]
components.js → shared.js → ambient.js → chat-bubble.js → dynamic-stats.js → interactive.js → charts.js
```
Only public page loading external JS dependency in `<head>`.

### Build landing (`build/index.html`)
```
components.js → shared.js → ambient.js → chat-bubble.js → charts.js → ... → dynamic-stats.js
```
Note: `dynamic-stats.js` loaded AFTER `charts.js` (reversed from other pages).

### Build articles (14 files)
```
components.js → shared.js → ambient.js → chat-bubble.js [→ dynamic-stats.js in some articles]
```
No `charts.js`, no `interactive.js` (correct for articles).

### Privacy
```
components.js → shared.js → ambient.js → chat-bubble.js
```
Minimal and correct.

### 404
```
components.js → shared.js → ambient.js
```
No `chat-bubble.js` (intentional for error page).

### Services Calculator
```
components.js → chat-bubble.js (defer)
```
**Missing: `shared.js`, `ambient.js`.** Uses `defer` on chat-bubble (only page that does). May cause missing scroll-reveal or shared behaviors.

### Chart Preview
```
[Chart.js CDN in <head>]
charts.js (no version string)
```
Standalone dev tool. No components, shared, ambient, or chat-bubble.

### Admin
```
Inline <script> only — no external JS files
```
Standalone internal tool. Expected.

---

## 5. Ambient Visual Elements

| Element | Missing from |
|---------|-------------|
| `div.vignette` | **404**, admin, calculator |
| `div.ambient-orb` (x3) | **404**, chart-preview, admin, calculator |

Present on all other public pages and build articles.

---

## 6. Skip Link (`<a class="skip-link">`)

Only present on **services/calculator/index.html**. Missing from all other 25 pages.

---

## 7. CSS Imports

| CSS File | Pages |
|----------|-------|
| `shared.css` | All pages except admin |
| `charts.css` | homepage, services, why-now, build landing, chart-preview |
| `articles.css` | All 14 build articles |

Correct — each page loads only what it needs.

---

## 8. Footer/Modal Ordering

| Order | Pages |
|-------|-------|
| `site-modal` then `site-footer` | homepage, services, why-now, build landing, all 14 articles |
| `site-footer` then `site-modal` | **privacy** (reversed) |
| `footer-slot` then `modal-slot` | calculator |

Probably harmless since both are injected by JS, but inconsistent.

---

## 9. Build Article Eyebrow Categories

All build articles use `<p class="hero-eyebrow">Build</p>` except:
- **we-tried-to-break-our-own-sanitizer**: uses `"Agent"`

May be intentional (article categorization), but worth confirming.

---

## 10. Head Pattern Anomaly

`build/cost-arbitrage/index.html` includes `<meta name="color-scheme">` at line 6. No other page has this. Minor but unique.

---

## Summary of Deviations to Fix

### High Priority
1. **Version string drift** — unify all cache-bust strings to a single value across all pages
2. **Calculator uses wrong slot IDs** (`nav-slot`/`footer-slot`/`modal-slot` vs `site-nav`/`site-footer`/`site-modal`) — nav/footer/modal won't render
3. **Calculator missing `shared.js` and `ambient.js`** — breaks scroll-reveal and shared behaviors

### Medium Priority
4. **Privacy page has reversed footer/modal order** — normalize to `site-modal` then `site-footer`
5. **Build landing loads `dynamic-stats.js` after `charts.js`** — inconsistent order vs other pages
6. **Calculator is only page using `defer` on `chat-bubble.js`**
7. **11 build articles use JS version `v=20260311a`** while their CSS uses `v=20260311b` — mixed versions

### Low Priority (Acceptable)
8. **Skip link only on calculator** — should ideally be on all pages for a11y
9. **404 missing vignette/orbs/chat-bubble** — acceptable for error page
10. **Chart-preview no version strings, standalone** — dev tool, noindex
11. **Admin completely standalone** — internal tool, noindex
12. **Redirect stubs (3 pages)** — minimal, no shared shell needed
