# Link Check Results

**Date:** 2026-03-12
**Scanned:** 30 HTML files + components.js (nav/footer links)
**External URLs checked:** 8 unique
**Issues found:** 0

No broken links found.

## Scope

- All `<a href>`, `<link href>` (stylesheets), `<img src>`, `<script src>`, and `<meta refresh>` tags
- JS-injected nav/footer links from `components.js`
- Local files: verified target exists (file or directory with index.html)
- Fragment anchors: verified `id="..."` exists in target HTML
- External URLs: HEAD request with GET fallback, 10s timeout

## Exclusions

- `<link rel="preconnect|dns-prefetch|canonical|icon|manifest">` — not navigable links
- `briu.ai` self-references — depend on deployment state, not source correctness
- `node_modules/`, `.git/`, `workers/` directories
- `mailto:`, `tel:`, `javascript:`, `data:` schemes

## Pages Checked

| Page | Local Links | External Links |
|------|------------|----------------|
| `index.html` | OK | OK |
| `404.html` | OK | OK |
| `chart-preview.html` | OK | OK |
| `privacy/index.html` | OK | OK |
| `discovery/index.html` | OK | OK |
| `why-now/index.html` | OK | OK |
| `services/index.html` | OK | OK |
| `services/calculator/index.html` | OK | OK |
| `build/index.html` | OK | OK |
| `build/brand-in-a-session/index.html` | OK | OK |
| `build/cost-arbitrage/index.html` | OK | OK |
| `build/dispatch-dashboard/index.html` | OK | OK |
| `build/from-comment-to-fix-in-one-loop/index.html` | OK | OK |
| `build/how-we-built-briu-using-our-own-agent-stack/index.html` | OK | OK |
| `build/how-we-red-teamed-our-own-agent/index.html` | OK | OK |
| `build/multi-agent-dispatch/index.html` | OK | OK |
| `build/security-methodology/index.html` | OK | OK |
| `build/six-layers-deep/index.html` | OK | OK |
| `build/the-morning-briefing/index.html` | OK | OK |
| `build/the-real-numbers/index.html` | OK | OK |
| `build/voice-profile/index.html` | OK | OK |
| `build/we-tried-to-break-our-own-sanitizer/index.html` | OK | OK |
| `build/what-a-real-session-actually-costs/index.html` | OK | OK |
| `prospects/value-prism/index.html` | OK | OK |
| `prospects/speaking/index.html` | OK | OK |
| `admin/index.html` | OK | OK |
| `admin/crm/index.html` | OK | OK |
| Redirect pages (3) | OK | — |
| `components.js` (nav/footer) | OK | — |
