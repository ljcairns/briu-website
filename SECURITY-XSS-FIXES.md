# XSS Security Audit — innerHTML Assignments

**Date:** 2026-03-14
**Scope:** All `.innerHTML` assignments across the codebase (149 occurrences, 25+ files)
**Method:** Manual taint analysis — trace every innerHTML to determine if user input, URL params, or external API data can reach it

---

## Vulnerabilities Fixed

### 1. `chat-bubble.js:986` — Path regex bypass in formatText()

**Vector:** `formatText()` escapes text via `textContent` (safe), then applies a regex to auto-link bare paths like `/services/`. The regex inserted the matched path directly into an `href` attribute without escaping, bypassing the initial sanitization.

**Fix:** Wrapped both the `href` value and link text in `escapeHtml()` calls.

### 2. `interactive.js:992` — Path regex bypass in formatMessage()

**Vector:** Identical pattern to chat-bubble.js. The `formatMessage()` function's path auto-linking regex inserted unescaped values into `href` attributes.

**Fix:** Wrapped both the `href` value and link text in `escapeHtml()` calls.

### 3. `marschat/lightlag-concept.html:1238` — User chat input rendered raw

**Vector:** `addMessage()` concatenated `tag` and `text` parameters directly into innerHTML. The `text` parameter comes from `earthInput.value` (user-typed chat input) with zero sanitization.

**Fix:** Added `escapeHtml()` function. Both `tag` and `text` now escaped before innerHTML assignment.

### 4. `marschat/index.html:1287` — User chat input rendered raw

**Vector:** Same pattern as lightlag-concept.html. User input from `earthInput.value` flows to `addMessage()` and is rendered via innerHTML without escaping.

**Fix:** Added `escapeHtml()` function. Both `tag` and `text` now escaped before innerHTML assignment.

### 5. `admin/command/index.html:185-189,330,335` — Task/commit data rendered raw

**Vector:** Task summaries from `ops-data.json` and commit messages/file paths rendered via innerHTML without escaping. If the JSON source is compromised or contains user-influenced data, XSS is possible. Admin page is behind auth but stored XSS still applies.

**Fix:** Added `escapeHtml()` function. All task fields (`id`, `status`, `created`, `duration`, `summary`) and commit fields (`hash`, `date`, `msg`, `f.status`, `f.path`) now escaped.

### 6. `build/operations/index.html:525` — Revenue table entries rendered raw

**Vector:** `e.date` and `e.client` from `ops-data.json` revenue entries rendered directly in innerHTML. If JSON is attacker-controlled, client names or dates could inject scripts.

**Fix:** Added `escapeHtml()` function. `e.date` and `e.client` now escaped. `e.amount` already safe (numeric via `formatCurrency()`).

### 7. `discovery/index.html:812-813,889-891` — Task fields rendered raw

**Vector:** `task.name`, `task.detail`, and `task.agent` rendered via template literals into innerHTML. Currently hardcoded (safe), but no defense-in-depth if data source changes.

**Fix:** Added `escapeHtml()` function. All task text fields now escaped in both `buildTaskMarkup()` and `renderResults()`.

---

## Already Safe — No Changes Needed

### Files with proper escapeHtml/esc() applied to all user data

| File | innerHTML count | Sanitization | Notes |
|------|----------------|--------------|-------|
| `admin/index.html` | 15 | `escapeHtml()` on all user fields | Chat messages, leads, bookings, FAQ — all escaped |
| `admin/crm/index.html` | 3 | `esc()` (DOM-based) | Prospect names, companies, notes — all escaped |
| `build/task-feed.js` | 5 | `escapeHtml()` on all API data | Thorough — every fetched field escaped |
| `marschat/proof/index.html` | 4 | `escapeHtml()` on all fields | Speaker, tag, body, meta, expansion — all escaped |
| `marschat/demo/index.html` | 4 | `escapeHtml()` on tag + text | Consistent sanitization throughout |

### Files with only hardcoded/static data (no user input reaches innerHTML)

| File | innerHTML count | Data source |
|------|----------------|-------------|
| `charts.js` | 22 | All data from hardcoded JS arrays/objects |
| `dynamic-stats.js` | 1 | `formatDate(today)` — computed date string |
| `shared.js` | 1 | Hardcoded modal template |
| `components.js` | 1 | Hardcoded nav/footer/modal HTML |
| `index.html` | 1 | DOM self-clone for ticker animation |
| `why-now/index.html` | 5 | Hardcoded timeline data |
| `services/index.html` | 1 | Hardcoded tier finder results |
| `services/calculator/index.html` | 3 | Computed numeric values via `toLocaleString()` |
| `build/the-real-numbers/index.html` | 8 | Hardcoded `dailyData`/`compData` arrays |
| `marschat/algorithm/index.html` | 5 | Hardcoded pipeline/schema/loop constants |
| `build/operations/index.html` | 4 (other) | Hardcoded skeleton/error messages |

### innerHTML used only for clearing (empty string assignment)

These set `innerHTML = ''` to clear containers — no injection risk:
- `chat-bubble.js`: lines 316, 341, 579, 668, 905, 937, 946, 1089
- `interactive.js`: lines 131, 191, 193, 862, 983
- `discovery/index.html`: line 915
- `marschat/proof/index.html`: line 1173
- `build/the-real-numbers/index.html`: lines 485, 590, 603, 757

### Streaming text rendering (chat-bubble.js:769, interactive.js:687)

API response text is accumulated and rendered via `formatText()`/`formatMessage()`. These functions escape via `textContent` before any HTML construction. The path regex bypass (the one vulnerability) is now fixed. Remaining risk is theoretical — would require the Cloudflare Worker API to be compromised.

### prospects/live/index.html (lines 469-486)

Same-origin fetch + DOMParser. Copies innerHTML from parsed response into current DOM. Risk only if the server itself is compromised (same-origin trust boundary). Not a code-level vulnerability.

---

## Sanitization Functions in Use

| Function | Location | Method | Coverage |
|----------|----------|--------|----------|
| `escapeHtml()` | chat-bubble.js:963 | DOM `textContent` → `innerHTML` | `&<>"` |
| `escapeHtml()` | interactive.js:738 | DOM `textContent` → `innerHTML` | `&<>"` |
| `escapeHtml()` | admin/index.html:403 | String `.replace()` chain | `&<>"` |
| `esc()` | admin/crm/index.html:221 | DOM `textContent` → `innerHTML` | `&<>"` |
| `escapeHtml()` | build/task-feed.js:17 | String `.replace()` chain | `&<>"'` |
| `escapeHtml()` | marschat/proof/index.html:1162 | String `.replace()` chain | `&<>"` |
| `escapeHtml()` | marschat/demo/index.html:738 | DOM `textContent` → `innerHTML` | `&<>"` |
| `safeHref()` | chat-bubble.js:969, interactive.js:745 | URL validation (relative + briu.ai only) | Protocol injection |
| `formatText()` | chat-bubble.js:981 | `textContent` escape + safe regex | Full text sanitization |
| `formatMessage()` | interactive.js:987 | `textContent` escape + safe regex | Full text sanitization |

---

## Summary

- **7 vulnerabilities fixed** across 7 files
- **~100 innerHTML assignments confirmed safe** (hardcoded data, proper escaping, or empty-string clears)
- **0 remaining known XSS vectors** in client-side code
