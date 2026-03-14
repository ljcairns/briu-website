# Content Prune Audit

Date: 2026-03-13

Scope:
- Audited every authored `.html` and `.md` file in the repo: 69 files total.
- Also read dependency/vendor markdown under `node_modules/`; excluded those from recommendations because they are not Briu content.
- Focus here is ruthless pruning of Briu-authored content: public marketing pages, Build pages, private prospect pages, internal docs, and repo-level markdown clutter.

## Executive Verdict

The site has a strong core buried under too much repetition.

The strongest material is proof:
- exact costs
- concrete workflows
- security methodology
- founder-built examples

The weakest material is generic AI positioning repeated across multiple pages:
- "production-ready agents"
- "real costs, real results"
- "not a chatbot"
- "save your team time and money"
- "AI consultancy"
- "$2-5/day" repeated without enough context

The main structural problem is duplication:
- `index.html` and `services/index.html` substantially overlap on offer, pricing, scenarios, and discovery CTA.
- `build/security-methodology/index.html` and `build/how-we-red-teamed-our-own-agent/index.html` heavily overlap.
- `why-now/index.html`, `why-now/pricing-logic/index.html`, `build/cost-arbitrage/index.html`, and parts of `services/index.html` all make the same economics case.
- `insights/index.html`, `insights/manifesto/index.html`, and `why-now-economics/index.html` are empty redirect stubs.

## Prioritized Prune List

### P0: Collapse the offer narrative into fewer pages
1. Rewrite `index.html` to focus on one promise, one proof path, one CTA. Cut the "This isn't ChatGPT" explainer, the bloated integrations wall, and duplicate workshop/pricing detail.
2. Cut `services/index.html` by at least 35-45%. It repeats homepage copy, then repeats itself again in scenarios, pricing, and speaking. Keep process, pricing, ownership, and one proof block.
3. Shrink `agents/index.html` into a machine-readable fact sheet. Right now it is a second services page written in a gimmick wrapper.
4. Rewrite `press/index.html` to remove "AI consultancy" framing and generic claims. It should be concise factual boilerplate, not another sales page.

### P0: Kill low-signal lead-gen clutter
5. Delete or merge `free-audit/index.html` into `discovery/index.html`. Two separate "tell us your workflow and we'll tell you what to automate" pages is unnecessary.
6. Delete `refer/index.html` unless referrals are materially important. It cheapens a premium founder-led positioning.
7. Fold `resources/index.html` into nav/footer utility or discovery. As a standalone page it is just a link hub.
8. Either deepen `case-studies/index.html` with real numbers or remove it until there are actual case studies. Right now it reads like placeholders with nice typography.

### P1: Cut the Build library to a smaller proof set
9. Keep 5-6 anchor proof pages. Archive or merge the rest. The strongest keepers are:
   - `build/the-real-numbers/index.html`
   - `build/the-morning-briefing/index.html`
   - `build/from-comment-to-fix-in-one-loop/index.html`
   - one security page
   - one architecture page
   - optionally `build/voice-profile/index.html` if brand voice is strategically important
10. Delete thin stubs: `build/charts/index.html`, `build/market/index.html`, `build/velocity/index.html` unless they are expanded into real pages.
11. Merge `build/dispatch-dashboard/index.html` into `build/multi-agent-dispatch/index.html`.
12. Merge `build/cost-arbitrage/index.html` into `why-now/pricing-logic/index.html` or into a tighter economics proof page. One cost argument is enough.

### P1: Consolidate the security cluster
13. Pick one security methodology page and one security proof page. Right now four pages do overlapping work:
   - `build/security-methodology/index.html`
   - `build/how-we-red-teamed-our-own-agent/index.html`
   - `build/we-tried-to-break-our-own-sanitizer/index.html`
   - `build/six-layers-deep/index.html`
14. Keep the best two. Archive or merge the other two. Current overlap is obvious and expensive to maintain.

### P1: Remove placeholders and redirect noise
15. Delete or noindex the redirect stubs:
   - `insights/index.html`
   - `insights/manifesto/index.html`
   - `why-now-economics/index.html`
