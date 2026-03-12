# Chatbot Implementation Audit

Last reviewed: 2026-03-12

---

## Model

| Component | Model | Purpose |
|-----------|-------|---------|
| Chat | `claude-sonnet-4-5-20250929` | Conversational responses via Anthropic API v1 |
| FAQ extraction | `claude-haiku-4-5-20251001` | Daily cron analysis of recent messages |

Prompt caching is enabled. Calls go through `https://api.anthropic.com/v1/messages` with streaming (`text/event-stream`).

---

## System Prompt

The system prompt instructs the model to act as "Briu's on-site guide" — warm, direct, specific, sounding like a thoughtful founder rather than a sales bot. Key behavioral rules:

- Every response must be valid JSON: `{"text":"...","actions":[...]}`
- Text limited to 2-4 short sentences, under 120 words, no markdown
- Never say "I'm an AI"
- Ask questions before recommending
- Never pressure (but see conversion pressure section below)
- Reference real numbers and pages naturally
- Use `[link text](/path/)` for page links

### Conversion Pressure Rules (built into prompt)

After 5+ messages or progress >= 60, the model is instructed to push toward next steps:

- Give specific estimates, then suggest connecting with Lucas
- Create urgency: "We're only taking 3-4 new engagements a month"
- Make handoff low-friction: "just takes a name and email"
- After message 8: include `handoff` action on every response
- Always include "Let's set up a call" quick reply after message 5

---

## Actions (Tools)

The chatbot has 9 action types rendered as UI cards in the chat panel:

| Action | Purpose | Fields |
|--------|---------|--------|
| `replies` | Quick-reply buttons | `options[]` (2-3 suggestions) |
| `page` | Link card to site page | `title`, `desc`, `path` |
| `estimate` | Cost breakdown card | `label`, `items[{name, cost}]` |
| `collect` | Form field request | `field` (company/name/email/website/workflow), `label`, `placeholder` |
| `progress` | Qualification progress bar | `value` (0-100), `label` |
| `handoff` | Send conversation to team | `message` |
| `pitch` | Personalized company pitch | `company`, `domain`, `points[]`, `estimate{tier, build, monthly}` |
| `chart` | Animated bar chart | `title`, `format` (dollar/percent/multiplier), `data[{label, value}]`, `total`, `comparison` |
| `stat` | Big number card | `value`, `label`, `desc`, `source` |

Guidelines: `replies` on every response, max 2-3 actions per response, `progress` periodically.

---

## Data Access

### Content Chunks (hardcoded in worker)

8 topic chunks injected into context based on conversation:

| Chunk | Content |
|-------|---------|
| `pricing` | Service tiers, costs, payment methods |
| `economics` | Cost analysis, ROI comparisons, agent API costs |
| `capabilities` | What agents can do (email, CRM, reporting, etc.) |
| `proof` | Quotes from Calacanis, Cuban, Chamath |
| `build` | Technical build articles, security details |
| `whynow` | Founder essay on deploying agents now |
| `charts` | 64+ data points from podcast transcripts |
| `pages` | Site page directory |

Selection: first message always loads `pricing` + `capabilities`. Subsequent messages use keyword matching via TOPIC_MAP (max 2 chunks).

### Vectorize RAG (semantic search)

- Embedding model: `@cf/baai/bge-base-en-v1.5` (Cloudflare AI)
- Index: `briu-content` (Cloudflare Vectorize)
- Retrieves up to 4 chunks by cosine similarity, deduplicated by path
- Falls back to keyword matching if Vectorize unavailable

### Company Lookup

When a visitor provides a work email:

- Fetches company domain website (title, meta description, ~1500 chars body)
- Detects industry via keyword matching (saas, finance, healthcare, etc.)
- Suggests relevant workflows based on industry
- SSRF protection: blocks internal IPs, localhost, `.internal`/`.local`/`.localhost` TLDs
- 5000ms fetch timeout

### Conversation History

- Up to 20 most recent messages included in prompt
- Older messages summarized (not included verbatim)

---

## Pricing Behavior

### Tiers Quoted

| Tier | Price | Notes |
|------|-------|-------|
| Kickoff | $5,000 | Half-day session, workflow mapping, first agent built |
| Workshop Add-on | +$2,500 | Team briefing, exec sessions, live demos |
| Kickoff + Workshop | $7,500 | Combined |
| Implementation | $8-20K (single), $20-50K+ (multi) | Scoped per project |
| Retainer | from $500/mo | Maintenance, monitoring, optimization |
| Speaking (keynote) | $5,000 | |
| Speaking (half-day) | $7,500 | |

### Agent Cost Estimates

| Complexity | Daily API Cost |
|------------|---------------|
| Simple | $2-5/day |
| Medium | $5-15/day |
| Complex | $15-50/day |
| Platform | ~$200/mo |

Monthly formula: `(daily_api x agents x 30) + platform + retainer`

### Comparison Points (from prompt)

- Traditional hire: $40-75K+/year
- Briu's own agent: $376 total API, $711 month-one all-in
- Claim: 30x less cost, 7x faster delivery

### Payment Methods

