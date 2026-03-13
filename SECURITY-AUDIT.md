# Security Audit — briu-website

**Date:** 2026-03-13
**Scope:** Full codebase — HTML pages, shared JS, Cloudflare Worker, config files, GitHub Actions

---

## HIGH Severity

### 1. Admin dashboard renders user data without escaping

**File:** `admin/index.html` lines 318-364

The conversations, leads, and bookings tables insert user-supplied fields (`email`, `name`, `company_name`, `summary`, `page`, `payment_method`, `tier_name`) directly into `innerHTML` without escaping. An `escapeHtml()` function exists at line 403 and is used for message content (line 391), but is **not applied** to table cell rendering.

**Impact:** Stored XSS. A visitor who enters `<img src=x onerror=alert(document.cookie)>` as their name or email will execute JS in any admin session that views the dashboard.

**Fix:** Wrap every user-data field in the existing `escapeHtml()` before concatenation.

---

### 2. Services page booking banner — URL parameter XSS

**File:** `services/index.html` lines 772-779

```js
var name = tierNames[booked] || booked;
banner.innerHTML = '...' + name + '...';
```

If the `booked` query parameter is not in the `tierNames` whitelist, the raw parameter value is inserted into `innerHTML` unescaped.

**Vector:** `?booked=<img src=x onerror=alert(1)>`

**Fix:** Use `textContent` for the label, or validate against the whitelist and discard unknown values.

---

### 3. Chat bubble `formatText()` — markdown link text not escaped

**File:** `chat-bubble.js` lines 957-971

`formatText()` escapes the full text via `textContent`, then applies regex to convert `[text](url)` into `<a>` tags. The captured `linkText` group is inserted as raw HTML without re-escaping.

**Vector:** If the LLM returns `[<img src=x onerror=alert(1)>](/path)`, the tag executes.

**Fix:** Apply `escapeHtml()` to `linkText` before insertion. Same issue exists in `interactive.js` `formatMessage()`.

---

### 4. `safeHref()` allows any HTTPS URL (open redirect)

**File:** `chat-bubble.js` lines 950-955, `interactive.js` (same pattern)

```js
if (url.indexOf('https://') === 0) return url;
```

Any `https://` URL passes, including attacker domains. Chat responses with `{"type":"page","path":"https://evil.com"}` create links to external sites.

**Fix:** Restrict to `briu.ai` domain or relative paths only.

---

### 5. Formspree placeholder endpoints — submissions silently lost

**Files:** `discovery/index.html` line 937, `refer/index.html` line 115

Form action is `https://formspree.io/f/your-form-id` — a non-functional placeholder. User submissions go nowhere.

**Fix:** Replace with real Formspree form ID or route through the Cloudflare Worker API.

---

## MEDIUM Severity

### 6. Sensitive data stored unencrypted in localStorage

**Files:** `chat-bubble.js`, `interactive.js`, `shared.js`

Email addresses, company names, assessment answers, conversation history, and session IDs are stored in `localStorage` (`briu_email`, `briu_company`, `briu_assess`, `briu_conv`, `briu_session`). Combined with any XSS vulnerability, all stored PII is exfiltrated via `localStorage.getItem()`.

**Mitigation:** Minimize PII in localStorage. Consider `sessionStorage` for ephemeral data. Fixing XSS issues above is the primary defense.

---

### 7. Admin token stored in localStorage

**File:** `admin/index.html` line 464

```js
let TOKEN = localStorage.getItem('briu_admin_token') || '';
```

If any XSS fires on the `briu.ai` origin, the admin token is immediately available to the attacker.

**Mitigation:** Use `sessionStorage` (cleared on tab close) or an HttpOnly cookie set by the worker.

---

### 8. No CSRF protection on admin API endpoints

**File:** `workers/assess/src/index.js`

Admin endpoints (`/api/admin/*`) use Bearer token auth via `Authorization` header. This is inherently CSRF-resistant for non-simple requests, but the `/api/chat` and `/api/send` endpoints accept POST from the browser with simple JSON content types.

**Mitigation:** Verify `Origin` header matches allowed domain on all state-changing endpoints (partially implemented via CORS, but enforce server-side).

---

### 9. External CDN scripts loaded without Subresource Integrity (SRI)

**Files:**
- `build/velocity/index.html` line 26
- `build/operations/index.html` line 26
- `build/what-a-real-session-actually-costs/index.html` line 25
- `chart-preview.html` line 23
- `why-now/index.html` line 25

Chart.js loaded from `cdn.jsdelivr.net` without `integrity` or `crossorigin` attributes. A CDN compromise would inject arbitrary JS.

