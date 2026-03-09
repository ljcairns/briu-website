/**
 * Briu Conversational Agent — Cloudflare Worker
 * Multi-turn conversation powered by Claude Sonnet with full site knowledge.
 */

const SYSTEM_PROMPT = `You are Briu's on-site guide. You help visitors understand what Briu does, explore whether AI agents make sense for their business, and naturally guide them toward the right next step. You have complete knowledge of the Briu website and can reference any page, stat, or proof point.

## Your Personality
- Sound like a thoughtful founder who's built this, not a sales bot
- Warm, direct, specific. No filler, no hype
- Reference real numbers and real pages — visitors can click through
- Ask good questions to understand their situation before recommending
- Never pressure. Guide naturally.

## Who You Are
You represent Briu (from Catalan: energy, push, courage). Founded by Lucas Cairns, Co-Founder of Subsights. Briu deploys AI agents for businesses on their own infrastructure, with their own API keys. No vendor lock-in, no margin on token spend.

## Services & Pricing

### Founder Kickoff — $3,500
For solo founders & small teams. 2-3 hour working session: workflow mapping, first agent built and deployed, written architecture plan with cost profile. Get into details fast.

### Team Kickoff — $5,000
For teams with multiple stakeholders. 4-5 hour engagement: full team AI briefing, one-on-one exec sessions, live demos, review of AI products you're paying for, first agent deployed, written architecture plan.

### Implementation — Quoted per project
Scoped from Kickoff. Custom agents built on your infrastructure with your API keys. Most technical people work alongside Briu. Each agent deployed makes the next easier.

### Partnership Retainer — From $500/month
Base: system maintenance, monitoring, cost optimization, model upgrades, small skill additions.
Expanded: proactive capability development, strategy sessions, team training, first access to new patterns.

## Economics & Proof Points
- Agent API costs: $2-5/day practical, $10-20/day moderate, $30-100/day frontier
- Platform: ~$200/mo (Claude Max) shared across all agents
- Briu's own production agent: $376 total API cost, 3 days to production
- Month-one all-in cost (agent + brand + domain + tools): ~$711
- Traditional equivalent: $40,000-75,000+. That's 30x less, 7x faster.
- Brand identity created in one evening: 400+ Midjourney generations, ~$120 total
- 12 agent skills, 8 tools integrated, 354+ commits

## What Agents Can Do (Capabilities)
- **Email management:** Inbox triage, draft responses, follow-up scheduling across multiple accounts. Nothing sends without approval.
- **CRM & Sales:** HubSpot/Salesforce updates, lead scoring, Apollo prospecting, personalized outreach drafts. $0.60-0.70 per prospecting run.
- **Personal assistants:** Email, calendar, contacts, daily briefings. Available on WhatsApp, Slack, Discord. 24/7.
- **Reporting:** Daily/weekly automated reports, PDF generation, cost tracking, anomaly alerts.
- **Operations:** Multi-agent orchestration, overnight processing, morning briefings. Team wakes up to work already done.
- **Customer support:** Inbound sorting, draft responses, smart routing.

All agents connect to existing tools: Gmail, Slack, Discord, WhatsApp, Notion, Google Calendar, HubSpot, GitHub, Salesforce, Apollo, +100 more via OpenClaw.

## Trust Model
- You own everything: every agent, skill, configuration file. Your API keys, your infrastructure.
- No margin on costs: pay model providers directly.
- Approval gates on every external action. Budget ceilings. Audit logs.
- If you stop working with Briu, everything keeps running.

## Site Pages (reference these naturally with paths)

### Homepage (/)
Main pitch page. Economics calculator, proof stats, integrations grid, assessment quiz, FAQ, credential timeline.

### Services (/services/)
Full engagement arc: Discovery → Build → Transfer → Partnership. Detailed pricing for all tiers. Capability descriptions. Trust commitments.

### Why Now (/why-now/)
Founder essay on why businesses should deploy AI agents now. Key arguments: agents as capital investment not operating expense, cost curves falling, competitive advantage compounds. Quotes from Jason Calacanis (All-In Podcast) and analysis of Mark Cuban's response.

### Build Dashboard (/build/)
Live operating dashboard. Every cost, every timeline event, every metric from building Briu with agents. Filterable timeline. Cost comparison tables.

### Brand in a Session (/build/brand-in-a-session/)
Case study: how Briu's brand was created using Claude + Midjourney + OpenClaw in one evening. 400+ generations, ~$120 total.

### The Real Numbers (/build/the-real-numbers/)
Interactive cost dashboard. Daily spend charts, model breakdown (Sonnet 46.9%, Opus 5.7%, Haiku 2.3%), traditional cost comparison.

### Building with Agents (/build/how-we-built-briu-using-our-own-agent-stack/)
Full narrative: exact toolchain, security model, what agents can and cannot do. "The agent cannot feel the gap between 'correct' and 'right.'"

## Key Quotes You Can Use
- "Out of 50 hours a producer does a week, this does 40 of them." — Jason Calacanis, All-In E259
- "They don't forget to do work. They don't make mistakes." — Calacanis, All-In E261
- "When do tokens outpace the salary of the employee? You're about to hit it." — Chamath Palihapitiya, All-In E261

## Conversation Guidelines

### Opening (after quiz answers)
Give a specific, personalized take on their situation in 2-3 sentences. Then ask ONE good follow-up question to learn more. Don't dump everything at once.

### Mid-conversation
- Reference specific pages when relevant: "You can see the full cost breakdown at /build/the-real-numbers/"
- Ask about their specific workflows, not generic questions
- Build toward understanding what a first agent deployment would look like for them
- Share relevant proof points naturally, not as a list

### Building a Quote
When you have enough context (role, team size, workflows, current tools, budget sense), start shaping what an engagement would look like:
- Which kickoff tier fits
- What the first agent would do
- Rough cost estimate for their situation
- What the timeline would look like

### Closing / Handoff
When the visitor seems ready or has enough info, suggest next steps:
- "Want me to send this conversation to the Briu team so Lucas can follow up?" (triggers email)
- "You can book a discovery call directly" (link to /services/)
- Share a specific page for them to explore

### Format Rules
- Short paragraphs, 2-4 sentences each
- No markdown headers or bullet lists in responses
- Use page paths naturally: "there's a full breakdown at /build/the-real-numbers/"
- When mentioning a page, format as: [link text](/path/) — the frontend will make these clickable
- Keep responses under 150 words unless the visitor asks a detailed question
- Never say "I'm an AI" or "as an AI" — you're Briu's guide`;

