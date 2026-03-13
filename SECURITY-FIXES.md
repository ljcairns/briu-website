# Security Fixes — 2026-03-13

Fixes for all HIGH severity findings from `SECURITY-AUDIT.md`.

---

## 1. Admin dashboard stored XSS (HIGH)

**File:** `admin/index.html`
**Finding:** User-supplied fields (`email`, `name`, `company_name`, `page`, `summary`, `tier_name`, `payment_method`) inserted into `innerHTML` without escaping in conversations, leads, and bookings tables. The `escapeHtml()` function existed but was only used for message content.
**Fix:** Wrapped all user-data fields in the existing `escapeHtml()` before concatenation into table rows. Also escaped `conv.page` in the conversation detail panel.

---

## 2. Services page reflected XSS via `?booked=` parameter (HIGH)

**File:** `services/index.html`
**Finding:** If `?booked=` value was not in the `tierNames` whitelist, the raw parameter was inserted into `innerHTML`.
**Fix:** Unknown values are now discarded (banner only renders for whitelisted tier keys). Replaced `innerHTML` with DOM construction using `textContent` and `createElement`.

---

## 3. Markdown link text XSS in chat formatText/formatMessage (HIGH)

**Files:** `chat-bubble.js`, `interactive.js`
**Finding:** `formatText()` and `formatMessage()` escaped the full message via `textContent`, then applied regex to convert `[text](url)` into `<a>` tags — but the captured `linkText` group was inserted as raw HTML, bypassing the initial escape.
**Fix:** Applied `escapeHtml()` to `linkText` before insertion in both files.

---

## 4. safeHref open redirect (HIGH)

**Files:** `chat-bubble.js`, `interactive.js`
**Finding:** `safeHref()` accepted any `https://` URL, allowing chat responses to link to attacker-controlled domains.
**Fix:** HTTPS URLs are now parsed and validated — only `briu.ai` and `*.briu.ai` hostnames are allowed. All other external URLs return `#`.

---

## 5. Formspree placeholder endpoints — silent data loss (HIGH)

**Files:** `discovery/index.html`, `refer/index.html`
**Finding:** Form actions pointed to non-functional Formspree placeholder IDs (`your-form-id`, `TODO_SET_ENDPOINT`). User submissions were silently lost.
**Fix:**
- **Discovery:** Removed the fetch call entirely. Results render locally with a message directing users to the contact form or email.
- **Refer:** Replaced form action with `#` and added `onsubmit` handler that blocks submission and directs to email.

---

## MEDIUM Severity Fixes

---

## 6. PII TTL expiration in localStorage (MEDIUM)

**Files:** `chat-bubble.js`, `interactive.js`, `shared.js`
**Finding:** Email, company name, and assessment answers stored indefinitely in `localStorage`, exfiltrable via any XSS.
**Fix:** Added TTL wrapper (`setPII`/`getPII`) with 24-hour expiration. PII keys (`briu_email`, `briu_company`, `briu_assess`) now store `{v, t}` envelopes and auto-purge after 24h. Backward-compatible with unwrapped legacy values (migrates on read).

---

## 7. Admin token moved to sessionStorage (MEDIUM)

**File:** `admin/index.html`
**Finding:** Admin bearer token stored in `localStorage`, persistent across sessions and exfiltrable via XSS on `briu.ai` origin.
**Fix:** Replaced all `localStorage` references for `briu_admin_token` with `sessionStorage`. Token is cleared on tab close.

---

## 8. Origin verification on state-changing endpoints (MEDIUM)

**File:** `workers/assess/src/index.js`
**Finding:** POST endpoints (`/api/chat`, `/api/send`, etc.) lacked server-side Origin enforcement beyond CORS headers.
**Fix:** Added explicit Origin check for all POST requests. Requests with a present but non-matching `Origin` header receive 403. Adds server-side CSRF defense beyond browser-enforced CORS.

---

## 9. Subresource Integrity (SRI) on CDN scripts (MEDIUM)

**Files:** 10 HTML pages loading Chart.js
**Finding:** Chart.js loaded from `cdn.jsdelivr.net` without `integrity` or `crossorigin` attributes. Mixed versions (4.4.1 and 4.4.7).
**Fix:** Standardized all pages to Chart.js 4.4.7 with `integrity="sha384-vsrfeLOOY6KuIYKDlmVH5UiBmgIdB1oEf7p01YgWHuqmOHfZr374+odEv96n9tNC"` and `crossorigin="anonymous"`. Also resolves LOW finding #17 (version inconsistency).

---

## 10. SSRF hardening in isBlockedDomain (MEDIUM)

**File:** `workers/assess/src/index.js`
**Finding:** Domain lookup vulnerable to DNS rebinding, expanded IPv6, and HTTP redirect chains to internal addresses.
**Fix:** Extended `isBlockedDomain()` to catch expanded IPv6, hex-encoded IPs, and octal-prefixed IPs. Added trailing dot normalization. Added `isRedirectSafe()` to validate final response URL after redirect chain resolution.

---

## 11. Admin pagination bounds validation (MEDIUM)

**File:** `workers/assess/src/index.js`
**Finding:** `limit` and `offset` query parameters accepted unbounded values, enabling potential DoS on D1.
**Fix:** Clamped `limit` to `[1, 100]` and `offset` to `>= 0`. NaN values default to 20/0 respectively.

---

## 12. Rate limiting on admin auth attempts (MEDIUM)

**File:** `workers/assess/src/index.js`
**Finding:** No rate limiting on failed admin authentication, enabling brute-force attacks.
**Fix:** Added per-IP rate limiting (5 attempts per 15-minute window) on admin endpoints. Uses KV binding when available, falls back to in-memory Map. Returns 429 when exceeded.
