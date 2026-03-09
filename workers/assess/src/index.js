/**
 * Briu Conversational Agent — Cloudflare Worker
 * Multi-turn conversation with prompt caching, keyword-based content
 * retrieval, and conversation summarization for cost efficiency.
 */

// ─── Core identity prompt (always sent, ~400 tokens) ───
const CORE_PROMPT = `You are Briu's on-site guide. Warm, direct, specific — sound like a thoughtful founder, not a sales bot. Reference real numbers and pages naturally. Ask good questions before recommending. Never pressure.

Briu (Catalan: energy, push, courage) deploys AI agents for businesses on their own infrastructure, their own API keys. Founded by Lucas Cairns, Co-Founder of Subsights. No vendor lock-in, no margin on token spend.

## Response Format
Every response MUST be valid JSON with this structure:
{"text":"Your conversational message here.","actions":[...]}

The "text" field contains your natural response (2-4 short sentences, no markdown). Use [link text](/path/) for page links.

The "actions" array contains UI components the frontend will render. Available action types:

1. Quick replies — suggested responses the visitor can click:
{"type":"replies","options":["Tell me about pricing","What can agents do?","How did you build this?"]}

2. Page card — highlight a relevant page:
{"type":"page","title":"The Real Numbers","desc":"Every dollar we spent building our agent system","path":"/build/the-real-numbers/"}

3. Estimate card — show a rough cost/scope:
{"type":"estimate","label":"Your starting point","items":[{"name":"Founder Kickoff","cost":"$3,500"},{"name":"Email agent (API)","cost":"~$3-5/day"},{"name":"Platform","cost":"$200/mo"}]}

4. Collect info — request specific information:
{"type":"collect","field":"company","label":"What's your company name?","placeholder":"Company name"}
Fields: "company", "name", "email", "website", "workflow" (free text about their process)

5. Progress — show qualification progress (0-100):
{"type":"progress","value":40,"label":"Understanding your needs"}

6. Handoff — trigger the send-to-team flow:
{"type":"handoff","message":"Ready to connect you with Lucas"}

7. Company pitch — personalized pitch for a specific company (use after domain lookup):
{"type":"pitch","company":"Acme Corp","domain":"acme.com","points":["Email triage across your support team","CRM automation for your sales pipeline","Weekly reporting dashboards"],"estimate":{"tier":"Team Kickoff","build":"$5,000","monthly":"$250-400/mo"}}

## Action Guidelines
- ALWAYS include "replies" on every response (2-3 contextual suggestions + one like "Tell me more about X")
- Show "progress" periodically — start at 20 after quiz, increase as you learn more (company, workflow, tools, team)
- Use "page" when referencing a specific part of the site
- Use "estimate" only after you understand their situation enough to suggest a tier
- Use "collect" naturally when you need info: ask for company early, workflow mid-conversation, email/name only when ready to hand off
- Use "handoff" when the visitor has shared enough context OR explicitly wants to connect
- Keep actions relevant — don't overload. 2-3 actions per response max.

## Qualification Flow
Track what you know. You want to learn: role (from quiz), team size (from quiz), primary interest (from quiz), company/industry, specific workflow they want automated, current tools, and their timeline/urgency. Progress should reflect how much you've gathered:
20 = quiz only, 40 = know company/industry, 60 = understand specific workflow, 80 = discussed scope/pricing, 100 = ready to hand off.

Never say "I'm an AI." Keep text under 120 words.`;

