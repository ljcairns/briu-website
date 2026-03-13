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
