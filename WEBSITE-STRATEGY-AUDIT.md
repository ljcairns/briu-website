# Website Strategy Audit

Date: 2026-03-14
Source of truth: `BRIU-MESSAGING-STRATEGY.md`
Scope: all actual site HTML routes in the repo; excludes vendored dependency HTML inside `node_modules` and worker package dependencies.

## Executive Summary

Overall verdict: the site has a strong proof layer and a weak positioning layer.

What is working:
- The `/build/` universe proves Briu is real, technical, transparent, and operationally credible.
- Ownership, handover, approval gates, governance, and cost clarity already show up in multiple places.
- The founder voice is strongest when the site is documenting actual systems, actual costs, and actual tradeoffs.

What is not working:
- The core thesis in the strategy doc is not the homepage thesis.
- Too many pages still pitch "AI agents for businesses" instead of Briu's actual position: a founder-led implementation company helping teams move from AI reasoning to software creation to orchestration.
- Several pages still sound like a generic AI consultancy, automation shop, or agent deployment service.
- The strategy says `/build` is the proof and long-form thesis belongs in Insights, but Insights is empty and the proof is not explicitly tied back to the three-layer pitch.

Best-aligned pages right now:
- `build/cost-arbitrage/index.html`
- `build/the-real-numbers/index.html`
- `build/the-morning-briefing/index.html`
- `build/security-methodology/index.html`
- `build/how-we-built-briu-using-our-own-agent-stack/index.html`

Worst offenders right now:
- `free-audit/index.html`
- `industries/index.html`
- `press/index.html`
- `agents/index.html`
- `services/calculator/index.html`
- `why-now/pricing-logic/index.html`
- `insights/index.html`
- `insights/manifesto/index.html`

## Direct Contradictions

- `index.html` leads with "AI agents that email, research, report, and update your CRM - starting at $2-5/day." That is not the core thesis. The strategy says the pitch is that the same subscriptions people already use to think are now the same subscriptions that build software.
- `services/index.html` frames Briu as "we deploy your agents" and then sells a menu of agent types. That is narrower and more commoditized than the strategy.
- `services/calculator/index.html` teaches the buyer to think in variable "agent cost" terms, not in the three-layer stack terms.
- `free-audit/index.html` is commodity consultant lead-gen copy. It cheapens a premium founder-led implementation offer.
- `industries/index.html` is generic vertical-template copy with emojis. It reads like interchangeable AI agency collateral.
- `press/index.html` repeatedly calls Briu an "AI consultancy." The strategy explicitly pushes toward a more specific and differentiated position.
- `agents/index.html` is still "Briu AI Consulting Services" with capability JSON and typical $2-5/day agent framing. That is old positioning.
- `why-now/pricing-logic/index.html` frames Briu as a cheaper substitute for hiring a team, not as a system for building owned internal capability.
- `build/from-comment-to-fix-in-one-loop/index.html` opens on chatbot deployments through Subsights, which risks making Briu look like a chatbot company by association.
- `privacy/index.html` says "Briu is a small AI consultancy." That is inconsistent with the source-of-truth positioning.
- `prospects/live/index.html` ends with "Powered by Briu AI." That is weaker and sloppier than the Briu brand language elsewhere.
- `prospects/speaking/index.html` says "co-founder of Briu AI and Subsights." Same problem.

## Generic AI Marketing Copy

Pages still leaning on generic AI/automation language instead of Briu's specific pitch:
- `index.html`
- `services/index.html`
- `services/calculator/index.html`
- `free-audit/index.html`
- `industries/index.html`
- `press/index.html`
- `agents/index.html`
- `why-now/pricing-logic/index.html`
- `prospects/live/index.html`

## Missing Pages The Strategy Implies

- A top-level `/stack/`, `/three-layers/`, or `/how-it-works/` page explaining Reason -> Build -> Orchestrate in plain English.
- A real `/insights/` hub. The strategy explicitly says long market-thesis material should live there. Right now it does not exist.
- A top-level `/trust/` or `/security/` page that packages governance, control, approval gates, client ownership, and red-team methodology for buyers.
- A top-level `/about/` or `/founder/` page. The strategy leans heavily on founder-led credibility, but the site mostly leaves that buried in press and build pages.
- A page explicitly explaining ownership and handover: what the client owns, what Briu configures, what remains after Briu leaves.

