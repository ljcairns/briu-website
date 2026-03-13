# Homepage Performance Audit

**Page:** `index.html` (homepage)
**Date:** 2026-03-12

---

## Total Page Weight

| Asset | File | Size |
|-------|------|------|
| HTML | `index.html` | 87 KB |
| Inline CSS (in HTML) | `<style>` block (lines 27–524) | ~42 KB |
| External CSS | `shared.css` | 23 KB |
| External CSS | `charts.css` | 36 KB |
| JS | `charts.js` | 57 KB |
| JS | `chat-bubble.js` | 49 KB |
| JS | `interactive.js` | 49 KB |
| JS | `shared.js` | 18 KB |
| JS | `dynamic-stats.js` | 8 KB |
| JS | `ambient.js` | 5 KB |
| JS | `components.js` | 4 KB |
| JSON (fetched) | `site-config.json` | 1 KB |
| JSON (fetched) | `stats.json` | <1 KB |
| Image | `favicon.png` (180x180) | 41 KB |
| Google Fonts | DM Serif Display + DM Sans (4 weights) | ~60–80 KB est. |
| **Total (no cache)** | | **~480–500 KB** |

### Images at Root (not loaded on homepage but worth noting)

| File | Dimensions | Size | Notes |
|------|-----------|------|-------|
| `logo.png` | 756x754 | **494 KB** | Unused on homepage; massive for a 756px PNG |
| `briu-logo-transparent.png` | 400x200 | 47 KB | Referenced by other pages |
| `og-image.png` | 1200x630 | 67 KB | OG meta only, acceptable |
| `favicon.png` | 180x180 | 41 KB | Oversized for a favicon |

---

## Render-Blocking Resources

**3 render-blocking requests in `<head>`:**

1. `shared.css?v=20260312a` — 23 KB
2. `charts.css?v=20260312a` — 36 KB
3. Google Fonts stylesheet (`fonts.googleapis.com/css2?...`) — external, latency-dependent

**Impact:** Browser cannot paint until all three complete. Google Fonts adds a cross-origin round-trip.

### Suggested fixes

- **Defer `charts.css`** — charts are below the fold. Load via `<link rel="preload" as="style" onload="this.rel='stylesheet'">` or move to a `media="print" onload` pattern.
- **Self-host Google Fonts** — eliminate the cross-origin DNS+connect+download chain. Download DM Serif Display and DM Sans woff2 files, serve from `/fonts/`. Saves ~200ms on first load.
- **Inline critical CSS** — the hero + nav styles (~2–3 KB) could be inlined in `<head>` and the rest deferred.

---

## Scripts

**7 external scripts at end of `<body>`, none with `defer` or `async`:**

```
components.js     4 KB
shared.js        18 KB
ambient.js        5 KB
chat-bubble.js   49 KB
interactive.js   49 KB
dynamic-stats.js  8 KB
charts.js        57 KB
```

**Total JS: ~190 KB (unminified)**

### Issues

1. **No minification** — all JS is served as authored, unminified. Minification would cut ~30–40%.
2. **No `defer` attribute** — while placed at body end (good), `defer` would allow the browser to start downloading scripts during HTML parse.
3. **`chat-bubble.js` (49 KB) loads eagerly** — the chat widget is non-essential for first paint. Could be lazy-loaded after page idle.
4. **`charts.js` (57 KB) loads eagerly** — charts are below the fold and scroll-triggered. Could defer loading until needed.
5. **`interactive.js` (49 KB) loads eagerly** — similarly non-critical for first paint.

### Suggested fixes

- Add `defer` to all `<script>` tags.
- Minify all JS files (or add a build step). Estimated savings: ~60–70 KB.
- Lazy-load `chat-bubble.js` after `DOMContentLoaded` or on idle (`requestIdleCallback`).
- Lazy-load `charts.js` via IntersectionObserver on the first chart container.

---

## Inline CSS

The `<style>` block in `<head>` spans **~498 lines (~42 KB)** of homepage-specific CSS. This inflates the HTML document significantly and is **not cacheable** separately.

### Suggested fix

Extract homepage-specific styles to `homepage.css` (cacheable, can be deferred for below-fold sections). Keep only the critical above-fold hero/nav styles inline (~2–3 KB).

---

## Image Optimization

| File | Issue | Suggested Fix |
|------|-------|---------------|
| `logo.png` (494 KB) | PNG at 756x754 with alpha — extremely large | Convert to WebP (~50–80 KB) or SVG. Not used on homepage but bloats repo and other pages. |
| `favicon.png` (41 KB) | 180x180 PNG for favicon — oversized | Convert to ICO (< 5 KB) or optimized PNG. Add `sizes` attribute. Most browsers need 32x32 or 48x48. |
| `briu-logo-transparent.png` (47 KB) | Reasonable for 400x200 | Convert to WebP for ~50% savings. |
| `og-image.png` (67 KB) | Acceptable size for OG image | Could compress further to ~40 KB with lossy optimization. |

**No `<img>` tags on homepage** — the site uses inline SVGs and CSS, which is good for paint performance but means no responsive image (`srcset`) or lazy-loading opportunities.

---

## Unused / Potentially Unnecessary Assets

| Asset | Status | Notes |
|-------|--------|-------|
| `articles.css` (3 KB) | Not loaded on homepage | OK — page-specific |
| `logo.png` (494 KB) | Not referenced by homepage | Consider if still needed anywhere; if only `briu-logo-transparent.png` is used, delete it |
| `js/chart-renderer.js` (7 KB) | Not loaded on homepage | Appears to be a secondary chart module |
| `data/chart-data.json` (6 KB) | Loaded by chart-renderer.js | Not a homepage concern |

---

## Summary of Priorities

| Priority | Action | Estimated Savings |
|----------|--------|-------------------|
| **High** | Minify all JS files | ~60–70 KB |
| **High** | Defer `charts.css` (below-fold) | Faster first paint |
| **High** | Self-host Google Fonts | ~200ms faster first paint |
| **Medium** | Extract inline CSS to cacheable file | ~42 KB off HTML, cacheable |
| **Medium** | Lazy-load `chat-bubble.js` + `charts.js` | ~106 KB deferred |
| **Medium** | Convert `logo.png` to WebP | ~400 KB saved |
| **Medium** | Optimize `favicon.png` | ~35 KB saved |
| **Low** | Add `defer` to all script tags | Minor parse improvement |
| **Low** | Compress `og-image.png` further | ~25 KB saved |

**Current uncompressed page weight: ~480–500 KB**
**With all fixes applied: ~250–300 KB (estimated)**

With gzip/brotli (Cloudflare default), the current text assets compress well — real transfer size is likely ~150–180 KB. The main wins are in reducing render-blocking resources and deferring non-critical JS/CSS for faster Time to Interactive.