// ─── Content chunks (selected by keyword matching) ───
const CHUNKS = {
  pricing: `Services & Pricing:
Founder Kickoff $3,500 — solo founders & small teams, 2-3hr working session, workflow mapping, first agent deployed, written architecture plan.
Team Kickoff $5,000 — multiple stakeholders, 4-5hr engagement, full team AI briefing, exec sessions, live demos, first agent deployed.
Implementation — quoted per project, scoped from kickoff, built on your infrastructure with your API keys.
Partnership Retainer from $500/mo — maintenance, monitoring, cost optimization, model upgrades. Expanded: proactive development, strategy sessions, training.
Trust: You own everything. No margin on costs. Approval gates on every action. If you stop working with Briu, everything keeps running.`,

  economics: `Economics:
Agent API costs: $2-5/day practical, $10-20/day moderate, $30-100/day frontier. Platform ~$200/mo (Claude Max) shared across all agents.
Briu's own agent: $376 total API, 3 days to production. Month-one all-in ~$711. Traditional equivalent $40-75K+. 30x less, 7x faster.
Brand identity: one evening, 400+ Midjourney generations, ~$120 total. 12 agent skills, 8 tools integrated, 354+ commits.
"When do tokens outpace the salary of the employee? You're about to hit it." — Chamath Palihapitiya, All-In E261`,

  capabilities: `What Agents Do:
Email management — inbox triage, draft responses, follow-ups across multiple accounts. Nothing sends without approval.
CRM & Sales — HubSpot/Salesforce updates, lead scoring, Apollo prospecting, personalized outreach. $0.60-0.70/run.
Personal assistants — email, calendar, contacts, daily briefings. WhatsApp, Slack, Discord. 24/7.
Reporting — daily/weekly reports, PDF generation, cost tracking, anomaly alerts.
Operations — multi-agent orchestration, overnight processing, morning briefings.
Integrations: Gmail, Slack, Discord, WhatsApp, Notion, Calendar, HubSpot, GitHub, Salesforce, Apollo, +100 more via OpenClaw.`,

  proof: `Proof Points & Quotes:
"Out of 50 hours a producer does a week, this does 40 of them. And of what an SDR does, this does 95%." — Calacanis, E259
"They don't forget to do work. They don't make mistakes. Once you put this in, you don't need checklists." — Calacanis, E261
Calacanis deployed agents across 20-person venture firm. Each person got their own agent with email, Slack, CRM. Master agent manages others.
Mark Cuban called it "the smartest counter I've seen to AI taking over jobs." His math: 8 agents at $300/day > employee cost — but $300/day is frontier, not starting point.`,

  build: `Build Dashboard (/build/):
Live operating dashboard — every cost, timeline event, metric. Filterable timeline.
Real Numbers (/build/the-real-numbers/): Daily spend charts, model breakdown (Sonnet 47%, Opus 6%, Haiku 2%), traditional cost comparison.
Building with Agents (/build/how-we-built-briu-using-our-own-agent-stack/): Exact toolchain, security model. "The agent cannot feel the gap between 'correct' and 'right.'"
Brand in a Session (/build/brand-in-a-session/): Claude + Midjourney + OpenClaw, one evening, ~$120.
Security: every skill built in-house, defined scopes, internal security agent audits access patterns. Multi-agent architecture with model routing.`,

  whynow: `Why Now (/why-now/):
Founder essay on deploying agents now. Key arguments:
Agents as capital investment, not operating expense — every email triaged teaches patterns, every CRM update teaches deal flow. Knowledge is permanent, doesn't leave when employee quits.
Cost curves falling — $300/day is the most you'll ever pay for this capability. Models get cheaper every quarter.
Competitive advantage compounds — businesses that start now build 3 compounding advantages.
Framework is open source (OpenClaw). One developer built it using an AI coding agent.`,

  pages: `Site Pages:
/ — Homepage: economics calculator, proof stats, integrations, assessment quiz, FAQ
/services/ — Engagement arc (Discovery→Build→Transfer→Partnership), all pricing, capabilities, trust commitments
/why-now/ — Founder case for acting now, economics, industry quotes
/build/ — Live dashboard, every cost and timeline event
/build/the-real-numbers/ — Interactive cost charts
/build/brand-in-a-session/ — Brand case study
/build/how-we-built-briu-using-our-own-agent-stack/ — Full build narrative`
};