## Navigation Verdict

Can a visitor get from the homepage to the real pitch in 2 clicks?

No.

They can get to adjacent material in 1 click:
- `Why Now`
- `Build`
- `Services`

But the actual pitch in the strategy doc does not exist as a page. A visitor currently has to assemble it from fragments:
- market urgency on `/why-now/`
- proof on `/build/`
- offer language on `/services/`

That is too much work. The site has proof, but it does not have a clean front door to the thesis.

Secondary navigation issues:
- Insights is missing even though the strategy clearly wants manifesto/thesis content moved there.
- Trust/security is buried inside Build instead of being legible to a cautious buyer.
- Footer links surface `Industries`, `Discovery`, `Calculator`, `Press`, `Privacy`, and `For AI Agents`, but not the missing stack/thesis/trust pages that would actually support conversion.
- Marschat/Lightlag content is not in nav, which is good, but it still exists in the repo as a parallel narrative with no clear "labs" separation.

## Scorecards

Scoring note: `1` means actively off-strategy or brand-damaging. `10` means it expresses the strategy cleanly and improves trust or conversion.

## Core Public Pages

### Page: `index.html`
Current message: Briu deploys AI agents that run business ops for you, with proof, integrations, and pricing starting around low daily operating cost.
Alignment score: 4/10
What's working: Strong ownership language; approval gates and governance are visible; there is real proof behind the claims; the tone is more serious than most AI sites.
What's wrong: The hero is not the strategy; the page sells "AI agents" instead of the Reason/Build/Orchestrate thesis; too much OpenClaw and integration-marketplace framing; "$2-5/day" is the wrong mental model for the core pitch; "Most clients stay" weakens the no-dependency story.
Rewrite priority: high
Specific changes: Rewrite the hero around "the same AI subscriptions your team already uses to think can now build your software"; replace the ChatGPT-vs-agent section with the three layers; add a section on team adoption and internal builder training; reduce the 100+ integrations block; add direct links to a Stack page and Trust page; keep Build as proof, not as the only place the thesis becomes believable.

### Page: `services/index.html`
Current message: Briu deploys agents on client infrastructure, trains the team, and offers kickoff, workshop, implementation, and ongoing partnership.
Alignment score: 5/10
What's working: Ownership, no lock-in, training, transparent pricing, and handover are all directionally right; there is real proof attached to the offer.
What's wrong: The page is still a services catalog for agent deployment; it sells use-case buckets instead of the strategic progression from reasoning to building to orchestration; "Most clients stay" pulls against the handover story; "Built on OpenClaw" over-anchors on a tool instead of Briu's method.
Rewrite priority: high
Specific changes: Reframe the whole page around Assessment, Training, Implementation, and Handover; rename or demote the agent-type cards; make the technical lead/builder role central; make the retainer clearly optional; explain that Briu is helping the client build owned internal leverage, not rent more automation.

### Page: `services/calculator/index.html`
Current message: A cost calculator estimates monthly agent operating costs from email volume, CRM, use cases, and number of agents.
Alignment score: 3/10
What's working: It tries to make cost legible, which matches the strategy's emphasis on cost clarity.
What's wrong: It teaches the buyer the wrong framework; it assumes a menu of agent roles and variable daily costs instead of the three layers; it feels like AI-agency tooling, not premium implementation strategy.
Rewrite priority: high
Specific changes: Replace the calculator with a stack estimator that models Layer 1 seat count, Layer 2 build stations, and Layer 3 orchestration needs; show when a team only needs Reason, when it needs Build, and when Orchestrate becomes justified; stop centering "agents wanted."

### Page: `discovery/index.html`
Current message: A questionnaire identifies repetitive workflows worth automating and surfaces top agent opportunities.
Alignment score: 6/10
What's working: Practical, operational, specific; it is closer to real implementation than generic marketing fluff.
What's wrong: It still frames the problem as generic workflow automation; it does not identify who on the client team becomes the builder; it does not educate the buyer on the three-layer model.
Rewrite priority: medium
Specific changes: Add questions for current AI reasoning adoption, who could own Layer 2 internally, whether the company needs orchestration now or later, and whether the goal is replacing SaaS spend with owned tools.

