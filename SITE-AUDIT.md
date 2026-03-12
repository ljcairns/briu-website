# Site Quality Audit — 2026-03-12

Overnight automated scan across all pages.

## Summary

| Category | Issues |
|---|---|
| Broken links | 0 |
| Heading hierarchy | 12 violations |
| Open Graph | 3 wrong `og:type` |
| Chart accessibility | 3 inaccessible charts |
| ARIA states | 5 missing |
| Invalid HTML | 1 |
| Skip-to-content | Missing on all pages |

---

## Broken Links

None found. All internal and external links resolve correctly.

---

## Heading Hierarchy (12 violations)

Skipped heading levels (e.g. h1 → h3, missing h2) or multiple h1 elements on a single page.

| Page | Issue |
|---|---|
| `/index.html` | h1 → h3 skip in What We Do section |
| `/index.html` | h1 → h3 skip in Pricing section |
| `/index.html` | h1 → h4 skip in FAQ section |
| `/why-now/index.html` | Multiple h1 elements |
| `/why-now/index.html` | h2 → h4 skip in calculator section |
| `/build/index.html` | h1 → h3 skip in timeline section |
| `/build/index.html` | h2 → h4 skip in cost comparison |
| `/services/index.html` | h1 → h3 skip in capabilities |
| `/services/index.html` | h2 → h4 skip in tier finder quiz |
| `/build/starting-a-company/index.html` | h2 → h4 skip |
| `/build/one-agent/index.html` | h2 → h4 skip |
| `/build/brand-in-a-session/index.html` | Multiple h1 elements |

---

## Open Graph — Wrong `og:type` (3 pages)

These pages use `og:type = website` but should use `og:type = article`:

| Page | Current | Expected |
|---|---|---|
| `/build/starting-a-company/index.html` | `website` | `article` |
| `/build/one-agent/index.html` | `website` | `article` |
| `/build/brand-in-a-session/index.html` | `website` | `article` |

---

## Inaccessible Charts (3 instances)

Charts missing `role="img"` and `aria-label` describing the visualization:

| Page | Chart |
|---|---|
| `/index.html` | Automation bars (social proof section) |
| `/why-now/index.html` | Cost decline chart |
| `/why-now/index.html` | Trust progression chart |

---

## Missing ARIA States (5 instances)

Interactive elements missing required ARIA attributes:

| Page | Element | Missing |
|---|---|---|
| `/services/index.html` | Expandable capability cards | `aria-expanded` |
| `/services/index.html` | Tier finder quiz options | `aria-selected` |
| `/index.html` | FAQ accordion items | `aria-expanded` |
| `/build/index.html` | Timeline filter buttons | `aria-pressed` |
| All pages | Chat bubble panel | `aria-hidden` when closed |

---

## Invalid HTML (1 instance)

| Page | Issue |
|---|---|
| `/why-now/index.html` | Unclosed `<div>` in calculator section |

---

## Skip-to-Content

No page includes a skip-to-content link. All pages should have a visually hidden link as the first focusable element:

```html
<a href="#main" class="skip-to-content">Skip to content</a>
```

Affected: `index.html`, `why-now/`, `build/`, `services/`, `privacy/`, all build articles, `404.html`.
