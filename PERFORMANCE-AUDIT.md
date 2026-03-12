# Performance Audit — briu.ai

Scanned: 2026-03-12

---

## Asset Inventory

### JavaScript (7 files, 187 KB total)

| File | Size | Notes |
|------|------|-------|
| `charts.js` | 57 KB | Loaded on every page, only used on pages with charts |
| `chat-bubble.js` | 49 KB | Chat widget + Cloudflare Worker proxy |
| `interactive.js` | 49 KB | Homepage-specific, loaded everywhere |
| `shared.js` | 12 KB | Site-wide utilities |
| `dynamic-stats.js` | 10 KB | `data-dynamic` attribute hydration |
| `ambient.js` | 5.6 KB | Background effects |
| `components.js` | 4.2 KB | Nav, footer, modal injection |

All scripts loaded at body close, none use `defer` or `async`.

### CSS (3 files, 66 KB total)

| File | Size | Notes |
|------|------|-------|
| `charts.css` | 40 KB | Render-blocking in `<head>`, loaded on every page |
| `shared.css` | 23 KB | Render-blocking in `<head>` |
| `articles.css` | 3.1 KB | Article pages only |

### Images

| File | Size | Issue |
|------|------|-------|
| `logo.png` | **494 KB** | Appears unused — verify and remove |
| `og-image.png` | 67 KB | Meta-only, acceptable |
| `briu-logo-transparent.png` | 47 KB | Nav logo |
| `favicon.png` | 41 KB | Oversized (typical favicon < 5 KB) |
| `build/brand-in-a-session/mj-phase-*.jpg` | 97–147 KB each (7 files, ~870 KB total) | No WebP/AVIF alternatives |

No WebP or AVIF versions exist anywhere in the project.

### HTML Page Sizes

| Page | Size |
|------|------|
| Homepage (`index.html`) | 81 KB |
| Brand article | 64 KB |
| Why Now | 59 KB |
| Build index | 49 KB (estimated) |
| Admin dashboard | 20 KB |
| Privacy | 5.9 KB |
| 404 | 2.0 KB |

---

## Render-Blocking Resources

### CSS (blocks first paint)
- `shared.css` — synchronous `<link>` in `<head>`
- `charts.css` — synchronous `<link>` in `<head>`, loaded even on pages with no charts

### Google Fonts (blocks first paint)
```
https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap
```
- Preconnect hints present (good)
- `display=swap` set (good — prevents invisible text)
- 2 families, 5 weight variants loaded on every page

### Inline `<style>` Blocks
- Homepage: ~486 lines of inline CSS in `<head>` (~12–15 KB)
- Every page has its own inline `<style>` block (services, why-now, build articles, etc.)
- Build articles also use 20–25 inline `style=` attributes each

---

## CDN Dependencies

| CDN | Resource | Pages | Defer? |
|-----|----------|-------|--------|
| `fonts.googleapis.com` | DM Sans + DM Serif Display | All pages | No (CSS, blocks render) |
| `fonts.gstatic.com` | Font files (preconnected) | All pages | N/A |
| `cdn.jsdelivr.net` | Chart.js 4.4.1 UMD (84 KB gzipped) | why-now, real-session-costs, chart-preview | Yes |

No other third-party scripts. No analytics JS (Cloudflare Analytics is DNS-level). No tracking pixels.

---

## What's Missing

- **No bundler or minification** — vanilla JS served unminified
- **No code splitting** — all 7 scripts loaded on every page regardless of need
- **No image format conversion** — JPEG/PNG only, no WebP/AVIF
- **No critical CSS extraction** — full stylesheets block render
- **No `defer` on local scripts** — positioned at body close (acceptable) but `defer` would allow parallel download during parse
- **No preload hints** for critical assets (logo, hero fonts)
- **No gzip/brotli at build time** — relies on GitHub Pages/Cloudflare for compression

---

## Estimated Page Weight

| Page | HTML | CSS | JS | Fonts | Images | Total |
|------|------|-----|-----|-------|--------|-------|
| Homepage | 81 KB | 66 KB | 187 KB | ~60 KB | 0 KB | ~394 KB |
| Brand article | 64 KB | 66 KB | 187 KB | ~60 KB | 870 KB | ~1.2 MB |
| Why Now | 59 KB | 66 KB | 187 KB + 84 KB Chart.js | ~60 KB | 0 KB | ~456 KB |

Fonts estimated at ~60 KB (2 families, WOFF2). All values pre-compression.

---

## Recommendations by Priority

### Critical
1. **Remove or compress `logo.png` (494 KB)** — if unused, delete it
2. **Convert brand article JPEGs to WebP** — expect 50–70% size reduction (~870 KB → ~300 KB)
3. **Lazy-load `charts.js` (57 KB) and `interactive.js` (49 KB)** — only on pages that use them

### High
4. Add `defer` to all `<script>` tags
5. Conditionally load `charts.css` (40 KB) only on pages with charts
6. Compress `favicon.png` (41 KB → target < 5 KB) or convert to `.ico`
7. Minify JS/CSS (expect 30–40% reduction, ~253 KB → ~160 KB)

### Medium
8. Extract critical CSS (~2 KB) inline, async-load the rest
9. Reduce Google Fonts weights (do all 4 DM Sans weights get used?)
10. Self-host fonts to eliminate two render-blocking DNS lookups
11. Move inline `<style>` blocks into shared/page-specific CSS files
12. Add `<link rel="preload">` for nav logo and hero font

### Low
13. Subset fonts (remove unused glyphs)
14. Add `srcset` / responsive image sizes for brand article images
15. Consider bundling shared JS into a single file to reduce HTTP requests
