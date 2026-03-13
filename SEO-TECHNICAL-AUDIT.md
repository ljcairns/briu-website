# Technical SEO Audit — briu.ai

**Date:** 2026-03-12
**Auditor:** Automated (Claude Code)
**Scope:** Full technical SEO audit of the briu-website repository

---

## Executive Summary

The site has strong SEO fundamentals: canonical tags on all public pages, proper viewport meta, JSON-LD on most content pages, and well-structured robots.txt. The main issues are **render-blocking scripts on every page**, an **incomplete sitemap** (14 of 26 indexable pages), **5 orphaned build articles** with no incoming links, and **oversized assets** (494K logo.png, no WebP images). Fixing the sitemap and script loading are the highest-priority items.

---

## 1. robots.txt

**Status: PASS**

```
User-agent: *
Allow: /
Sitemap: https://briu.ai/sitemap.xml
```

- Allows all crawlers
- Correctly references sitemap
- No sensitive paths exposed (admin pages blocked via `noindex` meta instead, which is acceptable)

---

## 2. Sitemap (sitemap.xml)

**Status: FAIL — Incomplete**

**Currently listed (14 URLs):**

| URL | Priority | Last Modified |
|-----|----------|---------------|
| `/` | 1.0 | 2026-03-08 |
| `/services/` | 0.9 | 2026-03-08 |
| `/why-now/` | 0.8 | 2026-03-08 |
| `/build/` | 0.8 | 2026-03-08 |
| `/build/brand-in-a-session/` | 0.7 | 2026-03-08 |
| `/build/the-real-numbers/` | 0.7 | 2026-03-08 |
| `/build/how-we-built-briu-using-our-own-agent-stack/` | 0.7 | 2026-03-08 |
| `/build/from-comment-to-fix-in-one-loop/` | 0.7 | 2026-03-09 |
| `/build/six-layers-deep/` | 0.7 | 2026-03-09 |
| `/build/we-tried-to-break-our-own-sanitizer/` | 0.7 | 2026-03-09 |
| `/build/voice-profile/` | 0.7 | 2026-03-09 |
| `/build/the-morning-briefing/` | 0.7 | 2026-03-10 |
| `/discovery/` | 0.7 | 2026-03-12 |
| `/privacy/` | 0.3 | 2026-03-08 |

**Missing from sitemap (12 indexable pages):**

| URL | Notes |
|-----|-------|
| `/build/velocity/` | Recent article, orphaned |
| `/build/operations/` | Recent article, orphaned |
| `/build/dispatch-dashboard/` | Orphaned |
| `/build/multi-agent-dispatch/` | Orphaned |
| `/build/security-methodology/` | Linked from /build/ |
| `/build/cost-arbitrage/` | Linked from /build/ |
| `/build/what-a-real-session-actually-costs/` | Linked from /build/ |
| `/build/how-we-red-teamed-our-own-agent/` | Linked from /build/ |
| `/services/calculator/` | Orphaned |

**Correctly excluded (noindex pages):**
- `/admin/`, `/admin/crm/` — noindex, nofollow
- `/prospects/speaking/`, `/prospects/value-prism/` — noindex, nofollow
- `/chart-preview.html` — noindex
- `/404.html` — noindex
- Redirect pages (`/insights/`, `/insights/manifesto/`, `/why-now-economics/`)

---

## 3. Canonical Tags

**Status: PASS**

- **28 of 28 public pages** have correct `<link rel="canonical">` tags
- All point to `https://briu.ai/...` (correct domain, trailing slashes consistent)
- Redirect pages correctly canonicalize to their target (`/why-now/`)
- 5 noindex pages (admin, 404, chart-preview, prospects) omit canonical — acceptable

---

## 4. Page Speed & Asset Analysis

### Asset Sizes

**JavaScript (6 root files loaded on most pages):**

| File | Size | Deferred? |
|------|------|-----------|
| `charts.js` | 57K | NO — render-blocking |
| `chat-bubble.js` | 49K | NO — render-blocking |
| `interactive.js` | 49K | NO — render-blocking |
| `shared.js` | 18K | NO — render-blocking |
| `dynamic-stats.js` | 8.1K | NO — render-blocking |
| `ambient.js` | 5.3K | NO — render-blocking |
| `components.js` | 4.2K | NO — render-blocking |
| **Total** | **~191K** | |

**CSS (render-blocking by nature, acceptable):**

| File | Size |
|------|------|
| `shared.css` | 23K |
| `charts.css` | 36K |
| `articles.css` | 3.1K |
| **Total** | **~62K** |

**Images:**