### Page: `free-audit/index.html`
Current message: Briu offers a free AI readiness audit with recommendations on what to automate.
Alignment score: 2/10
What's working: Honest tone; not too hypey.
What's wrong: This is commodity lead-gen copy; "free AI readiness audit" sounds like every generic AI consultancy on the internet; it undercuts the premium founder-led positioning.
Rewrite priority: high
Specific changes: Kill this page or replace it with a serious fit-check page for the Founder Kickoff; remove "free audit" entirely; position the offer as a scoped assessment for companies ready to build owned capability.

### Page: `industries/index.html`
Current message: Briu has industry-specific agent use cases for financial services, real estate, professional services, healthcare, e-commerce, and agencies.
Alignment score: 2/10
What's working: It tries to speak in workflows, not abstract AI platitudes.
What's wrong: The page is generic, templated, emoji-heavy, and low-signal; it reads like interchangeable agency collateral; it says nothing distinctive about Briu's actual approach.
Rewrite priority: high
Specific changes: Either delete it or rebuild it as a handful of high-conviction vertical memos with real buyer language, stack assumptions, and ownership implications; no emojis; no broad sweep of six verticals unless there is real proof in each.

### Page: `why-now/index.html`
Current message: The market window is open now because models are getting cheaper and better fast, so businesses should deploy agents early.
Alignment score: 5/10
What's working: Strong urgency; some ownership language is good; it captures the sense that the economics are moving quickly.
What's wrong: It leans too hard on market lore, podcasts, and OpenClaw timeline material; it is more "agent industry essay" than Briu thesis; it does not clearly explain Reason -> Build -> Orchestrate; it belongs under Insights, not as a substitute for the actual pitch.
Rewrite priority: medium-high
Specific changes: Move most of this into a real Insights framework; cut borrowed zeitgeist; add a tighter section explaining why flat-rate subscriptions change software economics; keep only the parts that directly support Briu's pitch.

### Page: `why-now/pricing-logic/index.html`
Current message: Hiring an internal AI team is expensive, while Briu's subscription-style deployment is cheaper and faster.
Alignment score: 3/10
What's working: Cost comparison and transparency are useful.
What's wrong: "Hire vs subscribe" is the wrong frame; it makes Briu sound like outsourced automation-as-a-service; it does not explain that the client is building owned internal systems and capability; the page is too agency-like.
Rewrite priority: high
Specific changes: Replace hire-vs-subscribe with "reasoning subscriptions + build station + orchestration layer"; show where costs are fixed, where they are variable, and what asset the client owns at the end.

### Page: `why-now-economics/index.html`
Current message: Redirect to `/why-now/`.
Alignment score: 1/10
What's working: None beyond not leaving dead content.
What's wrong: Duplicate routing clutter; no unique strategy value.
Rewrite priority: low
Specific changes: Convert to a real redirect at the hosting layer or remove the file if it serves no strategic purpose.

### Page: `insights/index.html`
Current message: Redirect to `/why-now/`.
Alignment score: 1/10
What's working: Nothing.
What's wrong: The strategy explicitly says long thesis material should move into Insights; this page proves that work has not been done.
Rewrite priority: high
Specific changes: Build a real Insights hub with essays on the three layers, SaaS replacement logic, handover/ownership, and local-model horizon.

### Page: `insights/manifesto/index.html`
Current message: Redirect to `/why-now/`.
Alignment score: 1/10
What's working: Nothing.
What's wrong: Same issue as above; the manifesto exists in the strategy doc, not on the site.
Rewrite priority: high
Specific changes: Turn this into a real thesis page or fold it into a new Stack/Insights architecture instead of redirecting away.

### Page: `press/index.html`
Current message: A press kit describing Briu as an AI consultancy that deploys production-ready agents and workflows for businesses.
Alignment score: 3/10
What's working: Clear founder mention; practical tone; basic facts are easy to scan.
What's wrong: The page repeatedly uses generic "AI consultancy" framing; it leads with old "$2-5/day per agent" language; it makes Briu sound like outsourced ops for hire rather than implementation + training + handover.
Rewrite priority: high
Specific changes: Rewrite the company overview and boilerplate around founder-led AI implementation, owned systems, and the three-layer stack; remove "AI consultancy" everywhere; update key facts to include the proof stats from the strategy doc.

