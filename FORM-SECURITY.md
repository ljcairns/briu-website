# Form Security Review

**Date:** 2026-03-13
**Scope:** All form pages (discovery/, free-audit/, refer/)
**Reviewer:** Automated security audit

---

## Pages reviewed

| Page | Status |
|------|--------|
| `discovery/index.html` | Exists — reviewed below |
| `free-audit/` | Does not exist |
| `refer/` | Does not exist |

---

## discovery/index.html — Findings

### 1. Formspree endpoint is a placeholder (HIGH)

**Line 937:** The form submits to `https://formspree.io/f/your-form-id` — a non-functional placeholder.

- The footnote on line 733 acknowledges this
- Submissions will fail silently (caught by the `.catch()` handler with a user-facing message)
- **Action:** Replace with a real Formspree form ID or route through the existing Cloudflare Worker (`/api/`) before going live

### 2. XSS from user input — No risk found (PASS)

All dynamic rendering uses safe patterns:

- **Results cards** (line 886): `innerHTML` renders values from the hardcoded `TASKS` array, not user input. Slider values are coerced to `Number()` before use.
- **Summary strip** (lines 901, 944, 948): Uses `textContent`, which auto-escapes.
- **Hidden fields** (lines 880-884): Set via `.value`, not innerHTML.
- **Industry pre-fill** (line 959): URL query param `?industry=` is assigned via `.value` on an input element — safe, no HTML parsing.

### 3. Hidden fields — Low risk (INFO)

Three hidden fields aggregate form state before submission:

| Field | Content |
|-------|---------|
| `top_opportunities` | Ranked task names + scores from hardcoded list |
| `selected_tools` | Checkbox values from hardcoded options |
| `champion_profile_result` | Radio button value from hardcoded options |

These contain no internal data, secrets, or PII beyond what the user already entered. Acceptable.

### 4. CSRF protection — Delegated to Formspree (INFO)

The form has no CSRF token. Formspree mitigates CSRF server-side via origin/referer header validation. This is standard for Formspree integrations and acceptable, provided:

- The real Formspree form is configured with the correct allowed domain (`briu.ai`)
- If migrated to the Cloudflare Worker, add origin validation there

### 5. Hardcoded email addresses — None found (PASS)

No email addresses appear anywhere in the file.

### 6. Industry pre-fill from query params (LOW)

**Lines 957-962:** `?industry=Healthcare` pre-fills the industry input field. No security vulnerability (uses `.value`), but worth noting:

- Could be used in social-engineering links to make the form appear partially completed
- Consider whether this pre-fill is intentional or should be removed

---

## Summary

| Check | Result |
|-------|--------|
| Formspree endpoint real? | **No — placeholder** |
| XSS from user input? | Pass |
| Hidden fields leaking internal data? | Pass |
| CSRF protection? | Delegated to Formspree (acceptable) |
| Hardcoded emails? | None |
| Other | Query-param pre-fill is low risk |

**Bottom line:** The only blocking issue is the placeholder Formspree endpoint. The page is otherwise safe — no XSS vectors, no data leaks, no hardcoded secrets. The `free-audit/` and `refer/` pages do not exist yet; review them when created.