| File | Size | Notes |
|------|------|-------|
| `logo.png` | 494K | Excessively large, used nowhere visible (nav uses briu-logo-transparent.png) |
| `briu-logo-transparent.png` | 47K | Nav logo |
| `og-image.png` | 67K | Social sharing, appropriate size |
| `favicon.png` | 41K | Could be optimized |
| `mj-phase-1.jpg` through `mj-phase-7.jpg` | 97–147K each (876K total) | Brand article images, no WebP |

### Render-Blocking Resources

**Critical issue:** All 7 JS files are loaded synchronously (`<script src="...">` without `defer` or `async`) on 26 of 33 pages. The homepage loads all 7 scripts in the `<head>`, blocking first paint.

**External resources:**
- Google Fonts (DM Serif Display + DM Sans) — loaded via `<link>` with preconnect, acceptable
- Chart.js from jsdelivr CDN — loaded on 5 pages, inconsistent versions (4.4.1 vs 4.4.7), sometimes deferred, sometimes not

### Estimated Core Web Vitals Impact

| Metric | Estimated Impact | Cause |
|--------|-----------------|-------|
| **LCP** | Moderate risk | 191K render-blocking JS delays first paint; hero text can't render until scripts parse |
| **CLS** | Low risk | Nav/footer injected via JS (components.js) could cause layout shift if slow |
| **INP** | Low risk | No heavy event handlers detected; charts use IntersectionObserver (good) |

---

## 5. Mobile Usability

**Status: PASS**

