# Red Team Results — Sanitizer v1 → v2

## Summary

| Version | Bypass Rate | Detection Rate | False Positives |
|---------|-------------|----------------|-----------------|
| v1 (regex only) | 96% (27/28) | 4% | 0/15 |
| v2 (hardened) | 14% (7/50) | 86% | 0/15 |
| v2 (excl. formatting/composition) | 4% (2/50) | 96% | 0/15 |

## Per-Category Results

| Category | v1 | v2 | Fix |
|----------|----|----|-----|
| A) Synonym substitution | 4/4 bypass | 0/4 | Keyword co-occurrence scorer |
| B) Word order manipulation | 4/4 bypass | 0/4 | Keyword scorer (order-independent) |
| C) Passive/indirect voice | 4/4 bypass | 0/4 | Keyword scorer |
| D) Multi-sentence splitting | 3/3 bypass | 0/3 | 2-sentence sliding window scorer |
| E) Conversational framing | 2/2 bypass | 0/2 | New structural patterns |
| F) Hypothetical/academic | 3/3 bypass | 0/3 | New hypothetical patterns |
| G) Leet speak | 4/4 bypass | 0/4 | Leet normalization (0→o, @→a, etc.) |
| H) Markdown/formatting | 2/2 bypass | 0/2 (excl backtick lines) | Markdown/HTML patterns |
| I) Continuation attacks | 2/2 bypass | 0/2 | New continuation patterns |
| J) Language mixing | 3/3 bypass | 0/3 | Expanded German regex + Spanish + CJK exact-match |
| K) Unicode homoglyphs | 4/4 bypass | 0/4 | NFKC + Cyrillic homoglyph map |
| L) Null/control bytes | passed but literal | 0 | Expanded stripInvisible + literal escape decoder |
| M) Double encoding | 3/3 bypass | 1/3 | Per-sequence URL decode + HTML entity decode |
| N) Case folding | 2/2 bypass | 0/2 | Turkish ı→i, German ß→ss mapping |
| O) Composition attacks | 3/3 bypass | 3/3 | Accepted limitation — structural framing defends |

## Key Architectural Additions

1. **normalizeText()** — 7-step normalization pipeline (URL decode → HTML entities → NFKC → homoglyphs → leet → case folding → lowercase)
2. **scoreInjectionKeywords()** — weighted 3-group keyword co-occurrence with 2-sentence sliding window
3. **Expanded stripInvisible()** — null bytes, BiDi overrides, control chars, variation selectors
4. **Mixed-script detection** as scoring bonus signal
5. **CJK exact-match** phrase list

## Notable Details

- Keyword scorer uses 3 groups: ACTION (ignore, disregard, abandon, forget, override, etc.), TARGET (instructions, directives, guidelines, programming, rules, etc.), SCOPE (all, previous, prior, earlier, above, etc.)
- Threshold: ≥2 groups matched AND total score ≥7 → flag as injection
- "the" was removed from SCOPE after causing 3/3 false positives (too common)
- Composition attacks (category O) are accepted out-of-scope for the sanitizer — defended by structural framing + canary tokens in the full six-layer architecture
- The 2 real remaining bypasses: partial encoding without a TARGET word, and a multi-sentence passive construction just below the scoring threshold

## False Positive Tuning

- Initial threshold of 6 with "the" in SCOPE → 3 false positives
- Removed "the", raised threshold to 7 → 0 false positives, lost 1 detection (#15: borderline passive construction)
- Good trade: prefer false negatives over false positives in production

## Test Method

- Adversarial model: DeepSeek V3.1 via OpenRouter
- 15-category bypass taxonomy, 30+ payloads per run
- Automated via OpenClaw `redteam-probe.sh execute`
- False positive testing: 15 legitimate email samples
- Regression: 10 basic sanitizer tests (quick mode)
