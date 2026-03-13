# SEO Fixes

## Summary

- Added missing `meta name="description"` tags to `404.html` and `admin/index.html`.
- Added missing Open Graph and Twitter card metadata to `404.html`, `admin/index.html`, `chart-preview.html`, `why-now-economics/index.html`, `insights/index.html`, and `insights/manifesto/index.html`.
- Added missing `twitter:image` tags to `discovery/index.html` and `prospects/value-prism/index.html`.
- Added JSON-LD `WebSite` schema blocks to `build/index.html` and `privacy/index.html`.
- Verified CSS and JS cache-bust version strings across all `build/*/index.html` article pages are already normalized to `20260312a`.

## Notes

- Redirect pages under `insights/` and `why-now-economics/` now include social metadata aligned to the canonical `/why-now/` destination.
- No content structure or page layouts were changed as part of this pass.
