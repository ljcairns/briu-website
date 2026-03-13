# Cross-Page Navigation Audit — 2026-03-13

## Nav Links (components.js)

| Link | Target | Status |
|------|--------|--------|
| Logo | `/` | OK |
| Why Now | `/why-now/` | OK |
| Industries | `/industries/` | OK |
| Build | `/build/` | OK |
| Services | `/services/` | OK |
| CTA "Find Your Use Case" | `openDiscovery()` | OK — opens discovery flow |

**No "About" nav link exists.** There is no `/about/` page on the site. The agents page (`/agents/`) has an "About Briu" section but it's not linked in the nav. If an About page is intended, it needs to be created and added to `navLinks` in `components.js`.

## Footer Links (components.js)

| Link | Target | Status |
|------|--------|--------|
| hi@briu.ai | `mailto:hi@briu.ai` | OK |
| Refer & Earn | `/refer/` | OK |
| Press | `/press/` | OK (page exists) |
| Privacy | `/privacy/` | OK |
| For AI Agents | `/agents/` | OK |

## Nav/Footer Injection Coverage

26 pages have `id="site-nav"` and `id="site-footer"` — all public pages with standard chrome.

**Pages without nav/footer (intentional):**
- `discovery/index.html` — standalone questionnaire, no nav needed
- `prospects/live/index.html` — noindex prospect demo page
- `admin/index.html` — internal admin dashboard
- `admin/crm/index.html` — internal CRM
- `insights/index.html` — redirect to `/why-now/`
- `insights/manifesto/index.html` — redirect to `/why-now/`
- `why-now-economics/index.html` — redirect to `/why-now/`

## CTA Destinations

All CTAs verified:
- `openDiscovery()` — triggers discovery questionnaire flow (chat bubble or modal)
- `openContactForm()` — triggers contact flow via chat bubble
- `bookTier('kickoff')` / `bookTier('kickoff+workshop')` — opens booking modal
- `askAIFromFAQ()` — opens chat bubble for FAQ
- `href="/discovery/"` (industries page CTA) — page exists, OK
- `href="/services/"` (build page, calculator) — page exists, OK
- `href="/"` (why-now back link) — page exists, OK
- `mailto:hi@briu.ai` / `mailto:lucas@briu.ai` — valid email links

## Sitemap Audit

### Previously in sitemap (18 URLs) — all valid
All 18 existing URLs point to pages that exist (including `/refer/` and `/free-audit/` added earlier today).

### Missing from sitemap — added in this commit

**Build articles (8):**
- `/build/cost-arbitrage/`
- `/build/dispatch-dashboard/`
- `/build/how-we-red-teamed-our-own-agent/`
- `/build/multi-agent-dispatch/`
- `/build/operations/`
- `/build/security-methodology/`
- `/build/velocity/`
- `/build/what-a-real-session-actually-costs/`

**Other pages (3):**
- `/services/calculator/`
- `/prospects/speaking/`
- `/press/`

### Correctly excluded from sitemap
- `admin/*` — internal pages
- `prospects/live/` — noindex prospect demo
- `prospects/value-prism/` — private prospect vertical
- `chart-preview.html` — dev tool
- Redirect pages (`insights/`, `insights/manifesto/`, `why-now-economics/`)
- `404.html` — error page

## Issues Found

1. **No About page/link** — nav has no "about" link and no `/about/` page exists. The "About Briu" content lives only on `/agents/` (for AI consumption).
2. **8 build articles + 2 pages missing from sitemap** — fixed in this commit.