16. Delete or hide placeholder/demo pages:
   - `prospects/live/index.html`
   - `chart-preview.html`
   - `build/operations/index.html` if the live data does not reliably populate

### P2: Clean the repo itself
17. Move internal audit markdown out of repo root into `/docs/audits/` or `/internal/`. The root is noisy and full of machine-generated reports.
18. Remove stale draft/source material from public-adjacent folders:
   - `build/red-team-article-skeleton.md`
   - `from-vps/transfer/*.md`
19. Keep only durable strategic docs in root: `AGENTS.md`, `BUILD.md`, maybe `docs/briu-strategy.md`.

## Generic AI Marketing Copy To Cut

Flagged patterns:
- "AI consultancy" or "AI consulting firm"
  - Weak, generic, commodity framing.
  - Appears in `agents/index.html`, `press/index.html`, `privacy/index.html`.
- "production-ready" / "production-grade"
  - Overused category signal with low proof value.
  - Replace with exact deployment facts: systems, approvals, costs, infrastructure.
- "real costs / real workflows / real results / real businesses"
  - Repeated too often to feel credible.
  - Proof should be numeric and specific, not announced as "real."
- "Not a chatbot"
  - Tired comparison frame. It explains the market to itself instead of selling the buyer on Briu.
- "$2-5/day"
  - Useful once. Weak when repeated across home, services, press, agents, why-now, and Build without usage context.
- "save your team time and money"
  - Generic promise. Replace with "cut Monday inbox review from 3 hours to 20 minutes" style claims.
- "what actually works"
  - Overused meta-signaling. Either show specifics or cut the phrase.
- "your business runs while you sleep"
  - Strong once, but it currently drifts toward hype because so much adjacent copy says the same thing.

Better replacement pattern:
- name the workflow
- name the human bottleneck
- name the approval/control model
- name the operating cost
- name the deployment shape

## Page Inventory

Legend:
- `Keep`: strong as-is or near as-is
- `Rewrite`: keep the page, but tighten/reposition it
- `Merge`: fold into another page
- `Delete`: remove entirely
- `Archive`: keep internally, remove from active public IA
- `Hide`: keep for private use/noindex only

### Core Public Pages

| File | WC | Key message | Redundant / filler | Broken / placeholder | Action |
|---|---:|---|---|---|---|
| `index.html` | 1676 | Briu deploys approval-gated agents on client infra. | Repeats services, discovery, integrations, workshop scope, pricing. "This isn't ChatGPT" and integrations wall are filler-heavy. | None, but overly long. | `Rewrite` and cut ~600-700 words. |
| `services/index.html` | 2245 | Engagement model, pricing, and ownership. | Biggest duplication offender in the repo. Repeats homepage claims, repeats proof, repeats workshop detail, repeats economics. | None. | `Rewrite` hard; cut 35-45%. |
| `why-now/index.html` | 177 visible + JS-rendered content | Market-timing thesis for adopting agents now. | Heavy thesis layer duplicates pricing/economics pages. Reads more like an interactive essay than conversion content. | Not broken, but content depends on JS and charts to carry meaning. | `Rewrite` or move thesis into Insights. |
| `why-now/pricing-logic/index.html` | 593 | Hiring vs. agent subscription economics. | Overlaps `services/index.html`, `why-now/index.html`, `build/cost-arbitrage/index.html`. | None. | `Merge` into one economics page. |
| `why-now-economics/index.html` | 7 | Redirect stub to `/why-now/`. | Pure duplicate. | Placeholder. | `Delete` if routing can handle it; otherwise noindex redirect only. |
| `industries/index.html` | 272 | Industry examples for agent use cases. | Thin, generic vertical copy; little proof and no differentiation. | None. | `Rewrite` around 3 strongest verticals or `Merge` into services. |
| `case-studies/index.html` | 300 | Short examples of deployments. | Too thin to earn the title "Case Studies." Mostly category-level examples, not cases. | Placeholder-adjacent. | `Rewrite` with real data or `Delete`. |
| `resources/index.html` | 242 | Hub for tools and free resources. | Link directory, not a destination. Adds nav clutter. | None. | `Merge` into nav/footer or discovery. |
| `discovery/index.html` | 400 | Questionnaire to identify top workflows. | Low filler; one of the more useful conversion pages. | None. | `Keep`. |
| `free-audit/index.html` | 206 | Free AI readiness assessment. | Overlaps discovery almost exactly. "save time and money" copy is generic. | None. | `Delete` or `Merge` into discovery. |
| `refer/index.html` | 195 | Referral commission landing page. | Off-brand for a premium founder-led business unless referrals are material. | None. | `Delete` or hide behind direct links only. |
| `services/calculator/index.html` | 136 | Cost calculator for estimated run costs. | Lean and useful. Slightly generic lead-in copy. | None. | `Keep` with light copy tightening. |
| `press/index.html` | 389 | Press kit and boilerplate. | Uses commodity framing: "AI consultancy," "production-ready." Reads like marketing, not press facts. | `press/assets/README.md` implies assets may still be missing. | `Rewrite`. |
| `privacy/index.html` | 372 | Privacy policy. | Fine structurally, but "small AI consultancy" weakens positioning. | None. | `Keep` with minor wording cleanup. |
| `agents/index.html` | 884 | Machine-readable Briu page for AI agents. | Repeats services/homepage claims with gimmick framing. Uses "AI consulting firms" and generic differentiator language. | Not broken, but overbuilt for a narrow use case. | `Rewrite` into a terse fact sheet. |
| `insights/index.html` | 7 | Redirect stub to `/why-now/`. | No content. | Placeholder. | `Delete` if possible; otherwise noindex redirect only. |
| `insights/manifesto/index.html` | 7 | Redirect stub to `/why-now/`. | No content. | Placeholder. | `Delete` if possible; otherwise noindex redirect only. |
| `404.html` | 21 | Not-found page. | Minimal and correct. | None. | `Keep`. |

