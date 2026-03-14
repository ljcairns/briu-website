# MarsChat concept notes

## What I used from the existing site

- Reviewed `index.html`, `shared.css`, `agents/index.html`, and `build/the-morning-briefing/index.html`.
- Kept the existing visual language: dark editorial layout, DM Serif + DM Sans pairing, gold/forest/coral accent system, soft grid/noise overlays, restrained hover and reveal motion.
- Kept the tone close to the current Briu voice: practical, premium, low-hype, operationally credible.

## What changed for this page

- The page is product-led, not services-led.
- Copy avoids consultant framing and instead sells a system: private workspaces, scoped memory, approvals, traceability, and controlled execution.
- The hero and feature sections are written around product mechanics rather than engagement models or implementation tiers.
- I included a large chat workspace mockup because the product needs to feel like software, not a brochure.

## Structure of `/marschat/index.html`

- Hero with product positioning and an above-the-fold workspace mockup.
- Product principles section to explain why MarsChat is different from generic chat.
- Operating model section showing how context, policy, execution, and logs fit together.
- Interactive scenario mockup with three contexts: ops, revenue, and founder.
- Trust/governance section contrasting generic chat with a controlled agent workspace.
- Commercial posture section with premium product pricing direction.
- Final CTA that still reads as product access, not a services inquiry.

## Interaction notes

- The page is single-file HTML with inline CSS and JS.
- The mockup scenario switcher updates thread content, queued actions, memory rules, logs, and summary stats without extra dependencies.
- Reveal-on-scroll is implemented inline with `IntersectionObserver`.

## Design intent

- The page should feel native to Briu, but sharper and more product-shaped than the rest of the site.
- I kept the editorial spacing and atmospheric background, then increased the amount of UI framing so the page reads as premium software.
- The copy repeatedly emphasizes control because that is the clearest way to differentiate an agent product from a normal chat interface.

## If this moves past concept

- Decide whether MarsChat should inherit the main Briu site nav/footer or establish its own product information architecture.
- Tighten the first wedge further. The current concept supports multiple teams, but a real launch page should likely narrow to one primary buyer and one initial workflow.
- Replace the placeholder pricing posture with actual product packaging once the deployment model is defined.