// ─── Keyword → chunk mapping ───
const TOPIC_MAP = {
  pricing: ['price', 'pricing', 'cost', 'how much', 'afford', 'expensive', 'cheap', 'budget', 'kickoff', 'retainer', 'tier', 'plan', 'package', 'quote', 'pay', 'investment', 'fee', 'rate', '$'],
  economics: ['economics', 'roi', 'savings', 'save', 'comparison', 'vs', 'versus', 'traditional', 'agency', 'hire', 'hiring', 'employee', 'salary', 'headcount', 'per day', 'api cost', 'token', 'platform', '$376', '$200', 'cheaper'],
  capabilities: ['email', 'crm', 'sales', 'hubspot', 'salesforce', 'slack', 'calendar', 'report', 'prospect', 'outreach', 'automate', 'automation', 'workflow', 'integrate', 'integration', 'tool', 'gmail', 'discord', 'whatsapp', 'agent', 'what can', 'what do', 'capability', 'support', 'assistant'],
  proof: ['proof', 'evidence', 'example', 'case study', 'calacanis', 'cuban', 'chamath', 'quote', 'podcast', 'all-in', 'real world', 'who else', 'testimonial', 'result'],
  build: ['build', 'built', 'how you built', 'your agent', 'open source', 'openclaw', 'security', 'toolchain', 'brand', 'logo', 'midjourney', 'dashboard', 'timeline', 'commit', 'real numbers', 'technical'],
  whynow: ['why now', 'why should', 'timing', 'wait', 'risk', 'competitive', 'advantage', 'future', 'trend', 'market', 'opportunity', 'urgent', 'when', 'depreciate', 'appreciate', 'capital']
};

// Default chunks for first message (when we only have quiz context)
const DEFAULT_CHUNKS = ['pricing', 'capabilities'];

// ─── Domain lookup for work email pitches ───
const DOMAIN_RE = /I work at ([\w.-]+\.\w{2,})/i;

// SSRF protection: block private/reserved IP ranges and internal domains
function isBlockedDomain(domain) {
  const lower = domain.toLowerCase();
  // Block common internal hostnames
  if (['localhost', '127.0.0.1', '0.0.0.0', '[::1]', 'metadata.google.internal'].includes(lower)) return true;
  // Block AWS metadata endpoint
  if (lower === '169.254.169.254') return true;
  // Block .internal, .local, .localhost TLDs
  if (/\.(internal|local|localhost|test|invalid|example)$/i.test(lower)) return true;
  // Block IP addresses entirely (only allow domain names)
  if (/^[\d.]+$/.test(lower) || lower.startsWith('[')) return true;
  return false;
}

async function fetchCompanyInfo(domain) {
  try {
    // Validate domain before fetching
    if (!domain || typeof domain !== 'string' || domain.length > 253) return null;
    if (isBlockedDomain(domain)) return null;
    // Only allow domains with valid TLD (at least 2 chars)
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}$/.test(domain)) return null;

    const res = await fetch('https://' + domain, {
      headers: { 'User-Agent': 'Briu-Agent/1.0' },
      redirect: 'follow', // Cloudflare Workers don't follow to private IPs
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Extract useful text: title, meta description, and first ~1500 chars of visible text
    const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '';
    const metaDesc = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || [])[1] || '';

    // Strip tags, scripts, styles — get visible text
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1500);

    return `Company website (${domain}):
Title: ${title}
Description: ${metaDesc}
Content: ${text}`;
  } catch (e) {
    return null;
  }
}

// ─── Cost estimation formula ───
const COST_ESTIMATE_PROMPT = `
## Cost Estimation Formula
When you know enough about a prospect's needs, estimate costs using this framework:
- Agent complexity: Simple (email triage, notifications) = $2-5/day API | Medium (CRM updates, reporting) = $5-15/day | Complex (multi-step orchestration, research) = $15-50/day
- Platform cost: ~$200/mo shared across all agents
- Build cost: Simple agent = $1-3K | Medium = $3-8K | Complex multi-agent = $8-20K
- Number of agents: multiply daily API cost × agents × 30 for monthly
- Monthly total = (daily API × agents × 30) + platform + retainer ($500-2K/mo)
- Always compare to traditional cost: equivalent hire = $4-8K/mo salary + benefits + training + management overhead

When a work domain is detected, personalize your pitch:
1. Reference what the company actually does (from their website)
2. Suggest 2-3 specific workflows that would apply to their business
3. Estimate a starting package (which tier fits, likely first agent, rough monthly cost)
4. Frame it as: "Here's what I'd pitch if I were sitting across from your team"`;


