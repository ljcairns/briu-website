# SEO Audit — briu.ai

Scan date: 2026-03-12

---

## Summary

| Check | Pass | Issues |
|-------|------|--------|
| Titles | 16/16 | 0 |
| Meta descriptions | 15/16 | 1 (404 missing — acceptable) |
| Canonical URLs | 16/16 | 0 |
| Open Graph tags | 15/16 | 1 (404 missing — acceptable) |
| Twitter cards | 15/16 | 1 (404 missing — acceptable) |
| Structured data (JSON-LD) | 14/16 | 2 pages missing |
| Heading hierarchy | 13/16 | 3 pages with issues |
| Sitemap coverage | 13/16 | 3 articles missing |
| og:type accuracy | 10/16 | 6 articles use "website" instead of "article" |
| Redirect pages | 3/3 | Missing noindex on all 3 |

---

## Page-by-Page Findings

### 1. Homepage (`/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| AI Agents Deployed for Your Business` (47 chars) | OK |
| Meta description | `AI agents deployed for your business. Transparent costs, no lock-in, $2-5/day.` (79 chars) | OK |
| Canonical | `https://briu.ai/` | OK |
| og:type | `website` | OK |
| og:title | Matches title | OK |
| og:description | Matches meta description | OK |
| og:image | `https://briu.ai/og-image.png` (2000x1200) | OK |
| twitter:card | `summary_large_image` | OK |
| JSON-LD | FAQPage + Organization | OK |
| H1 | `AI agents deployed for your business. Most run for $2–5/day.` | OK |
| Heading hierarchy | H1 → H2 → H3/H4 | OK |

**Issues:** None.

---

### 2. Why Now (`/why-now/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| The Window` (19 chars) | WARN — vague, no keywords |
| Meta description | `The next 18 months decide who leads and who catches up...` (163 chars) | OK |
| Canonical | `https://briu.ai/why-now/` | OK |
| og:type | `website` | WARN — should be `article` |
| JSON-LD | Article | OK |
| H1 | `The next 18 months decide who leads and who catches up.` | OK |
| Heading hierarchy | H1 → H2 → H3 → H4 | OK |

**Issues:**
- Title is too vague for search. Consider: `Briu | Why Now — The AI Agent Economics Inflection` or similar with keywords.
- og:type should be `article` (page has Article JSON-LD).

---

### 3. Build Landing (`/build/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| Build` (13 chars) | WARN — very short, no keywords |
| Meta description | `What it actually costs to build with agents...` (100 chars) | OK |
| Canonical | `https://briu.ai/build/` | OK |
| og:type | `website` | OK |
| JSON-LD | **None** | MISSING |
| H1 | `Building a company with agents. Every workflow, every cost, live.` | OK |
| Heading hierarchy | H1 → H2 → H3 | OK |

**Issues:**
- No structured data. Consider adding CollectionPage or ItemList JSON-LD pointing to articles.
- Title too short — add descriptive keywords.

---

### 4. Services (`/services/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| Services` (16 chars) | WARN — generic |
| Meta description | `AI agent deployment services. Kickoff, implementation, and retainer...` (107 chars) | OK |
| Canonical | `https://briu.ai/services/` | OK |
| og:type | `website` | OK |
| JSON-LD | Service (with Offers) | OK |
| H1 | `We deploy your agents. Your team learns to run them.` | OK |
| Heading hierarchy | H1 → H2 → H3 → H4 | OK |

**Issues:**
- Title could include "AI Agent Deployment" for keyword value.

---

### 5. Privacy (`/privacy/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| Privacy Policy` (22 chars) | OK |
| Meta description | `Privacy policy for briu.ai. What data we collect, how we use it, and who we share it with.` (90 chars) | OK |
| Canonical | `https://briu.ai/privacy/` | OK |
| og:type | `website` | OK |
| JSON-LD | **None** | OK (low priority page) |
| H1 | `Privacy Policy` | OK |
| Heading hierarchy | H1 → H2 | OK |

**Issues:** None.

---

### 6. 404 (`/404.html`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| Page Not Found` | OK |
| Meta description | **None** | OK (noindex) |
| Robots | `noindex` | OK |
| Canonical | **None** | OK (noindex) |
| JSON-LD | None | OK |
| H1 | `Page not found.` | OK |

**Issues:** None.

---

### 7. Brand in a Session (`/build/brand-in-a-session/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| Brand in a Session` (26 chars) | OK |
| Meta description | `400+ Midjourney generations. Hundreds of name candidates...` (133 chars) | OK |
| Canonical | `https://briu.ai/build/brand-in-a-session/` | OK |
| og:type | `website` | ISSUE — should be `article` |
| JSON-LD | Article + BreadcrumbList | OK |
| H1 | `Brand in a Session` | OK |
| Heading hierarchy | H1 → H2 | OK |

**Issues:**
- og:type should be `article`.

---