### Build / Proof Content

| File | WC | Key message | Redundant / filler | Broken / placeholder | Action |
|---|---:|---|---|---|---|
| `build/index.html` | 1554 | Build hub showing how Briu uses its own stack. | Strong concept, but too many proof angles at once. Reads like a catalog of overlapping stories. | None. | `Rewrite`; feature fewer anchor stories. |
| `build/the-real-numbers/index.html` | 781 | Exact build costs and timeline. | High-signal. Some "production agent system" repetition, but mostly proof. | None. | `Keep`. |
| `build/the-morning-briefing/index.html` | 1703 | Morning briefing pipeline and session economics. | Strong proof page but long. Could lose 20-25% without losing substance. | None. | `Keep` with trim. |
| `build/from-comment-to-fix-in-one-loop/index.html` | 1244 | Customer comment to deployed fix loop. | Strong operational proof; less generic than most pages. | None. | `Keep`. |
| `build/voice-profile/index.html` | 1793 | Voice-profile architecture from founder corpus. | Valuable if voice quality is strategic. A bit self-referential and long. | None. | `Keep` or `Archive` depending on editorial focus. |
| `build/how-we-built-briu-using-our-own-agent-stack/index.html` | 896 | Building the company with agents. | Good origin story, but overlaps `the-real-numbers`, `voice-profile`, and `brand-in-a-session`. | None. | `Merge` into a tighter "How We Built Briu" page. |
| `build/brand-in-a-session/index.html` | 1087 | Brand identity created quickly with agents. | Interesting but not core buyer proof. Self-referential brand story, lower conversion value. | None. | `Archive` or move out of primary Build IA. |
| `build/what-a-real-session-actually-costs/index.html` | 1959 | Founder session narrative and outputs from one late-night sprint. | Distinct voice, but indulgent and too long. More memoir than proof page. | None. | `Rewrite` hard or `Archive`. |
| `build/cost-arbitrage/index.html` | 1488 | Splitting orchestration and execution to cut costs. | Strong proof buried under repeated economics framing already made elsewhere. | None. | `Merge` into one economics proof page. |
| `build/multi-agent-dispatch/index.html` | 1491 | Routing across multiple backends and task types. | Strong technical proof but could be shorter. Overlaps dispatch dashboard. | None. | `Keep` and absorb dashboard content. |
| `build/dispatch-dashboard/index.html` | 550 | Live view of the multi-agent pipeline. | Thin companion to `multi-agent-dispatch`; not enough standalone value. | Potentially stale if "live" data stops updating. | `Merge`. |
| `build/security-methodology/index.html` | 1321 | Defense-in-depth security methodology. | Strong and useful, but overlaps red-team pages and six-layer page. | None. | `Keep` as canonical security explainer. |
| `build/how-we-red-teamed-our-own-agent/index.html` | 2424 | Full red-team narrative across rounds and findings. | Strong proof, but too long and highly overlapping with `security-methodology` and sanitizer article. | None. | `Keep` one red-team proof page; otherwise `Merge`. |
| `build/we-tried-to-break-our-own-sanitizer/index.html` | 2254 | Sanitizer-specific bypass taxonomy and results. | Overlaps red-team article heavily. Too many security pages for one buyer journey. | None. | `Archive` or merge into red-team page. |
| `build/six-layers-deep/index.html` | 1603 | Zero-trust system architecture layers. | Valuable, but largely repeats security positioning already covered elsewhere. | None. | `Merge` into security methodology or archive. |
| `build/operations/index.html` | 209 | Live cost/output/revenue dashboard. | Good idea, very thin copy. | Visible placeholders like `--` make it feel unfinished if data fails. | `Hide` until reliably populated or expand meaningfully. |
| `build/velocity/index.html` | 249 | Charts on tasks, skills, and cost per task. | Too thin to stand alone. | Feels like a chart wrapper. | `Delete` or merge into operations/build hub. |
| `build/charts/index.html` | 40 | Chart gallery. | Almost no content. | Placeholder-level. | `Delete`. |
| `build/market/index.html` | 31 | AI market explorer teaser. | Almost no content. | Placeholder-level. | `Delete`. |
| `chart-preview.html` | 202 | Internal chart preview page. | Utility/demo, not brand content. | Not broken, but not for public IA. | `Hide` or move internal. |
| `build/red-team-results.md` | 469 | Raw results for sanitizer versions. | Useful source doc, not a public page. | None. | `Keep internal`; do not surface directly. |
| `build/red-team-article-skeleton.md` | 1768 | Draft outline for sanitizer article. | Draft clutter after article exists. | Placeholder/draft. | `Delete` or move to notes. |

