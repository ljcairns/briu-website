#!/usr/bin/env node
/**
 * Briu Content Ingestion Script
 * Crawls the site HTML, chunks content, generates embeddings via Cloudflare AI,
 * and upserts into Vectorize.
 *
 * Usage:
 *   node scripts/ingest.js                    # dry-run (prints chunks)
 *   node scripts/ingest.js --upload           # upload to Vectorize via wrangler
 *
 * Requires: wrangler CLI authenticated, Vectorize index "briu-content" created.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { execSync } from 'child_process';

const SITE_ROOT = join(import.meta.dirname, '..', '..', '..');
const OUTPUT_FILE = join(import.meta.dirname, 'chunks.ndjson');

// Pages to index (relative to SITE_ROOT)
function findPages(dir, pages = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.wrangler' || entry.name === 'workers' || entry.name === 'admin') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findPages(full, pages);
    } else if (entry.name === 'index.html' || entry.name === '404.html') {
      pages.push(full);
    }
  }
  return pages;
}

// Strip HTML to visible text, preserving section breaks
function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|section|article|li|h[1-6]|tr|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, '')
    .replace(/&\w+;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

// Extract page title
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].replace(/\s*\|\s*Briu\s*$/, '').trim() : '';
}

// Split text into chunks by headings or by size
function chunkText(text, maxTokens = 400) {
  // Split on heading-like patterns (lines that start sections)
  const sections = text.split(/\n(?=(?:[A-Z][A-Za-z\s&:—]+\n))/);

  const chunks = [];
  let current = '';

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Rough token estimate: ~4 chars per token
    if (current && (current.length + trimmed.length) / 4 > maxTokens) {
      chunks.push(current.trim());
      current = trimmed;
    } else {
      current += (current ? '\n\n' : '') + trimmed;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // Split any chunks that are still too large
  const final = [];
  for (const chunk of chunks) {
    if (chunk.length / 4 > maxTokens * 1.5) {
      // Split by sentences
      const sentences = chunk.split(/(?<=[.!?])\s+/);
      let part = '';
      for (const s of sentences) {
        if (part && (part.length + s.length) / 4 > maxTokens) {
          final.push(part.trim());
          part = s;
        } else {
          part += (part ? ' ' : '') + s;
        }
      }
      if (part.trim()) final.push(part.trim());
    } else {
      final.push(chunk);
    }
  }

  return final.filter(c => c.length > 50); // Skip tiny chunks
}

// Curated content chunks (high-value, always include)
const CURATED_CHUNKS = {
  'curated/pricing': `Services & Pricing:
Kickoff $5,000 — half-day working session, workflow mapping, first agent built and deployed, written architecture plan. 2-week lead time.
Workshop Add-on +$2,500 — full team AI briefing, one-on-one exec sessions, live demos with your data. Pairs with the Kickoff ($7,500 total).
Implementation — quoted per project, scoped from kickoff, built on your infrastructure with your API keys.
Partnership Retainer from $500/mo — maintenance, monitoring, cost optimization, model upgrades.
Payment: invoice (bank transfer/wire) or cryptocurrency. No payment processors, no fees.
Trust: You own everything. No margin on costs. Approval gates on every action.`,

  'curated/economics': `Economics:
Agent API costs: $2-5/day practical, $10-20/day moderate, $30-100/day frontier. Platform ~$200/mo (Claude Max) shared across all agents.
Briu's own agent: $376 total API, 3 days to production. Month-one all-in ~$711, total with ongoing agents ~$1,391. Traditional equivalent $40-75K+. 30x less, 7x faster.
Brand identity: one evening, 400+ Midjourney generations, ~$120 total. 9 agent skills in production, 8 tools integrated, 641+ commits.`,

  'curated/capabilities': `What Agents Do:
Email management — inbox triage, draft responses, follow-ups across multiple accounts. Nothing sends without approval.
CRM & Sales — HubSpot/Salesforce updates, lead scoring, Apollo prospecting, personalized outreach. $0.60-0.70/run.
Personal assistants — email, calendar, contacts, daily briefings. WhatsApp, Slack, Discord. 24/7.
Reporting — daily/weekly reports, PDF generation, cost tracking, anomaly alerts.
Operations — multi-agent orchestration, overnight processing, morning briefings.
Integrations: Gmail, Slack, Discord, WhatsApp, Notion, Calendar, HubSpot, GitHub, Salesforce, Apollo, +100 more via OpenClaw.`,

  'curated/proof': `Proof Points:
"Out of 50 hours a producer does a week, this does 40 of them. And of what an SDR does, this does 95%." — Calacanis, E259
"They don't forget to do work. They don't make mistakes. Once you put this in, you don't need checklists." — Calacanis, E261
Calacanis deployed agents across 20-person venture firm. Each person got their own agent with email, Slack, CRM. Master agent manages others.
Mark Cuban called it "the smartest counter I've seen to AI taking over jobs."`,

  'curated/security': `Security Architecture:
8 independent defense layers: Input sanitizer (140+ patterns, 7 detection stages), auto-sanitizer hook, canary tokens (daily-rotating), write protection on critical files, exec guardrails, kill switch on critical CVEs, sandbox isolation (read-only Haiku agent), structural framing (XML data tags).
Red-teamed with 6 rounds of AI vs AI: 210+ attack payloads, 4 architectural audits by Codex. 5 critical findings, all patched. 30+ total fixes.
Every layer assumes the others have failed. For injection to succeed: must fool sanitizer + sandbox agent + jq extraction + main agent + exec-approvals.`,

  'curated/whynow': `Why Deploy Agents Now:
Agents as capital investment — every email triaged teaches patterns, every CRM update teaches deal flow. Knowledge is permanent.
Cost curves falling — $300/day is the most you'll ever pay. Models get cheaper every quarter.
Competitive advantage compounds — businesses starting now build 3 compounding advantages: knowledge accumulation, team capability, cost trajectory.
Framework is open source (OpenClaw). One developer built it using an AI coding agent.`,

  'curated/pages': `Site Pages:
/ — Homepage: economics calculator, proof stats, integrations, assessment quiz, FAQ
/services/ — Engagement arc (Discovery→Build→Transfer→Partnership), all pricing, capabilities, trust commitments
/why-now/ — Founder case for acting now, economics, industry quotes
/build/ — Live dashboard, every cost and timeline event
/build/the-real-numbers/ — Interactive cost charts
/build/brand-in-a-session/ — Brand case study
/build/how-we-built-briu-using-our-own-agent-stack/ — Full build narrative
/build/from-comment-to-fix-in-one-loop/ — Automated customer feedback loop
/build/six-layers-deep/ — Zero-trust security architecture
/build/how-we-red-teamed-our-own-agent/ — 6 rounds of AI red-teaming, 210+ payloads
/build/what-a-real-session-actually-costs/ — Detailed 2am build session cost breakdown
/build/the-morning-briefing/ — How the daily morning briefing agent works
/build/voice-profile/ — How we built the brand voice
/build/we-tried-to-break-our-own-sanitizer/ — Sanitizer testing deep dive`
};

// Main
function main() {
  const upload = process.argv.includes('--upload');
  const pages = findPages(SITE_ROOT);

  console.log(`Found ${pages.length} pages to index`);

  const allChunks = [];

  // Process HTML pages
  for (const page of pages) {
    const rel = '/' + relative(SITE_ROOT, page).replace(/index\.html$/, '').replace(/\\/g, '/');
    const html = readFileSync(page, 'utf-8');
    const title = extractTitle(html);
    const text = extractText(html);

    if (text.length < 100) {
      console.log(`  Skipping ${rel} (too short)`);
      continue;
    }

    const chunks = chunkText(text);
    console.log(`  ${rel}: ${chunks.length} chunks (${title})`);

    for (let i = 0; i < chunks.length; i++) {
      allChunks.push({
        id: `page:${rel}:${i}`,
        text: chunks[i],
        metadata: {
          source: 'page',
          path: rel,
          title: title,
          chunk_index: i,
          text: chunks[i],
        }
      });
    }
  }

  // Add curated chunks
  for (const [id, text] of Object.entries(CURATED_CHUNKS)) {
    allChunks.push({
      id: id,
      text: text,
      metadata: {
        source: 'curated',
        path: id,
        title: id.split('/')[1],
        chunk_index: 0,
        text: text,
      }
    });
  }

  console.log(`\nTotal: ${allChunks.length} chunks`);

  // Write NDJSON for wrangler vectorize upload
  const ndjson = allChunks.map(c => JSON.stringify({
    id: c.id,
    metadata: c.metadata,
    // Values will be filled by the embedding step
  })).join('\n');

  writeFileSync(OUTPUT_FILE, ndjson);
  console.log(`Wrote chunks to ${OUTPUT_FILE}`);

  // Write a text file for embedding generation
  const textsFile = join(import.meta.dirname, 'chunks-texts.json');
  writeFileSync(textsFile, JSON.stringify(allChunks.map(c => ({
    id: c.id,
    text: c.text.slice(0, 512), // bge-base-en-v1.5 max ~512 tokens
  }))));
  console.log(`Wrote texts to ${textsFile}`);

  if (upload) {
    console.log('\n--- Generating embeddings and uploading to Vectorize ---');
    console.log('This requires the embed-and-upload script (Phase 1b).');
    console.log('Run: node scripts/embed-upload.js');
  } else {
    console.log('\nDry run complete. Use --upload to generate embeddings and upload.');
    console.log('\nSample chunks:');
    for (const c of allChunks.slice(0, 3)) {
      console.log(`\n--- ${c.id} ---`);
      console.log(c.text.slice(0, 200) + '...');
    }
  }
}

main();