- All 33 HTML files include `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Responsive nav with hamburger toggle (components.js)
- CSS uses responsive patterns (grid layouts, media queries in shared.css)
- Touch-friendly chat bubble (44px target)
- Font sizes appear adequate (no `font-size` smaller than readable)

---

## 6. Structured Data / Schema Markup

**Status: PARTIAL**

### Homepage (index.html)
- **FAQPage** schema — 6 questions, properly structured
- **Organization** schema — name, url, logo, email, description, founder

### Build Articles (14 of 16)
- **Article** schema — headline, author, datePublished, publisher
- **BreadcrumbList** schema — Home > Build > Article Name

### Missing Structured Data

| Page | Missing Schema | Recommended |
|------|---------------|-------------|
| `/services/` | Has schema | OK |
| `/build/velocity/` | No JSON-LD | Article + BreadcrumbList |
| `/build/operations/` | No JSON-LD | Article + BreadcrumbList |
| `/discovery/` | No JSON-LD | WebPage |
| `/services/calculator/` | No JSON-LD | WebPage |

### Schema Recommendations
- **Service** schema on `/services/` — would improve rich snippets for service offerings
- **BreadcrumbList** on all section pages (services, why-now, build landing)
- **ProfessionalService** or **LocalBusiness** not recommended (Briu is remote/digital, not local)

---

## 7. Internal Link Structure & Orphan Pages

**Status: NEEDS ATTENTION — 5 orphaned pages**

### Site Link Graph (simplified)

```
Homepage
├── /why-now/
├── /build/
│   ├── /build/the-real-numbers/
│   ├── /build/brand-in-a-session/
│   ├── /build/how-we-built-briu-using-our-own-agent-stack/
│   ├── /build/from-comment-to-fix-in-one-loop/
│   ├── /build/six-layers-deep/ ↔ /build/security-methodology/
│   ├── /build/we-tried-to-break-our-own-sanitizer/
│   ├── /build/voice-profile/
│   ├── /build/the-morning-briefing/
│   ├── /build/cost-arbitrage/ → /build/how-we-red-teamed-our-own-agent/
│   ├── /build/what-a-real-session-actually-costs/
│   └── /build/how-we-red-teamed-our-own-agent/
├── /services/
│   └── (no link to /services/calculator/)
├── /privacy/
└── /discovery/ (only linked from /prospects/value-prism/)
```

### Orphaned Pages (no incoming internal links)

| Page | In Sitemap? | Has Canonical? | Action Needed |
|------|-------------|----------------|---------------|
| `/build/velocity/` | No | Yes | Add to /build/ article grid + sitemap |
| `/build/operations/` | No | Yes | Add to /build/ article grid + sitemap |
| `/build/dispatch-dashboard/` | No | Yes | Add to /build/ article grid + sitemap |
| `/build/multi-agent-dispatch/` | No | Yes | Add to /build/ article grid + sitemap |
| `/services/calculator/` | No | Yes | Link from /services/ + add to sitemap |

---

## 8. Heading Hierarchy

**Status: MOSTLY PASS — 1 issue**

- **26 pages** have exactly 1 `<h1>` with proper H1 → H2 → H3 → H4 progression
- **3 redirect pages** have no H1 (acceptable — they immediately redirect)
- **Admin/preview pages** have proper hierarchy

### Issue Found

**`/services/calculator/index.html`** — heading hierarchy violation:
- H1 → H3 (skips H2) → H2 → H3 → H4
- Fix: change the first `<h3>` to `<h2>`

---

## 9. Image Alt Tags

**Status: PASS**

- Only 9 `<img>` tags across the entire site (most visuals are CSS/SVG/Canvas)
- All 9 images have descriptive `alt` attributes:
  - 7 brand phase images: "Phase 1: Wide Open", "Phase 2: Narrowing", etc.
  - 2 logo images: "Briu logo", "Briu"
- No empty or missing alt attributes found

---

## 10. Meta Descriptions

**Status: PASS — 1 minor gap**

- **31 of 32 pages** have `<meta name="description">` tags
- Missing: `/admin/crm/index.html` (noindex page, low priority)
- Descriptions are unique and appropriately sized across all public pages

---

## 11. Additional Findings

### OG / Social Tags
- All public pages have `og:title`, `og:description`, `og:type`, `og:url`, `og:image`
- Twitter Card (`summary_large_image`) present on all public pages
- OG image: 2000x1200px, appropriate for social sharing

### Cache Busting
- All CSS/JS files use `?v=20260312a` query parameter — good practice
- Consistent across all pages

### CDN Version Inconsistency
- Chart.js loaded as 4.4.1 on 3 pages, 4.4.7 on 2 pages — should standardize

### favicon.png
- 41K is large for a favicon; consider generating proper `.ico` or using a 32x32 PNG
- Same file used for `apple-touch-icon` — should be separate (180x180 for Apple)

### No `<html lang>` Audit
- Should verify all pages have `<html lang="en">` (not checked in detail)

---

## Prioritized Fix List

### P0 — Critical (do first)

1. **Add `defer` to all script tags** — 191K of render-blocking JS on every page. Add `defer` to `charts.js`, `chat-bubble.js`, `interactive.js`, `shared.js`, `dynamic-stats.js`, `ambient.js`. Keep `components.js` non-deferred only if nav must render before DOMContentLoaded.

2. **Complete the sitemap** — Add all 9 missing indexable URLs (`/build/velocity/`, `/build/operations/`, `/build/dispatch-dashboard/`, `/build/multi-agent-dispatch/`, `/build/security-methodology/`, `/build/cost-arbitrage/`, `/build/what-a-real-session-actually-costs/`, `/build/how-we-red-teamed-our-own-agent/`, `/services/calculator/`).

### P1 — High (this week)

3. **Fix orphaned pages** — Add links to `/build/velocity/`, `/build/operations/`, `/build/dispatch-dashboard/`, `/build/multi-agent-dispatch/` from the `/build/index.html` article grid. Link `/services/calculator/` from `/services/`.

4. **Add JSON-LD to `/build/velocity/` and `/build/operations/`** — These are the two newest articles and lack Article + BreadcrumbList schemas.

5. **Optimize `logo.png`** — 494K file appears unused (nav uses `briu-logo-transparent.png`). Either delete it or compress it. If it's the source for `og-image.png`, keep it out of the web root.

### P2 — Medium (this sprint)

6. **Standardize Chart.js version** — Use 4.4.7 consistently and add `defer` on all instances.

7. **Convert images to WebP** — The 7 brand article JPGs (876K total) and logo PNGs would benefit from WebP with `<picture>` fallback.

8. **Fix heading hierarchy** — `/services/calculator/index.html` skips from H1 to H3.

9. **Optimize favicon** — Generate a proper 32x32 `.ico` and a separate 180x180 `apple-touch-icon.png`.

### P3 — Low (backlog)

10. **Add BreadcrumbList schema** to section landing pages (`/services/`, `/why-now/`, `/build/`).

11. **Add Service schema** to `/services/` for rich snippet eligibility.

12. **Add `lang="en"`** to `<html>` tag on any pages missing it.

13. **Add meta description** to `/admin/crm/index.html` (noindex page, cosmetic only).

14. **Consider `<link rel="preload">` for critical fonts** — Google Fonts are preconnected but not preloaded; preloading the WOFF2 files would eliminate the render-blocking font request.

15. **Block admin paths in robots.txt** — While meta noindex works, adding `Disallow: /admin/` and `Disallow: /prospects/` to robots.txt provides defense-in-depth.

---

## Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| robots.txt | 10/10 | Properly configured |
| Sitemap | 5/10 | 14 of 23 indexable pages listed |
| Canonical tags | 10/10 | All public pages covered |
| Page speed | 4/10 | All JS render-blocking, large unused assets |
| Mobile usability | 9/10 | Viewport, responsive CSS, touch targets |
| Structured data | 7/10 | Good coverage, 2 articles + calculator missing |
| Internal links | 6/10 | 5 orphaned pages |
| Heading hierarchy | 9/10 | 1 page with skip |
| Image alt tags | 10/10 | All images have descriptive alt text |
| Meta tags | 9/10 | Descriptions, OG, Twitter Card all present |
| **Overall** | **7.5/10** | Strong foundation, fixable gaps |
