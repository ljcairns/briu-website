# Mobile Responsiveness Audit — 2026-03-13

Pages audited: `/industries/`, `/prospects/live/`, `/discovery/`, `/agents/`, homepage proof wall section.
Breakpoints tested: **375px**, **768px**, **1024px**.

---

## /agents/ — 3 issues found

### 1. Pricing table overflows at 375px (horizontal scroll)
- **Severity**: High
- **Breakpoint**: 375px
- **Detail**: The 3-column monospace pricing table (`.pricing-table`) has no responsive treatment for narrow screens. At 375px with 2rem section padding and table cell padding, the table content exceeds the viewport width. Long service names like "Implementation (single)" plus price and detail columns in JetBrains Mono don't fit.
- **Fix**: Add a responsive wrapper with `overflow-x: auto`, or stack table rows vertically at 640px using a card-based layout.

### 2. Section horizontal padding doesn't reduce on mobile
- **Severity**: Medium
- **Breakpoint**: 375px
- **Detail**: `.agents-content section { padding: 2rem 2rem 4rem; }` has higher specificity than the shared.css mobile rule `section { padding: 3rem 1.25rem 4rem; }`. This means horizontal padding stays at 2rem (32px) per side on mobile instead of dropping to 1.25rem (20px). Wastes ~24px of usable content width on a 375px screen.
- **Fix**: Add to the agents page `<style>`:
  ```css
  @media (max-width: 640px) {
    .agents-content section { padding: 2rem 1.25rem 3rem; }
  }
  ```

### 3. Terminal-block text is cramped at 375px
- **Severity**: Low-Medium
- **Breakpoint**: 375px
- **Detail**: `.terminal-block` keeps its 0.82rem monospace font size on mobile (only `.terminal-body` gets reduced to 0.72rem at 640px). Combined with 2rem section padding + 2rem block padding, available text width is ~247px. Monospace lines like `ongoing_agent_cost: $2-5/day (API costs, paid by client directly)` wrap mid-word, reducing readability.
- **Fix**: Add `.terminal-block` to the existing 640px media query with reduced font-size and padding:
  ```css
  @media (max-width: 640px) {
    .terminal-block { font-size: 0.72rem; padding: 1.25rem 1rem; }
  }
  ```

### 4. Touch target: mailto button undersized
- **Severity**: Low
- **Detail**: `.agent-mailto` padding is `0.65rem 1.5rem`, producing a touch target height of ~35px. Below the 44px minimum recommended by WCAG/Apple HIG.
- **Fix**: Increase vertical padding to `0.85rem`.

---

## /industries/ — 1 minor issue

### 1. Touch target: CTA buttons slightly small
- **Severity**: Low
- **Detail**: `.industry-cta` has `padding: 0.75rem 1.5rem`, producing ~38px touch height. Slightly below 44px recommended minimum.
- **Fix**: Increase vertical padding to `0.9rem` or add `min-height: 44px`.

### No other issues
- Grid stacks to 1-column at 900px — correct.
- Card padding reduces at 640px — correct.
- Hero inherits shared.css mobile padding — correct.
- No text overflow, no horizontal scroll, no overlapping elements.

---

## /prospects/live/ — No issues found

- Self-contained styles with proper 640px breakpoint.
- Header, main, and section padding all reduce on mobile.
- Logo scales from 72px to 56px on mobile.
- Content max-width (860px) uses `width: 100%` so it naturally fits narrow screens.
- Font sizes are reasonable at all breakpoints.
- Minimal interactive elements (no forms, no buttons requiring touch targets).
- No horizontal scroll risk.

---

## /discovery/ — 2 minor issues

### 1. No `overflow-x: hidden` on html/body
- **Severity**: Low
- **Detail**: Unlike pages using shared.css (which sets `overflow-x: hidden` on html and body), the discovery page is fully self-contained and doesn't prevent horizontal scroll. If any element bleeds even 1px, users get a horizontal scrollbar. Currently nothing overflows, but it's fragile.
- **Fix**: Add `overflow-x: hidden` to the `html` and `body` rules.

### 2. No site nav or footer
- **Severity**: Note (may be intentional)
- **Detail**: Discovery page doesn't include `components.js` or `shared.css`. No site navigation, no footer, no chat bubble. This could be intentional (standalone questionnaire) or an oversight. Users have no way to navigate back to the main site except the browser back button.
- **Fix**: If intentional, add at minimum a logo link back to `/`. If oversight, add `components.js` and shared nav/footer.

### No other issues
- Slider touch targets explicitly enlarged to 28x28px on mobile — good.
- Form inputs have adequate tap areas.
- Checkbox/radio items have generous padding.
- `clamp()` font sizes scale well across all breakpoints.
- 2-column grids engage at 700px — appropriate.

---

## Homepage proof wall section — No issues found

- Grid switches from 4-column to 2x2 at 640px — correct.
- Number font size reduces to 1.8rem on mobile — readable.
- Labels at 0.75rem with uppercase — readable.
- No text overflow, no layout breaking, no overlapping.

---

## Summary

| Page | 375px | 768px | 1024px | Issues |
|------|-------|-------|--------|--------|
| /agents/ | 3 issues | Clean | Clean | Table overflow, padding, terminal text |
| /industries/ | 1 minor | Clean | Clean | Touch target slightly small |
| /prospects/live/ | Clean | Clean | Clean | None |
| /discovery/ | 2 minor | Clean | Clean | No overflow-x, no nav |
| Homepage proof wall | Clean | Clean | Clean | None |

**Total**: 4 actionable issues (1 high, 1 medium, 2 low), 3 minor/note items.