### Page: `privacy/index.html`
Current message: A simple privacy policy for a small AI consultancy.
Alignment score: 6/10
What's working: Clear, plain-English, low-fluff legal copy; it supports trust.
What's wrong: It still calls Briu a "small AI consultancy"; even legal copy should not undermine positioning.
Rewrite priority: low-medium
Specific changes: Change the opening description to "founder-led AI implementation company" or equivalent; otherwise keep the tone and structure.

### Page: `agents/index.html`
Current message: A machine-readable vendor page pitching Briu as a services-led AI consultancy that deploys production-grade agents and workflows.
Alignment score: 2/10
What's working: Direct tone; no fluff; ownership and no lock-in are stated clearly.
What's wrong: It is old positioning in structured-data form; "AI consulting services," capability JSON, $2-5/day typical costs, and generic workflow lists all point to the wrong business definition.
Rewrite priority: high
Specific changes: Rewrite this page for LLM crawlers around Briu's actual thesis: team reasoning adoption, builder training, implementation infrastructure, handover, proof stats, and optional orchestration; remove the old consultancy schema and generic capabilities catalog.

### Page: `prospects/live/index.html`
Current message: A live custom analysis page built during a sales conversation.
Alignment score: 3/10
What's working: Personalized and interactive; it hints that Briu can build in-session.
What's wrong: The page is mostly placeholder text; "Powered by Briu AI" is weak branding; there is no sign of the three-layer logic.
Rewrite priority: medium-high
Specific changes: Make the analysis explicitly output Reason/Build/Orchestrate recommendations, internal owner roles, likely SaaS replacement targets, and next-step architecture.

### Page: `prospects/speaking/index.html`
Current message: Lucas speaks about real AI agent systems in production, with costs, architecture, and live demos.
Alignment score: 6/10
What's working: Proof-first; non-hypey; "in production, not in theory" is on brand.
What's wrong: "co-founder of Briu AI" is sloppy; one talk is tourism-specific and pulls away from the core company pitch; the page still centers "AI agents" more than the Briu thesis.
Rewrite priority: medium
Specific changes: Tighten the founder bio, remove "Briu AI," and make the talk framing about owned internal systems, implementation economics, and operational proof rather than generic agent excitement.

### Page: `prospects/tmr/index.html`
Current message: A private personalized page showing what AI agents could do inside a billion-dollar portfolio.
Alignment score: 6/10
What's working: Specific workflows; no-replacement framing; business relevance is clear; it feels tailored.
What's wrong: It still frames the value as "five agents" rather than a staged capability rollout; training and internal ownership are underplayed.
Rewrite priority: medium
Specific changes: Reframe the rollout as team reasoning adoption, one internal builder, then orchestration; add explicit ownership and handover language.

### Page: `prospects/value-prism/index.html`
Current message: A personalized page showing four agent workflows that could reduce analyst busywork for a valuation firm.
Alignment score: 6/10
What's working: Concrete, role-specific, tied to actual bottlenecks; more credible than generic services copy.
What's wrong: Still too centered on "agents" as a deliverable; mentions a live chatbot in one place, which muddies positioning; does not show the larger stack logic.
Rewrite priority: medium
Specific changes: Replace chatbot references; add a short "how this would be rolled out" section using the three-layer model and internal builder ownership.

### Page: `404.html`
Current message: Basic page-not-found utility.
Alignment score: 5/10
What's working: Clean and harmless.
What's wrong: No strategic value, but no damage either.
Rewrite priority: low
Specific changes: Optional only: add one sentence pointing lost visitors to the Stack, Build, or Services pages once those exist.

## Build / Proof Pages

### Page: `build/index.html`
Current message: A public proof hub showing Briu being built with agents, including tasks, costs, architecture, and supporting articles.
Alignment score: 7/10
What's working: This is the proof engine of the brand; transparency is strong; the article links are the most credible part of the site.
What's wrong: The page still frames the story as "building a company with agents" instead of "proof of the three-layer system"; some visible stats appear stale relative to the strategy doc; the client takeaway is implicit instead of explicit.
Rewrite priority: medium-high
Specific changes: Rewrite the hero and intro to say this page is proof that the Briu stack works; update all headline stats to match the strategy; add one clear block mapping the proof to client rollout: Reason, Build, Orchestrate.