Invoice (bank transfer/wire) and cryptocurrency. No payment processors.

---

## Storage

### D1 Database (`briu-analytics`)

| Table | Key Fields |
|-------|------------|
| `visitors` | session_id, email, company_name, company_domain, company_industries, quiz (q1-q4), ip_hash, stage |
| `conversations` | visitor_id, session_id, page, message_count, quality_score, has_handoff |
| `messages` | role, content, actions (JSON), chunks_used |
| `leads` | email, summary, company, quality_score (0-100), status |
| `bookings` | tier, amount, payment_method, status |
| `faq_candidates` | question, answer, frequency, status |
| `daily_metrics` | date, visitors, conversations, messages, leads, bookings, avg scores |

### KV Namespaces

| Namespace | Purpose | TTL |
|-----------|---------|-----|
| `CONVERSATIONS` | Lead & booking records (legacy) | 30-90 days |
| `RATE_LIMIT` | Per-IP request counts | 3600s |

### Frontend (localStorage)

- `briu_sid` — session ID
- `briu_email` — user email
- `briu_company` — company lookup result
- `briu_assess` — quiz answers

---

## Security

### Rate Limiting

- 20 requests/hour per IP
- KV-backed when bound, in-memory Map fallback
- 429 response on exceed

### Input Validation

- Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Domain validation + blocked domains
- Message content: 10,000 char limit in D1

### SSRF Protection

- Blocks: localhost, 127.0.0.1, 169.254.169.254, `.internal`, `.local`, `.localhost`, `.test`, `.invalid`, `.example`
- Cloudflare Workers automatically blocks private IP redirects
- 5000ms fetch timeout

### Prompt Injection Mitigation

- Content chunks are hardcoded (not user-controlled)
- Company context wrapped in `[COMPANY CONTEXT]` data section
- Scraped website data wrapped in `[SCRAPED WEBSITE DATA]`
- History limited to 20 messages

### Data Privacy

- IP addresses stored as non-reversible hashes
- No PII in logs
- D1 encrypted at rest (Cloudflare managed)
- Discord webhook sanitizer: strips `@everyone`/`@here`, 1024 char limit per field

---

## Qualification Flow

Progress tracking (0-100):

| Score | Meaning |
|-------|---------|
| 20 | Quiz completed |
| 40 | Company/industry known |
| 60 | Specific workflow understood |
| 80 | Scope/pricing discussed |
| 100 | Ready to hand off |

Collected fields: role (quiz), team size (quiz), AI usage (quiz), primary interest (quiz), company, workflow, tools, timeline.

---

## Handoff Routing

When a visitor is ready to connect:

1. **Primary**: OpenClaw webhook (structured JSON lead payload)
2. **Fallback**: Discord webhook (embed with fields)
3. **Email**: MailChannels to `hi@briu.ai`
4. **Storage**: KV (30-day TTL) + D1 leads table

Quality score: 0-100 based on completeness (name, email, company, domain, industries, workflows, quiz answers, message count).

---

## Admin API

All endpoints require `Authorization: Bearer <ADMIN_TOKEN>`.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/stats` | GET | Totals, stage breakdown, 30-day daily metrics |
| `/api/admin/conversations` | GET | Recent conversations with visitor context |
| `/api/admin/conversation/:id` | GET | Full message thread |
| `/api/admin/leads` | GET | 50 most recent leads |
| `/api/admin/bookings` | GET | 50 most recent bookings |
| `/api/admin/lead/:id/status` | POST | Update lead status |
| `/api/admin/faq` | GET | FAQ candidates by status |
| `/api/admin/faq/:id/status` | POST | Approve/reject/publish FAQ |
| `/api/admin/analyze-faq` | POST | Trigger FAQ extraction manually |

Dashboard at `/admin/` with auth gate, stat cards, stage funnel, conversation threads.

---

## Scheduled Tasks

| Schedule | Task |
|----------|------|
| Daily 6am UTC | FAQ extraction: queries 200 recent messages, sends to Haiku, extracts 3-5 patterns, inserts as candidates |
| Daily 6am UTC | Daily metrics aggregation |

---

## Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `workers/assess/src/index.js` | ~1604 | Worker: chat logic, endpoints, D1 ops, admin API, RAG |
| `workers/assess/wrangler.toml` | — | Bindings (KV, D1, Vectorize, AI), env vars, cron |
| `workers/assess/migrations/0001_initial.sql` | — | D1 schema (8 tables) |
| `chat-bubble.js` | ~1079 | Frontend: DOM injection, email gate, streaming, UI cards |
| `workers/assess/scripts/ingest.js` | — | Content ingestion for Vectorize |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API calls |
| `DISCORD_WEBHOOK` | Lead notification fallback |
| `OPENCLAW_WEBHOOK` | Primary lead routing |
| `OPENCLAW_WEBHOOK_TOKEN` | OpenClaw auth |
| `MAIL_DESTINATION` | Email notifications (`hi@briu.ai`) |
| `ALLOWED_ORIGIN` | CORS (`https://briu.ai`) |
| `ADMIN_TOKEN` | Admin API bearer token |
