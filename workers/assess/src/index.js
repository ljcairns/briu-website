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
const DEFAULT_CHUNKS = ['pricing', 'capabilities', 'pages'];

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
  // Summarize the middle as a context note
  const first = messages[0];
  const middle = messages.slice(1, -4);
  const recent = messages.slice(-4);

  let summaryText = 'Previous discussion covered: ';
  const topics = new Set();
  for (const msg of middle) {
    const lower = msg.content.toLowerCase();
    if (lower.includes('price') || lower.includes('cost') || lower.includes('$')) topics.add('pricing');
    if (lower.includes('email') || lower.includes('agent') || lower.includes('automate')) topics.add('capabilities');
    if (lower.includes('built') || lower.includes('build')) topics.add('build process');
    if (lower.includes('team') || lower.includes('company')) topics.add('their business context');
  }
  summaryText += Array.from(topics).join(', ') || 'general exploration';
  summaryText += '. (' + middle.length + ' messages summarized)';

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
      'Access-Control-Allow-Origin': origin === allowed || origin.startsWith('http://localhost') || origin.endsWith('.workers.dev') ? origin : allowed,
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

    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (env.RATE_LIMIT) {
      const key = `rate:${ip}`;
      const count = parseInt(await env.RATE_LIMIT.get(key) || '0');
      if (count >= 30) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 3600 });
    }

    try {
      const body = await request.json();

      if (path === '/api/chat' || path === '/') {
        return await handleChat(body, env, corsHeaders);
      }

      if (path === '/api/send') {
        return await handleSend(body, env, corsHeaders);
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
  const { messages = [], quiz, page } = body;

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

  // Build system prompt with relevant chunks only
  const systemPrompt = buildSystemPrompt(
    lastUserMsg ? lastUserMsg.content : '',
    isFirstTurn
  );

  // Use prompt caching for the stable core prompt
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 600,
      system: [
        {
          type: 'text',
          text: CORE_PROMPT,
          cache_control: { type: 'ephemeral' }
        },
        {
          type: 'text',
          text: buildSystemPrompt(lastUserMsg ? lastUserMsg.content : '', isFirstTurn)
            .replace(CORE_PROMPT + '\n\n', '') // Only the dynamic chunk part
        }
      ],
      messages: managedMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Claude API error:', response.status, err);
    return new Response(JSON.stringify({ error: 'AI service unavailable', status: response.status, detail: err.slice(0, 200) }), {
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
  const result = {
    text: parsed?.text || rawText,
    actions: Array.isArray(parsed?.actions) ? parsed.actions : [],
    sessionId: body.sessionId || generateSessionId(),
    usage: data.usage || null,
  };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleSend(body, env, corsHeaders) {
  const { name, email, summary, messages = [] } = body;

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

  if (env.DISCORD_WEBHOOK) {
    await fetch(env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**New Lead from briu.ai**\n**Name:** ${name || 'Not provided'}\n**Email:** ${email}\n\n**Summary:**\n${summary}`,
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

  return new Response(JSON.stringify({ sent: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