### Page: `build/brand-in-a-session/index.html`
Current message: Briu's brand, name, and visual identity were generated quickly through agents plus founder taste.
Alignment score: 7/10
What's working: Strong founder-led taste story; good evidence that these tools can create real company assets quickly.
What's wrong: It is interesting but somewhat isolated from the main business pitch; too much time on etymology and process detail, not enough on why this matters for clients.
Rewrite priority: low-medium
Specific changes: Add a short framing section explaining that this is proof of Layer 1 reasoning plus Layer 2 building at near-zero incremental execution cost.

### Page: `build/cost-arbitrage/index.html`
Current message: Briu reduced costs by separating orchestration from execution and using flat-rate subscriptions for the heavy work.
Alignment score: 9/10
What's working: This is one of the closest pages to the strategy doc; it explains the economic unlock clearly and concretely.
What's wrong: It still needs to be explicitly tied to the three-layer framework so buyers understand this is not just an internal optimization trick.
Rewrite priority: low
Specific changes: Add a framing block calling this Layer 2 plus Layer 3 economics; connect it directly to the client stack and to the "zero incremental cost per task" idea in the strategy.

### Page: `build/dispatch-dashboard/index.html`
Current message: A live view of tasks flowing from orchestrator to executor to GitHub and deployment.
Alignment score: 8/10
What's working: Strong operational proof; it makes orchestration real.
What's wrong: The page is architecture-heavy and business-light; "no human in the loop" language can alarm cautious buyers if not paired with approval/gating context.
Rewrite priority: low-medium
Specific changes: Add a short buyer-facing explanation of where approval gates sit, what kinds of work this dispatch layer handles, and that this is the optional orchestration layer, not the whole Briu offer.

### Page: `build/from-comment-to-fix-in-one-loop/index.html`
Current message: An automated loop reads customer feedback, updates a deployment, and closes the loop without human context reload.
Alignment score: 8/10
What's working: Excellent proof of execution, knowledge capture, and operational leverage.
What's wrong: It opens inside the Subsights/chatbot universe, which is dangerous for Briu's positioning; it risks sounding like Briu is really a chatbot-ops shop.
Rewrite priority: medium
Specific changes: Reframe this as prior operating proof or rewrite the example in Briu's own current positioning language; remove "chatbot" as the first mental image a buyer gets.

### Page: `build/how-we-built-briu-using-our-own-agent-stack/index.html`
Current message: A transparent breakdown of the stack, costs, workflow, and limits used to launch Briu with agents.
Alignment score: 8/10
What's working: Strong proof; transparent costs; honest discussion of human judgment vs automation.
What's wrong: Too much OpenClaw and general agent-stack framing; not enough explicit connection to the three-layer model and client handover story.
Rewrite priority: medium
Specific changes: Rewrite the structure around Reason, Build, and Orchestrate; demote external-tool mythology and foreground Briu's method.

### Page: `build/how-we-red-teamed-our-own-agent/index.html`
Current message: Briu attacked its own security stack repeatedly to identify and patch weaknesses.
Alignment score: 8/10
What's working: Serious credibility; a real moat compared with generic AI shops.
What's wrong: Very technical and not tightly translated into buyer value unless someone already cares about agent security.
Rewrite priority: low
Specific changes: Add a short intro or conclusion for non-technical buyers explaining what this means in terms of client control, risk reduction, and operational trust.

### Page: `build/multi-agent-dispatch/index.html`
Current message: Briu evolved from one VPS agent to a multi-backend dispatch architecture.
Alignment score: 8/10
What's working: Good orchestration proof; specific and concrete.
What's wrong: The page is detailed enough to interest engineers but not clearly tied to the business pitch without more context.
Rewrite priority: low
Specific changes: Add a summary block: when clients need this, when they do not, and how it maps to Layer 3 only.

### Page: `build/operations/index.html`
Current message: A live dashboard of costs, output, revenue, and Discord activity across Briu's system.
Alignment score: 7/10
What's working: Real transparency; good demonstration that output scales while costs stay relatively flat.
What's wrong: It needs more explicit interpretation; the revenue tracker feels thin; Discord can read as internal trivia rather than buyer value.
Rewrite priority: medium
Specific changes: Reframe the page around "what this proves": flat subscription economics, growing owned capability, and operational discipline.