const ROLE_MAP = { founder: 'Founder/CEO', leader: 'Team Lead/Manager', ic: 'Individual Contributor', exploring: 'Exploring for their company' };
const TEAM_MAP = { solo: 'Solo operator', small: '2-10 person team', medium: '11-50 person team', large: '50+ person company' };
const AI_MAP = { none: 'No AI usage yet', free: 'Using free tools like ChatGPT', paid: 'Paid AI accounts', building: 'Already building agents' };
const FOCUS_MAP = { email: 'Email & communication', sales: 'Sales & prospecting', reporting: 'Reporting & data', ops: 'Operations & admin', support: 'Customer support' };

// ─── Content retrieval ───
function selectChunks(userMessage, maxChunks) {
  if (!userMessage) return DEFAULT_CHUNKS;

  const lower = userMessage.toLowerCase();
  const scores = {};

  for (const [topic, keywords] of Object.entries(TOPIC_MAP)) {
    scores[topic] = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[topic]++;
    }
  }

  // Sort by score, take top N
  const ranked = Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxChunks || 2)
    .map(([topic]) => topic);

  // Always include pages for navigation context if we have room
  if (ranked.length < (maxChunks || 2) && !ranked.includes('pages')) {
    ranked.push('pages');
  }

  return ranked.length > 0 ? ranked : DEFAULT_CHUNKS;
}

function buildSystemPrompt(userMessage, isFirstTurn) {
  const chunkKeys = isFirstTurn
    ? DEFAULT_CHUNKS
    : selectChunks(userMessage, 2);

  const selectedContent = chunkKeys
    .map(key => CHUNKS[key])
    .filter(Boolean)
    .join('\n\n');

  return CORE_PROMPT + '\n\n' + selectedContent;
}

// ─── Conversation management ───
function summarizeHistory(messages) {
  // If conversation is short, send as-is
  if (messages.length <= 8) return messages;

  // Keep first message (quiz context) and last 4 exchanges
  // Summarize the middle preserving structured context
  const first = messages[0];
  const middle = messages.slice(1, -4);
  const recent = messages.slice(-4);

  // Extract structured fields from the middle messages
  let companyName = null;
  const workflows = new Set();
  const concerns = [];
  let teamSize = null;
  let budgetSignal = null;
  const topics = new Set();

  for (const msg of middle) {
    const text = msg.content;
    const lower = text.toLowerCase();

    // Company name — look for "at [Company]", "company is [X]", "we're [X]"
    if (!companyName) {
      const companyMatch = text.match(/(?:at|company is|we're|I'm with|work for|from)\s+([A-Z][\w&. ]{1,30})/i);
      if (companyMatch) companyName = companyMatch[1].trim();
    }

    // Workflows discussed
    if (lower.includes('email')) workflows.add('email');
    if (lower.includes('crm') || lower.includes('salesforce') || lower.includes('hubspot')) workflows.add('CRM');
    if (lower.includes('report')) workflows.add('reporting');
    if (lower.includes('sales') || lower.includes('prospect') || lower.includes('outreach')) workflows.add('sales/prospecting');
    if (lower.includes('support') || lower.includes('ticket')) workflows.add('support');
    if (lower.includes('slack') || lower.includes('discord')) workflows.add('team messaging');
    if (lower.includes('calendar') || lower.includes('scheduling')) workflows.add('scheduling');

    // Budget/pricing signals
    if (!budgetSignal) {
      if (lower.includes('budget') || lower.includes('afford') || lower.includes('expensive')) budgetSignal = 'cost-sensitive';
      else if (lower.match(/\$[\d,]+/) || lower.includes('willing to spend') || lower.includes('invest')) budgetSignal = 'has budget';
      else if (lower.includes('cheap') || lower.includes('free')) budgetSignal = 'low-budget';
    }

    // Team size
    if (!teamSize) {
      const sizeMatch = lower.match(/(\d+)\s*(?:people|person|employees|team members|engineers|devs)/);
      if (sizeMatch) teamSize = sizeMatch[1] + ' people';
    }

    // Concerns/objections
    if (msg.role === 'user') {
      if (lower.includes('concern') || lower.includes('worried') || lower.includes('risk') || lower.includes('security') || lower.includes('privacy')) {
        concerns.push(lower.includes('security') || lower.includes('privacy') ? 'security/privacy' : 'general concerns');
      }
      if (lower.includes('not sure') || lower.includes('skeptic') || lower.includes("don't know if")) {
        concerns.push('uncertainty');
      }
    }

    // Topic coverage
    if (lower.includes('price') || lower.includes('cost') || lower.includes('$')) topics.add('pricing');
    if (lower.includes('agent') || lower.includes('automate')) topics.add('capabilities');
    if (lower.includes('built') || lower.includes('build')) topics.add('build process');
  }

  // Build structured summary
  const parts = [];
  if (companyName) parts.push('Company: ' + companyName);
  if (teamSize) parts.push('Team: ' + teamSize);
  if (workflows.size > 0) parts.push('Workflows discussed: ' + Array.from(workflows).join(', '));
  if (budgetSignal) parts.push('Budget signal: ' + budgetSignal);
  if (concerns.length > 0) parts.push('Concerns: ' + [...new Set(concerns)].join(', '));
  parts.push('Topics covered: ' + (topics.size > 0 ? Array.from(topics).join(', ') : 'general exploration'));
  parts.push('(' + middle.length + ' messages summarized)');

  const summaryText = parts.join(' | ');

  return [
    first,
    { role: 'user', content: '[Context note: ' + summaryText + ']' },
    { role: 'assistant', content: 'Understood, continuing our conversation.' },
    ...recent
  ];
}

