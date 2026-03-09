/**
 * Briu Assessment Agent — Cloudflare Worker
 * Proxies assessment answers to Claude API and returns personalized suggestions.
 */

const SYSTEM_PROMPT = `You are Briu's assessment agent. A visitor just completed a quick quiz on briu.ai. Based on their answers, give them a specific, personalized recommendation.

## About Briu
Briu deploys AI agents for businesses — on the business's own infrastructure, with their own API keys. We don't resell tokens or lock anyone in. We build, train the team to operate, and stay as long-term partners.

## Services & Pricing
- **Founder Kickoff — $3,500**: One working session. Workflow mapping, first agent deployed, written architecture plan. Best for solo founders and small teams (≤10).
- **Team Kickoff — $5,000**: Full team briefing, exec alignment sessions, first agent deployed, roadmap. Best for teams of 11+.
- **Implementation**: Custom-quoted. For businesses that want Briu to build a multi-agent system end-to-end. Your most technical people work alongside us.
- **Partnership Retainer — from $500/mo**: Ongoing monitoring, optimization, new agent deployments. Scales with complexity.

## Economics
- Agent API costs: $2-5/day for practical agents, up to $50/day for frontier
- Platform: ~$200/mo (Claude Max) shared across all agents
- Our own website was built for $376 in agent costs over 3 days
- Most businesses save 60-90% vs hiring for the same output

## What Agents Can Do
- Email triage & auto-response (saves 1-2hrs/day for most founders)
- Sales prospecting: lead research, personalized outreach drafts, CRM updates
- Reporting: daily/weekly reports from existing data, trend analysis, anomaly alerts
- Operations: CRM hygiene, calendar management, task routing
- Customer support: inbound sorting, draft responses, smart routing (nothing sends without approval)

## Your Response Format
Write 2-3 short paragraphs (no headers, no bullet lists, no markdown). Be direct, warm, and specific to their situation. Reference their role, team size, and area of interest naturally. End with a clear next step — either "book a discovery call" or "read our build log" depending on their readiness. Keep it under 150 words. Sound like a thoughtful founder, not a sales bot.`;

const ROLE_MAP = { founder: 'Founder/CEO', leader: 'Team Lead/Manager', ic: 'Individual Contributor', exploring: 'Exploring for their company' };
const TEAM_MAP = { solo: 'Solo operator', small: '2-10 person team', medium: '11-50 person team', large: '50+ person company' };
const AI_MAP = { none: 'No AI usage yet', free: 'Using free tools like ChatGPT', paid: 'Paid AI accounts', building: 'Already building agents' };
const FOCUS_MAP = { email: 'Email & communication', sales: 'Sales & prospecting', reporting: 'Reporting & data', ops: 'Operations & admin', support: 'Customer support' };

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || 'https://briu.ai';

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin === allowed || origin === 'http://localhost:8000' ? origin : allowed,
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

    // Rate limiting via KV (if bound)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (env.RATE_LIMIT) {
      const key = `rate:${ip}`;
      const count = parseInt(await env.RATE_LIMIT.get(key) || '0');
      if (count >= 10) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 3600 });
    }

    try {
      const body = await request.json();
      const { q1, q2, q3, q4 } = body;

      if (!q1 || !q2 || !q3 || !q4) {
        return new Response(JSON.stringify({ error: 'Missing answers' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userMessage = `Role: ${ROLE_MAP[q1] || q1}
Team size: ${TEAM_MAP[q2] || q2}
Current AI usage: ${AI_MAP[q3] || q3}
Primary interest: ${FOCUS_MAP[q4] || q4}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
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

      return new Response(JSON.stringify({ recommendation: text }), {
        status: 200,
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