### Prospect, Admin, and Private HTML

| File | WC | Key message | Redundant / filler | Broken / placeholder | Action |
|---|---:|---|---|---|---|
| `prospects/value-prism/index.html` | 628 | Customized prospect page for valuation consultancy. | Stronger than generic pages because it is specific. Some standard Briu phrasing remains. | None. | `Keep` private/noindex. |
| `prospects/tmr/index.html` | 392 | Personalized portfolio use-case page. | Decent specificity, but still leans on generic reassurance. | Password-protected, which is appropriate. | `Keep` private/noindex. |
| `prospects/speaking/index.html` | 334 | Speaking page for Lucas Cairns. | Clear enough. Some "real costs, real results" cliché. | None. | `Keep` with light tightening. |
| `prospects/live/index.html` | 44 | Live custom analysis status page. | No real content. | Pure placeholder: "Building your custom analysis..." | `Delete` or hide until functional. |
| `admin/index.html` | 53 | Internal dashboard login and metrics. | Not marketing content. | Internal page; keep out of content IA. | `Keep internal`. |
| `admin/crm/index.html` | 46 | Internal CRM page. | Not marketing content. | Internal page. | `Keep internal`. |
| `admin/command/index.html` | 16 | Internal command center splash. | Not marketing content. | Minimal placeholder-style copy, but internal. | `Keep internal`. |

### Strategic / Internal Markdown

| File | WC | Key message | Redundant / filler | Broken / placeholder | Action |
|---|---:|---|---|---|---|
| `AGENTS.md` | 230 | Repo and brand guidance. | Tight and useful. | None. | `Keep`. |
| `BUILD.md` | 46 | How to run build/minify. | Minimal and useful. | None. | `Keep`. |
| `docs/briu-strategy.md` | 651 | Durable business strategy context. | Useful source of truth; slightly repetitive with `AGENTS.md`. | None. | `Keep`; consider merging overlapping brand rules. |
| `from-vps/transfer/security-summary-for-website.md` | 906 | Security architecture source material. | Strong source doc, not repo-root-worthy content. | None. | `Move` to research/internal docs. |
| `from-vps/transfer/codex-findings.md` | 545 | Raw red-team findings. | Useful source doc, not public-facing content. | None. | `Move` to research/internal docs. |
| `press/assets/README.md` | 30 | Asset naming instructions. | Fine as a utility note. | Implies missing assets if folder is empty. | `Keep` if assets exist; otherwise finish the folder. |