### Page: `build/security-methodology/index.html`
Current message: Briu secures agent systems with defense in depth and continuous adversarial testing.
Alignment score: 8/10
What's working: Exactly the kind of control/governance proof the strategy wants.
What's wrong: It is buried in Build instead of functioning as a top-level trust asset.
Rewrite priority: medium
Specific changes: Keep the page, but mirror or summarize it in a top-level Trust/Security page linked from main nav and homepage.

### Page: `build/six-layers-deep/index.html`
Current message: A zero-trust architecture explanation for an always-on operational agent system.
Alignment score: 8/10
What's working: Strong security depth; operationally credible.
What's wrong: Same issue as above; excellent proof, poor information architecture.
Rewrite priority: low-medium
Specific changes: Keep the content, but surface it via a buyer-friendly Trust page and add a business summary at the top.

### Page: `build/the-morning-briefing/index.html`
Current message: A detailed breakdown of a daily briefing system pulling multiple sources into one structured morning report.
Alignment score: 8/10
What's working: Concrete, useful, non-hypey, and easy to imagine inside a real company.
What's wrong: It proves a specific loop well, but it does not explicitly ladder up to the larger Briu method.
Rewrite priority: low
Specific changes: Add one short section explaining that this is the kind of workflow a company gets after team reasoning adoption and one builder-led implementation pass.

### Page: `build/the-real-numbers/index.html`
Current message: An exact cost breakdown of building a production agent system and launching Briu.
Alignment score: 9/10
What's working: Real numbers, real receipts, strong proof; this is central to the strategy.
What's wrong: The page still leans on API-runtime framing and OpenClaw language; some numbers need to be reconciled with the updated strategy stats.
Rewrite priority: medium
Specific changes: Update the headline metrics to match the source-of-truth doc; distinguish flat-rate subscriptions from orchestration/API spend; make the "building equity, not renting capability" conclusion explicit.

### Page: `build/voice-profile/index.html`
Current message: Briu built a voice profile from a large corpus so agent-generated writing sounds like Lucas rather than generic AI copy.
Alignment score: 7/10
What's working: Supports founder voice and quality control; this is one of the better demonstrations that Briu cares about execution quality, not just automation.
What's wrong: More of a craft proof than a core conversion page; somewhat tangential unless connected back to implementation quality.
Rewrite priority: low
Specific changes: Add a short framing note that this is part of making AI output usable in real operations, not just technically possible.

### Page: `build/we-tried-to-break-our-own-sanitizer/index.html`
Current message: Briu stress-tested its sanitizer with adversarial attacks to see what got through.
Alignment score: 7/10
What's working: Shows rigor and a willingness to test assumptions.
What's wrong: Narrower and more sensational than the stronger security pages; less obviously valuable to a business buyer on its own.
Rewrite priority: low
Specific changes: Keep it as a supporting article under the trust cluster, not as a standalone pillar.

### Page: `build/what-a-real-session-actually-costs/index.html`
Current message: A late-night phone-only work session shipped multiple systems at low cost through the agent setup.
Alignment score: 8/10
What's working: Strong founder-led proof; vivid example of build leverage; memorable without sounding fake.
What's wrong: The title is catchy but not strategically clear; the page needs a cleaner bridge to the business thesis.
Rewrite priority: low
Specific changes: Add a short intro making the lesson explicit: flat-rate build tools turn founder time into shipped systems with almost no incremental execution cost.

## Research / Concept Pages

### Page: `marschat/index.html`
Current message: A research concept called Lightlag explores AI-mediated interplanetary communication.
Alignment score: 2/10
What's working: Shows intellectual ambition and technical writing ability.
What's wrong: It is off-message for Briu's current commercial pitch; without a Labs wrapper, it looks like a second company or a distraction.
Rewrite priority: medium
Specific changes: Move this under a clearly separated Labs/Research section or off-domain; add framing that this is a research project, not Briu's core offer.

### Page: `marschat/lightlag-concept.html`
Current message: Duplicate Lightlag concept page.
Alignment score: 2/10
What's working: Same as above.
What's wrong: Duplicate content increases noise and confusion.
Rewrite priority: medium
Specific changes: Consolidate into one canonical concept page and redirect the duplicate.