function generateSessionId() {
  return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

// ─── Main handler ───
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || 'https://briu.ai';

    const corsHeaders = {
      'Access-Control-Allow-Origin': origin === allowed || origin === 'http://localhost:8788' || origin === 'http://localhost:3000' ? origin : allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Rate limiting (uses KV if bound, otherwise in-memory Map)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    {
      const key = `rate:${ip}`;
      let count = 0;
      if (env.RATE_LIMIT) {
        count = parseInt(await env.RATE_LIMIT.get(key) || '0');
      } else {
        // In-memory fallback (per-isolate, not perfect but better than nothing)
        if (!globalThis._rateLimits) globalThis._rateLimits = new Map();
        const entry = globalThis._rateLimits.get(key);
        if (entry && Date.now() - entry.ts < 3600000) count = entry.count;
        else globalThis._rateLimits.delete(key);
      }
      if (count >= 20) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (env.RATE_LIMIT) {
        await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 3600 });
      } else {
        globalThis._rateLimits.set(key, { count: count + 1, ts: Date.now() });
      }
    }

    try {
      const body = await request.json();

      if (path === '/api/chat' || path === '/') {
        return await handleChat(body, env, corsHeaders);
      }

      if (path === '/api/send') {
        return await handleSend(body, env, corsHeaders);
      }

      if (path === '/api/company') {
        return await handleCompanyLookup(body, corsHeaders);
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (e) {
      console.error('Worker error:', e);
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

async function handleChat(body, env, corsHeaders) {
  const { messages = [], quiz, page, email, company } = body;

  // Build conversation messages
  const apiMessages = [];

  // Quiz context as first message
  if (quiz && quiz.q1) {
    const context = `[Visitor context from quiz — page: ${page || '/'}]
Role: ${ROLE_MAP[quiz.q1] || quiz.q1}
Team size: ${TEAM_MAP[quiz.q2] || quiz.q2}
Current AI usage: ${AI_MAP[quiz.q3] || quiz.q3}
Primary interest: ${FOCUS_MAP[quiz.q4] || quiz.q4}`;
    apiMessages.push({ role: 'user', content: context });
  }

  // Add conversation history (with summarization for long conversations)
  const recent = messages.slice(-20);
  for (const msg of recent) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      apiMessages.push({ role: msg.role, content: msg.content });
    }
  }

  if (apiMessages.length === 0) {
    return new Response(JSON.stringify({ error: 'No messages provided' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Summarize if conversation is long
  const managedMessages = summarizeHistory(apiMessages);

  // Get the latest user message for chunk selection
  const lastUserMsg = [...managedMessages].reverse().find(m => m.role === 'user');
  const isFirstTurn = managedMessages.length <= 2;
  const lastText = lastUserMsg ? lastUserMsg.content : '';

  // Check if an estimate or pitch was already given in previous messages
  const estimateAlreadyGiven = managedMessages.some(m =>
    m.role === 'assistant' && (m.content.includes('"type":"estimate"') || m.content.includes('"type":"pitch"'))
  );

  // Company context — use pre-fetched data from frontend, or detect from message
  let companyContext = '';
  const costPrompt = estimateAlreadyGiven ? '' : '\n' + COST_ESTIMATE_PROMPT;
  if (company && company.found) {
    companyContext = '\n\nCompany: ' + company.name + ' (' + company.domain + ')' +
      (company.description ? '\nDescription: ' + company.description : '') +
      (company.industries ? '\nIndustry: ' + company.industries.join(', ') : '') +
      (company.workflows ? '\nSuggested workflows: ' + company.workflows.join(', ') : '') +
      '\nVisitor email: ' + (email || 'not provided') +
      costPrompt;
  } else {
    const domainMatch = lastText.match(DOMAIN_RE);
    if (domainMatch) {
      const domain = domainMatch[1];
      const info = await fetchCompanyInfo(domain);
      if (info) {
        companyContext = '\n\n' + info + costPrompt;
      } else {
        companyContext = (costPrompt ? '\n\n' + COST_ESTIMATE_PROMPT : '') +
          '\n\nNote: Could not fetch ' + domain + ' — ask the visitor to describe their business instead.';
      }
    }
  }

  // Build system prompt with relevant chunks only
  const dynamicContent = buildSystemPrompt(lastText, isFirstTurn)
    .replace(CORE_PROMPT + '\n\n', '') + companyContext;

  // Use prompt caching for the stable core prompt
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-4-sonnet-20250514',
      max_tokens: 800,
      system: [
        {
          type: 'text',
          text: CORE_PROMPT,
          cache_control: { type: 'ephemeral' }
        },
        {
          type: 'text',
          text: dynamicContent
        }
      ],
      messages: managedMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Claude API error:', response.status, err);
    return new Response(JSON.stringify({ error: 'AI service temporarily unavailable. Please try again.' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text || '';

  // Parse structured response from Claude
  let parsed;
  try {
    // Try to parse as JSON directly
    parsed = JSON.parse(rawText);
  } catch (e) {
    // If Claude didn't return valid JSON, extract what we can
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[0]); } catch (e2) {}
    }
  }

  // Normalize response
  const sid = body.sessionId || generateSessionId();
  const result = {
    text: parsed?.text || rawText,
    actions: Array.isArray(parsed?.actions) ? parsed.actions : [],
    sessionId: sid,
    usage: data.usage || null,
  };

  // Store conversation in KV (non-blocking)
  if (env.CONVERSATIONS) {
    const convRecord = {
      sessionId: sid,
      email: email || null,
      company: company ? { name: company.name, domain: company.domain, industries: company.industries } : null,
      quiz,
      page,
      messages: messages.concat([{ role: 'assistant', content: result.text }]),
      updatedAt: new Date().toISOString(),
    };
    // Fire and forget — don't block the response
    env.CONVERSATIONS.put('conv:' + sid, JSON.stringify(convRecord), { expirationTtl: 2592000 }) // 30 days
      .catch(e => console.error('KV write error:', e));
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleSend(body, env, corsHeaders) {
  const { name, email, summary, messages = [], company, quiz } = body;

  if (!email || !summary) {
    return new Response(JSON.stringify({ error: 'Email and summary required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let conversationLog = '';
  for (const msg of messages) {
    const label = msg.role === 'user' ? 'Visitor' : 'Briu';
    conversationLog += `${label}: ${msg.content}\n\n`;
  }

  const emailBody = `New lead from briu.ai conversation agent

Name: ${name || 'Not provided'}
Email: ${email}

Summary:
${summary}

Full Conversation:
${conversationLog}`;

  // Compute quality score early so we can include it in webhook payloads
  let qualityScore = 0;
  if (name) qualityScore += 10;
  if (email) qualityScore += 15;
  if (summary) qualityScore += 10;
  if (company && company.name) qualityScore += 15;
  if (company && company.domain) qualityScore += 10;
  if (company && company.industries && company.industries.length > 0) qualityScore += 10;
  if (company && company.workflows && company.workflows.length > 0) qualityScore += 10;
  if (quiz && quiz.q1) qualityScore += 5;
  if (quiz && quiz.q2) qualityScore += 5;
  if (quiz && quiz.q4) qualityScore += 5;
  if (messages.length >= 4) qualityScore += 5;

  // Send to OpenClaw agent (primary) — structured lead payload
  if (env.OPENCLAW_WEBHOOK) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (env.OPENCLAW_WEBHOOK_TOKEN) {
        headers['Authorization'] = 'Bearer ' + env.OPENCLAW_WEBHOOK_TOKEN;
      }
      await fetch(env.OPENCLAW_WEBHOOK, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'lead',
          name: name || email.split('@')[0],
          email,
          summary,
          company: company ? {
            name: company.name || null,
            domain: company.domain || null,
            industries: company.industries || [],
            workflows: company.workflows || [],
          } : null,
          quiz: quiz || null,
          qualityScore,
          messages,
          createdAt: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(10000),
      });
    } catch (e) {
      console.error('OpenClaw webhook error:', e);
    }
  }

  // Discord fallback (if no OpenClaw webhook, or as secondary notification)
  if (env.DISCORD_WEBHOOK && !env.OPENCLAW_WEBHOOK) {
    const sanitize = (s) => (s || '').replace(/@(everyone|here)/gi, '[at-$1]').replace(/```/g, '').slice(0, 1024);
    const lastFewMessages = messages.slice(-6).map(m =>
      `${m.role === 'user' ? '👤' : '🤖'} ${sanitize(m.content)}`
    ).join('\n');
    const safeName = sanitize(name || email.split('@')[0]);
    const safeEmail = sanitize(email);
    const safeSummary = sanitize(summary);

    await fetch(env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🔔 **HANDOFF: New lead from briu.ai**`,
        embeds: [{
          title: `${safeName} wants to talk`,
          color: 0xd4a05a,
          fields: [
            { name: 'Email', value: safeEmail, inline: true },
            { name: 'Context', value: safeSummary.slice(0, 200), inline: false },
            { name: 'Recent Conversation', value: lastFewMessages.slice(0, 900) || 'No messages', inline: false },
          ],
          footer: { text: `Action: Draft a follow-up email for ${safeEmail} based on their conversation. Suggest specific next steps and pricing.` },
        }],
      }),
    });
  }

  if (env.MAIL_DESTINATION) {
    try {
      await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: env.MAIL_DESTINATION || 'hi@briu.ai' }] }],
          from: { email: 'agent@briu.ai', name: 'Briu Agent' },
          subject: `New inquiry from briu.ai conversation — ${name || email}`,
          content: [{ type: 'text/plain', value: emailBody }],
        }),
      });
    } catch (e) {
      console.error('Email send failed:', e);
    }
  }

  // Store lead in KV
  if (env.CONVERSATIONS) {
    const leadRecord = {
      type: 'lead',
      name,
      email,
      summary,
      company: company ? {
        name: company.name || null,
        domain: company.domain || null,
        industries: company.industries || [],
        workflows: company.workflows || [],
      } : null,
      quiz: quiz || null,
      qualityScore,
      messages,
      createdAt: new Date().toISOString(),
    };
    env.CONVERSATIONS.put('lead:' + Date.now() + '_' + email, JSON.stringify(leadRecord), { expirationTtl: 2592000 }) // 30 days
      .catch(e => console.error('KV lead write error:', e));
  }

  return new Response(JSON.stringify({ sent: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ─── Company lookup (no Claude call — just fetch + parse) ───
async function handleCompanyLookup(body, corsHeaders) {
  const { domain } = body;
  if (!domain || typeof domain !== 'string') {
    return new Response(JSON.stringify({ error: 'Domain required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate domain format before attempting fetch
  if (isBlockedDomain(domain) || !/^[a-zA-Z0-9]([a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}$/.test(domain)) {
    return new Response(JSON.stringify({ found: false, domain }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const info = await fetchCompanyInfo(domain);
  if (!info) {
    return new Response(JSON.stringify({ found: false, domain }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Extract structured data from the raw text
  const titleMatch = info.match(/Title: (.+)/);
  const descMatch = info.match(/Description: (.+)/);
  const contentMatch = info.match(/Content: ([\s\S]+)/);
  const content = (contentMatch ? contentMatch[1] : '').toLowerCase();

  // Detect industry keywords
  const industries = [];
  const industryMap = {
    'saas': ['saas', 'software', 'platform', 'app', 'cloud', 'api'],
    'ecommerce': ['shop', 'store', 'ecommerce', 'e-commerce', 'retail', 'product', 'cart', 'shipping'],
    'finance': ['finance', 'fintech', 'banking', 'investment', 'payments', 'insurance', 'accounting'],
    'healthcare': ['health', 'medical', 'patient', 'clinic', 'care', 'wellness', 'pharma'],
    'marketing': ['marketing', 'agency', 'brand', 'creative', 'advertising', 'media', 'content'],
    'consulting': ['consulting', 'advisory', 'strategy', 'management consulting'],
    'real-estate': ['real estate', 'property', 'properties', 'rental', 'leasing', 'realty'],
    'legal': ['law', 'legal', 'attorney', 'lawyer', 'firm'],
    'education': ['education', 'learning', 'training', 'course', 'university', 'school'],
    'recruiting': ['recruit', 'hiring', 'talent', 'staffing', 'hr', 'human resources'],
  };

  for (const [industry, keywords] of Object.entries(industryMap)) {
    for (const kw of keywords) {
      if (content.includes(kw)) {
        if (!industries.includes(industry)) industries.push(industry);
        break;
      }
    }
  }

  // Suggest agent workflows based on industry
  const workflowMap = {
    'saas': ['Customer onboarding emails', 'Support ticket triage', 'Usage reporting'],
    'ecommerce': ['Order status updates', 'Customer inquiry routing', 'Inventory alerts'],
    'finance': ['Client reporting', 'Compliance document drafting', 'Transaction monitoring'],
    'healthcare': ['Appointment scheduling', 'Patient follow-ups', 'Insurance verification'],
    'marketing': ['Client reporting', 'Campaign performance summaries', 'Content calendar management'],
    'consulting': ['Client communication', 'Proposal drafting', 'Project status updates'],
    'real-estate': ['Lead follow-ups', 'Showing scheduling', 'Market report generation'],
    'legal': ['Document review triage', 'Client intake', 'Deadline tracking'],
    'education': ['Student communication', 'Enrollment follow-ups', 'Content scheduling'],
    'recruiting': ['Candidate outreach', 'Interview scheduling', 'Pipeline updates'],
  };

  const suggestedWorkflows = [];
  for (const ind of industries.slice(0, 2)) {
    if (workflowMap[ind]) {
      for (const wf of workflowMap[ind]) {
        if (!suggestedWorkflows.includes(wf)) suggestedWorkflows.push(wf);
      }
    }
  }

  // Fallback workflows if no industry detected
  if (suggestedWorkflows.length === 0) {
    suggestedWorkflows.push('Email triage & response drafting', 'Weekly reporting', 'CRM updates & follow-ups');
  }

  return new Response(JSON.stringify({
    found: true,
    domain,
    name: (titleMatch ? titleMatch[1] : domain).replace(/ [-–|].*/g, '').trim(),
    description: descMatch ? descMatch[1] : '',
    industries: industries.slice(0, 3),
    workflows: suggestedWorkflows.slice(0, 4),
    raw: info.slice(0, 500),
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