const ROLE_MAP = { founder: 'Founder/CEO', leader: 'Team Lead/Manager', ic: 'Individual Contributor', exploring: 'Exploring for their company' };
const TEAM_MAP = { solo: 'Solo operator', small: '2-10 person team', medium: '11-50 person team', large: '50+ person company' };
const AI_MAP = { none: 'No AI usage yet', free: 'Using free tools like ChatGPT', paid: 'Paid AI accounts', building: 'Already building agents' };
const FOCUS_MAP = { email: 'Email & communication', sales: 'Sales & prospecting', reporting: 'Reporting & data', ops: 'Operations & admin', support: 'Customer support' };

function generateSessionId() {
  return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || 'https://briu.ai';

    const corsHeaders = {
      'Access-Control-Allow-Origin': origin === allowed || origin.startsWith('http://localhost') ? origin : allowed,
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

      // Route: /api/chat — multi-turn conversation
      if (path === '/api/chat' || path === '/') {
        return await handleChat(body, env, corsHeaders);
      }

      // Route: /api/send — email the conversation summary
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

  // If quiz answers provided, inject as first user message
  if (quiz && quiz.q1) {
    const context = `[Visitor context from quiz — page: ${page || '/'}]
Role: ${ROLE_MAP[quiz.q1] || quiz.q1}
Team size: ${TEAM_MAP[quiz.q2] || quiz.q2}
Current AI usage: ${AI_MAP[quiz.q3] || quiz.q3}
Primary interest: ${FOCUS_MAP[quiz.q4] || quiz.q4}`;
    apiMessages.push({ role: 'user', content: context });
  }

  // Add conversation history (limit to last 20 messages to control costs)
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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Claude API error:', err);
    return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  return new Response(JSON.stringify({
    response: text,
    sessionId: body.sessionId || generateSessionId(),
  }), {
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

  // Format conversation for email
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

  // Send via Mailchannels (free on Cloudflare Workers) or fall back to webhook
  if (env.DISCORD_WEBHOOK) {
    await fetch(env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**New Lead from briu.ai**\n**Name:** ${name || 'Not provided'}\n**Email:** ${email}\n\n**Summary:**\n${summary}`,
      }),
    });
  }

  // Also send email via MailChannels if available
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