### Audit / QA Markdown Clutter

These files are not bad individually. The problem is that there are too many of them in repo root, many are machine-generated, and several contradict current repo state. Move them out of root or archive aggressively.

| File | WC | Key message | Redundant / filler | Broken / placeholder | Action |
|---|---:|---|---|---|---|
| `CHATBOT-AUDIT.md` | 1006 | Chatbot implementation audit. | Useful internally; too detailed for root. | None. | `Move` to `/docs/audits/`. |
| `CODE-QUALITY.md` | 676 | Cleanup pass summary. | Internal changelog, not durable homepage-adjacent content. | None. | `Move` or fold into PR history. |
| `CONSISTENCY-AUDIT.md` | 587 | HTML consistency review. | Internal QA artifact. | None. | `Move`. |
| `FORM-SECURITY.md` | 402 | Form security review. | Internal QA artifact. | Claims `free-audit/` and `refer/` do not exist even though they do. | `Move` and refresh or delete. |
| `LINK-CHECK.md` | 149 | Link scan results. | Internal QA artifact. | None. | `Move` or delete after fixes. |
| `MOBILE-QA.md` | 647 | Mobile responsiveness audit. | Internal QA artifact. | None. | `Move`. |
| `NAV-AUDIT.md` | 281 | Navigation audit. | Internal QA artifact. | None. | `Move`. |
| `OVERNIGHT-QA.md` | 423 | Overnight QA report. | Internal QA artifact. | Incorrectly says several existing pages do not exist. | `Move` and refresh or delete. |
| `PERFORMANCE-AUDIT.md` | 630 | Sitewide performance audit. | Internal QA artifact. | None. | `Move`. |
| `PERFORMANCE-CHECK.md` | 717 | Homepage performance audit. | Internal QA artifact. | None. | `Move`. |
| `SECURITY-AUDIT.md` | 943 | Repo security audit. | Important internally, but still root clutter. | None. | `Move`; keep. |
| `SECURITY-FIXES.md` | 568 | Security fixes summary. | Internal change log. | None. | `Move` or collapse into audit folder. |
| `SEO-AUDIT.md` | 1198 | SEO audit. | Internal QA artifact. | None. | `Move`. |
| `SEO-FIXES.md` | 73 | SEO fixes summary. | Extremely thin once fixes are complete. | None. | `Delete` or fold into audit log. |
| `SEO-TECHNICAL-AUDIT.md` | 1298 | Technical SEO audit. | Internal QA artifact. | None. | `Move`. |
| `SITE-AUDIT.md` | 250 | Overnight site quality audit summary. | Internal QA artifact. | None. | `Move`. |

## Ruthless Recommendations By Theme

### What to keep front-and-center
- concrete workflows with before/after operational detail
- exact cost data
- governance and approval model
- deployment on client infrastructure
- founder-built proof from Briu's own stack

### What to stop saying
- "AI consultancy"
- "production-ready"
- "real results"
- "not a chatbot"
- "save time and money"
- "what actually works"

### What to stop publishing as standalone pages
- redirect stubs
- thin chart wrappers
- internal previews
- duplicate lead magnets
- lightly fictionalized "case studies"

### Recommended slimmed-down public IA
- `/`
- `/services/`
- `/discovery/`
- `/build/`
- `/build/the-real-numbers/`
- `/build/the-morning-briefing/`
- `/build/from-comment-to-fix-in-one-loop/`
- `/build/security-methodology/`
- one red-team proof page
- `/why-now/` or one economics page, not four
- `/privacy/`
- `/press/`

Everything else should justify its existence with one of two tests:
- it converts a real buyer segment better than a simpler parent page
- it contains unique proof that cannot live anywhere else

Most of the current long tail fails that test.