### Page: `marschat/demo/index.html`
Current message: A live simulation demo for the Lightlag concept.
Alignment score: 1/10
What's working: Useful if someone is already evaluating the concept.
What's wrong: Purely off-strategy for the main Briu site.
Rewrite priority: medium
Specific changes: Move under Labs or a separate project site.

### Page: `marschat/proof/index.html`
Current message: A proof-of-concept page showing the same operational conclusion across multiple latency regimes.
Alignment score: 2/10
What's working: Serious research flavor and good systems thinking.
What's wrong: Still off-message for the core Briu offer.
Rewrite priority: medium
Specific changes: Same as above; separate it cleanly from the commercial site.

### Page: `marschat/whitepaper/index.html`
Current message: A technical whitepaper for the Lightlag protocol.
Alignment score: 3/10
What's working: Strong technical writing and founder credibility.
What's wrong: It supports Lucas as a thinker, not Briu's homepage conversion path; without separation it muddies what the company does.
Rewrite priority: medium
Specific changes: Put it in a Labs/Research architecture and remove any ambiguity that this is Briu's main commercial product.

### Page: `marschat/algorithm/index.html`
Current message: An interactive walkthrough of the Lightlag algorithm and protocol loop.
Alignment score: 2/10
What's working: Sophisticated presentation and clear systems explanation.
What's wrong: Same strategic distraction problem.
Rewrite priority: medium
Specific changes: Move to Labs or separate domain; do not let this sit adjacent to the core Briu pitch without explanation.

### Page: `marschat/og-image.html`
Current message: OG image preview utility for Lightlag.
Alignment score: 1/10
What's working: Functional asset preview only.
What's wrong: No strategy value; pure utility noise.
Rewrite priority: low
Specific changes: Keep it out of public IA or remove it from the marketing surface.

## Internal / Utility Pages

### Page: `admin/index.html`
Current message: Internal Briu dashboard for visitors, conversations, leads, bookings, and FAQ candidates.
Alignment score: 2/10
What's working: It proves there are real internal systems.
What's wrong: Not a public-facing strategy asset; if exposed, it creates trust risk and message clutter.
Rewrite priority: low
Specific changes: Ensure hard auth, noindex, and ideally move to an internal subdomain or separate admin environment.

### Page: `admin/command/index.html`
Current message: Internal command center/dashboard for Briu operations.
Alignment score: 2/10
What's working: Good internal proof of operational maturity.
What's wrong: Same as above; this should not be part of the public site footprint.
Rewrite priority: low
Specific changes: Keep behind auth and out of public IA.

### Page: `admin/crm/index.html`
Current message: Internal prospect CRM.
Alignment score: 2/10
What's working: Confirms Briu builds its own tooling.
What's wrong: Publicly irrelevant and risky if accessible.
Rewrite priority: low
Specific changes: Keep behind auth and away from public navigation or indexing.

### Page: `chart-preview.html`
Current message: A preview page rendering Briu chart components.
Alignment score: 2/10
What's working: Helpful for internal design and chart QA.
What's wrong: Not part of the strategy or buyer journey.
Rewrite priority: low
Specific changes: Remove from public surface or make it clearly internal/dev-only.

## Final Priority Order

Highest-priority rewrites:
1. `index.html`
2. `services/index.html`
3. `services/calculator/index.html`
4. `press/index.html`
5. `agents/index.html`
6. `free-audit/index.html`
7. `industries/index.html`
8. `why-now/pricing-logic/index.html`
9. `insights/index.html`
10. `insights/manifesto/index.html`

Highest-priority structural additions:
1. A `Stack` or `Three Layers` page.
2. A real `Insights` hub.
3. A top-level `Trust` or `Security` page.
4. A founder-led `About` page.

Blunt conclusion:

The site is better than most AI sites because it has real proof. But the proof is carrying too much weight because the positioning layer is still muddled. Right now Briu often sounds like an AI agent consultancy with unusually good receipts. The strategy doc describes something stronger and more specific: a founder-led implementation company that helps teams adopt AI for reasoning, turn that into owned internal software, and only then add orchestration where it makes sense.

The site should stop selling "agents" as the product category and start selling the stack transition.