### 8. Starting a Company with Agents (`/build/how-we-built-briu-using-our-own-agent-stack/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| Starting a Company with Agents` (38 chars) | OK |
| Meta description | `How Briu used its own agent stack, tools, and human review to build the company itself.` (87 chars) | OK |
| Canonical | `https://briu.ai/build/how-we-built-briu-using-our-own-agent-stack/` | OK |
| og:type | `website` | ISSUE — should be `article` |
| JSON-LD | Article + BreadcrumbList | OK |
| H1 | (needs verification from full page read) | — |
| Heading hierarchy | Appears OK | — |

**Issues:**
- og:type should be `article`.

---

### 9. One Agent, 12 Skills, 26 Days (`/build/the-real-numbers/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| One Agent, 12 Skills, 26 Days` (37 chars) | OK |
| Meta description | `$376 to build a production agent system. 26 days. Every receipt included...` (107 chars) | OK |
| Canonical | `https://briu.ai/build/the-real-numbers/` | OK |
| og:type | `website` | ISSUE — should be `article` |
| JSON-LD | Article + BreadcrumbList | OK |
| Heading hierarchy | H1 → H2 | OK |

**Issues:**
- og:type should be `article`.

---

### 10. The Morning Briefing (`/build/the-morning-briefing/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| The Morning Briefing` (28 chars) | OK |
| Meta description | `$0.44 per briefing. 10 data sources. 3 email accounts...` (131 chars) | OK |
| Canonical | `https://briu.ai/build/the-morning-briefing/` | OK |
| og:type | `website` | ISSUE — should be `article` |
| JSON-LD | Article + BreadcrumbList | OK |
| Heading hierarchy | H1 → H2 → H3 → H4 | OK |

**Issues:**
- og:type should be `article`.

---

### 11. Voice Profile (`/build/voice-profile/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| How We Built a Voice Profile From 34,000 Lines of Writing` (65 chars) | OK |
| Meta description | `34,201 lines of real writing. Two files. $6 in API...` (133 chars) | OK |
| Canonical | `https://briu.ai/build/voice-profile/` | OK |
| og:type | `website` | ISSUE — should be `article` |
| og:title | `Briu \| Voice Profile` — differs from `<title>` | WARN |
| JSON-LD | Article + BreadcrumbList | OK |
| Heading hierarchy | H1 → H2 → H3 | OK |

**Issues:**
- og:type should be `article`.
- og:title (`Briu | Voice Profile`) diverges from `<title>` (`...34,000 Lines of Writing`). Should match.

---

### 12. We Tried to Break Our Own Sanitizer (`/build/we-tried-to-break-our-own-sanitizer/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| We Tried to Break Our Own Sanitizer` (43 chars) | OK |
| Meta description | `We ran DeepSeek as an adversarial model against our own prompt injection sanitizer...` (156 chars) | OK |
| Canonical | `https://briu.ai/build/we-tried-to-break-our-own-sanitizer/` | OK |
| og:type | `website` | ISSUE — should be `article` |
| JSON-LD | Article + BreadcrumbList | OK |
| Heading hierarchy | H1 → H2 | OK |

**Issues:**
- og:type should be `article`.

---

### 13. The 2 AM Session (`/build/what-a-real-session-actually-costs/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| The 2 AM Session` (24 chars) | OK |
| Meta description | `I woke up at 1 AM, opened Discord on my phone, and shipped six systems by 10 AM. $64.30.` (122 chars) | OK |
| Canonical | `https://briu.ai/build/what-a-real-session-actually-costs/` | OK |
| og:type | `article` | OK |
| JSON-LD | Article + BreadcrumbList | OK |
| Heading hierarchy | H1 → H2 | OK |

**Issues:** None. **Not in sitemap** (see below).

---

### 14. How We Red-Teamed Our Own Agent (`/build/how-we-red-teamed-our-own-agent/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| How We Red-Teamed Our Own Agent` (39 chars) | OK |
| Meta description | `We pointed Opus 4.6 and Codex at our own agent security stack...` (137 chars) | OK |
| Canonical | `https://briu.ai/build/how-we-red-teamed-our-own-agent/` | OK |
| og:type | `article` | OK |
| JSON-LD | Article + BreadcrumbList | OK |
| Heading hierarchy | H1 → H2 | OK |

**Issues:** None. **Not in sitemap** (see below).

---

### 15. How We Secure AI Agent Systems (`/build/security-methodology/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| How We Secure AI Agent Systems` (38 chars) | OK |
| Meta description | `Continuous adversarial testing against a defense-in-depth architecture...` (131 chars) | OK |
| Canonical | `https://briu.ai/build/security-methodology/` | OK |
| og:type | `article` | OK |
| JSON-LD | Article + BreadcrumbList | OK |
| Heading hierarchy | H1 → H2 | OK |

**Issues:** None. **Not in sitemap** (see below).

---