**Fix:** Add SRI hashes. Example:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"
  integrity="sha384-..." crossorigin="anonymous"></script>
```

---

### 10. SSRF bypass potential in domain lookup

**File:** `workers/assess/src/index.js` lines 175-230

`isBlockedDomain()` blocks `localhost`, `127.0.0.1`, private TLDs, and bare IPs, but is vulnerable to:
- DNS rebinding (domain resolves to internal IP on second lookup)
- Expanded IPv6 (`[0:0:0:0:0:0:0:1]`)
- HTTP redirect chains (attacker.com 302 -> internal)

**Risk:** Limited to domain info enrichment, not arbitrary fetch. Low practical impact but worth hardening.

---

### 11. Admin pagination parameters lack bounds validation

**File:** `workers/assess/src/index.js` lines 619-620

```js
const limit = parseInt(url.searchParams.get('limit') || '20');
```

No upper bound. Authenticated admin can request `?limit=999999999`, potentially causing performance issues on D1.

**Fix:** `Math.min(Math.max(parseInt(...), 1), 100)`.

---

### 12. Weak admin token validation

**File:** `workers/assess/src/index.js` lines 570-574

Simple string equality. No rate limiting on auth attempts, no token expiration, no rotation mechanism. A brute-force attack on the admin endpoint is feasible if the token is short or predictable.

**Fix:** Add rate limiting on failed auth attempts. Use a high-entropy token (32+ random bytes).

---

## LOW Severity

### 13. Email addresses hardcoded in source

**Files:** `components.js`, `shared.js` (`hi@briu.ai`), `prospects/speaking/index.html`, `agents/index.html` (`lucas@briu.ai`)

Public business emails, intentionally visible. Low risk but will be harvested by scrapers.

**Mitigation:** Consider obfuscation or contact-form-only for `lucas@briu.ai`.

---

### 14. Cloudflare D1 database ID and KV namespace IDs in config

**File:** `workers/assess/wrangler.toml` lines 18, 23, 32-33

Database ID `8f125fff-...` and KV IDs are in the config file. These require Cloudflare account access to exploit but reduce defense-in-depth if the repo leaks.

**Risk:** Low. Standard practice for Cloudflare projects. Secrets (API keys, tokens) are correctly set via `wrangler secret put`.

---

### 15. Discovery page pre-fills form from URL parameter

**File:** `discovery/index.html` lines 957-962

`?industry=Healthcare` sets `.value` on an input. No XSS risk (value assignment, not innerHTML), but could be used in social engineering phishing links.

---

### 16. Rate limiting fallback is per-isolate

**File:** `workers/assess/src/index.js` lines 957-980

When KV binding is unavailable, rate limiting uses an in-memory `Map` scoped to the Worker isolate. Requests hitting different isolates bypass the limit.

**Risk:** Low in production with KV bound. Add alerting if `RATE_LIMIT` binding is missing.

---

### 17. Inconsistent Chart.js versions

**Files:** Some pages load Chart.js `4.4.1`, others load `4.4.7`. Mixed versions increase supply-chain attack surface and make SRI harder to manage.

**Fix:** Standardize on one version across all pages.

---

## Positive Findings

- All D1 queries use parameterized `.bind()` — no SQL injection
- API keys (`ANTHROPIC_API_KEY`, `ADMIN_TOKEN`, `STRIPE_SECRET_KEY`) are environment secrets, not hardcoded
- GitHub Actions use `${{ secrets.* }}` — no token leakage in workflow files
- CORS is restricted to `ALLOWED_ORIGIN` (not `*`)
- Error responses to clients are generic (`{ error: 'Internal error' }`)
- Webhook signature verification uses HMAC-SHA256
- All external API calls use HTTPS
- Admin CRM page (`admin/crm/index.html`) correctly uses `esc()` for all user data

---

## Priority Fix Order

1. **Escape user data in admin dashboard tables** (HIGH, stored XSS)
2. **Fix services booking banner XSS** (HIGH, reflected XSS)
3. **Escape linkText in formatText/formatMessage** (HIGH, LLM-driven XSS)
4. **Restrict safeHref to briu.ai domain** (HIGH, open redirect)
5. **Replace Formspree placeholder endpoints** (HIGH, data loss)
6. **Add SRI to CDN scripts** (MEDIUM, supply chain)
7. **Move admin token to sessionStorage** (MEDIUM, XSS amplification)
8. **Add pagination bounds** (MEDIUM, DoS)
9. **Rate-limit admin auth attempts** (MEDIUM, brute force)
