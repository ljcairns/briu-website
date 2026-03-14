# Build Page Redesign

## Goal

Add a live operations-transparency layer to `/build` without rewriting the page.

The new section had to do four things:

1. Show a task feed shaped from the `dispatched_tasks` schema.
2. Visualize the `Jaume > Paula > completion` loop.
3. Surface aggregate stats for the current task window.
4. Stay inside the existing Briu build-page visual language, with a tighter Gaudi-influenced palette:
   `#3d9e9e`, `#c0714a`, `#d4a843`, `#0d0f0e`.

## Existing Page Structure

Before edits, `build/index.html` already had a clear sequence:

1. Hero
2. HUD bar
3. Build-cost stat groups
4. Timeline
5. Stories
6. Security architecture
7. How it is built
8. Economics and cost tables
9. CTA bridge

That structure was already working. The safest change was to insert one new section between the timeline and stories rather than touching the core page narrative.

## Smallest Safe Edit

The implementation keeps the current page intact and adds:

- One new section in `build/index.html`
- One schema file in `build/task-feed.schema.json`
- One sample data file in `build/task-feed.sample.json`
- One renderer module in `build/task-feed.js`

No existing sections were removed or reorganized.

## Data Model

The audit note matters because `dispatched_tasks` alone is not enough to represent the actual task state on March 13, 2026.

The VPS table still shows `pending` rows while Paula completion payloads already contain terminal outcomes like `success` or `timeout`. Because of that, the feed schema uses a composite model:

- `dispatch_status`: raw state from `dispatched_tasks`
- `observed_status`: state inferred from completion payloads
- `sync_state`: whether the row is mirrored, completion-only, or dispatch-only

The renderer treats `observed_status` as higher priority when it exists. That is encoded in the schema under:

- `source.primary_table`
- `source.status_precedence`
- `source.completion_fields`

## Sample Feed

`build/task-feed.sample.json` contains 10 realistic entries for the March 13, 2026 window.

It includes:

- Completed website and dashboard tasks
- A timeout case
- Pending audit tasks tied to the cost-visibility issue described in `/tmp/ops-transparency-audit.md`
- Dependency chains for follow-on audit work
- Null `manifest_message_id` values, matching the audit findings

Computed from the sample file:

- Tasks today: `10`
- Total observed cost: `$2.2647`
- Success rate: `83.3%`
- Average duration: `181s`

## Renderer Notes

`build/task-feed.js` is an ES module that:

- Fetches the sample JSON from the local `build/` directory
- Computes aggregate stats
- Renders the workflow loop
- Renders the task cards
- Polls for updates every 60 seconds so the section is live-ready

If the feed later becomes generated from real ops state, the page does not need a markup rewrite. The JSON contract can stay stable and only the data source needs to change.

## Design Notes

The new section uses the requested Gaudi palette as a local layer, not a global theme override.

Design choices:

- Arched stat cards for a subtle Gaudi cue
- Mosaic-like gradient accents instead of flat borders
- Near-black panels so the new colors sit inside the existing dark build page
- Workflow nodes that make the return loop explicit rather than showing a generic three-step line

## Files Changed

- `build/index.html`
- `build/task-feed.js`
- `build/task-feed.sample.json`
- `build/task-feed.schema.json`