### 16. Six Layers Deep (`/build/six-layers-deep/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| Six Layers Deep` (23 chars) | OK |
| Meta description | `How we built a zero-trust security architecture for an AI agent system...` (134 chars) | OK |
| Canonical | `https://briu.ai/build/six-layers-deep/` | OK |
| og:type | `website` | ISSUE — should be `article` |
| og:description | `Zero-trust security for AI agents...` — differs from meta description | WARN |
| JSON-LD | Article + BreadcrumbList | OK |
| Heading hierarchy | H1 → H2 → H3 | OK |

**Issues:**
- og:type should be `article`.
- og:description is a shortened version of meta description — minor inconsistency.

---

### 17. From Comment to Fix in One Loop (`/build/from-comment-to-fix-in-one-loop/`)

| Element | Value | Status |
|---------|-------|--------|
| Title | `Briu \| From Comment to Fix in One Loop` (39 chars) | OK |
| Meta description | `How we wired a customer feedback notification into an agent...` (135 chars) | OK |
| Canonical | `https://briu.ai/build/from-comment-to-fix-in-one-loop/` | OK |
| og:type | `website` | ISSUE — should be `article` |
| og:description | `How we automated the full cycle...` — differs from meta description | WARN |
| JSON-LD | Article + BreadcrumbList | OK |
| Heading hierarchy | H1 → H2 → H3 | OK |

**Issues:**
- og:type should be `article`.
- og:description mismatch with meta description.

---

## Redirect Pages

| Path | Destination | Canonical | noindex | Status |
|------|-------------|-----------|---------|--------|
| `/insights/` | `/why-now/` | `https://briu.ai/why-now/` | **No** | ISSUE |
| `/insights/manifesto/` | `/why-now/` | `https://briu.ai/why-now/` | **No** | ISSUE |
| `/why-now-economics/` | `/why-now/` | `https://briu.ai/why-now/` | **No** | ISSUE |

All three redirect pages are missing `<meta name="robots" content="noindex">`. While they have canonical tags pointing to the destination, adding noindex is belt-and-suspenders best practice to prevent indexing of redirect stubs.

---

## Sitemap Issues

**Missing from `sitemap.xml`:**

| Page | URL |
|------|-----|
| The 2 AM Session | `https://briu.ai/build/what-a-real-session-actually-costs/` |
| How We Red-Teamed Our Own Agent | `https://briu.ai/build/how-we-red-teamed-our-own-agent/` |
| How We Secure AI Agent Systems | `https://briu.ai/build/security-methodology/` |

**Stale lastmod dates:** All sitemap entries show `2026-03-08` through `2026-03-10`. Several pages have been modified since then. Consider updating lastmod values or automating them.

---

## Cross-Cutting Issues

### 1. og:type inconsistency (8 articles affected)
Articles with Article JSON-LD but `og:type="website"` instead of `og:type="article"`:
- `/why-now/`
- `/build/brand-in-a-session/`
- `/build/how-we-built-briu-using-our-own-agent-stack/`
- `/build/the-real-numbers/`
- `/build/the-morning-briefing/`
- `/build/voice-profile/`
- `/build/we-tried-to-break-our-own-sanitizer/`
- `/build/six-layers-deep/`
- `/build/from-comment-to-fix-in-one-loop/`

### 2. og:description mismatches (3 pages)
Pages where og:description differs from meta description:
- `/build/voice-profile/` — og:title also differs from `<title>`
- `/build/six-layers-deep/` — shortened og:description
- `/build/from-comment-to-fix-in-one-loop/` — rewritten og:description
- `/build/the-morning-briefing/` — minor wording difference

These mismatches aren't critical but can cause inconsistent social previews.

### 3. Build landing page has no structured data
`/build/` is the only content page (non-utility) with no JSON-LD. A CollectionPage or ItemList schema would help search engines understand it as an article hub.

### 4. Vague page titles
- `/why-now/` — "The Window" has zero keyword signal
- `/build/` — "Build" is too generic
- `/services/` — "Services" is generic

### 5. No page-specific og:image
All pages share `og-image.png`. Article-specific images would improve social click-through, but this is a low-priority enhancement.

### 6. Heading hierarchy — homepage
The homepage jumps from H2 to H4 in the "use cases" section (line 729). Pattern: `H2 → H4` without an intervening H3. This is a minor accessibility/SEO concern.

---

## Priority Actions

| Priority | Action | Pages affected |
|----------|--------|----------------|
| High | Add 3 missing articles to sitemap.xml | 3 |
| High | Fix og:type to "article" on all article pages | 9 |
| Medium | Add noindex to redirect stub pages | 3 |
| Medium | Improve vague titles (Why Now, Build, Services) | 3 |
| Medium | Add JSON-LD to /build/ landing page | 1 |
| Low | Align og:description with meta description | 4 |
| Low | Fix H2→H4 skip on homepage use cases section | 1 |
| Low | Update sitemap lastmod dates | all |
| Low | Add page-specific og:image per article | 11 |
