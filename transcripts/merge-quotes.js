#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// All source files with their normalization needs
const sources = [
  {
    file: path.join(__dirname, '..', 'content', 'data', 'allin-e259-quotes.json'),
    sourceId: 'allin-e259',
    idPrefix: 'e259',
    quoteKey: 'quote',
    briuKey: 'briu_use'
  },
  {
    file: path.join(__dirname, '..', '..', 'allin-e261-quotes.json'), // in home dir
    sourceId: 'allin-e261',
    idPrefix: 'e261',
    quoteKey: 'quote',
    briuKey: 'briu_use'
  },
  {
    file: path.join(__dirname, '..', 'content', 'data', 'lex491-quotes.json'),
    sourceId: 'lex-491',
    idPrefix: 'lex491',
    quoteKey: 'quote',
    briuKey: 'briu_use'
  },
  {
    file: path.join(__dirname, '..', 'data', 'transcripts', 'elon-musk-ai-energy-space.json'),
    sourceId: 'elon-musk-stripe',
    idPrefix: 'elon',
    quoteKey: 'text',
    briuKey: 'briu_use'
  },
  {
    file: path.join(__dirname, 'diamandis-237-openclaw-extracted.json'),
    sourceId: 'diamandis-237',
    idPrefix: 'oc237',
    quoteKey: 'quote',
    briuKey: null // some have no briu_use
  },
  {
    file: path.join(__dirname, 'karpathy-333-extracted.json'),
    sourceId: 'karpathy-333',
    idPrefix: 'ak333',
    quoteKey: 'quote',
    briuKey: 'briu_angle'
  }
];

// Normalize category names to lowercase kebab-case
function normalizeCategory(cat) {
  return cat
    .toLowerCase()
    .replace(/[\/&]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Build source metadata
const sourcesMeta = [];
const allQuotes = [];

for (const src of sources) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(src.file, 'utf8'));
  } catch (e) {
    console.error(`Failed to read ${src.file}: ${e.message}`);
    continue;
  }

  // Extract source metadata
  const meta = data.source || {};
  sourcesMeta.push({
    id: src.sourceId,
    show: meta.podcast || meta.show || meta.platform || 'Interview',
    episode: meta.episode ? String(meta.episode) : null,
    title: meta.title || null,
    speakers: meta.speakers || (meta.guest ? [meta.guest, meta.host || meta.interviewer].filter(Boolean) : null),
    date: meta.date || meta.date_approximate || null,
    context: meta.context || meta.note || null
  });

  // Normalize quotes
  const quotesArr = data.quotes || data.extracts || [];
  for (let i = 0; i < quotesArr.length; i++) {
    const q = quotesArr[i];
    const originalId = q.id != null ? String(q.id) : String(i + 1);
    const id = originalId.startsWith(src.idPrefix) ? originalId : `${src.idPrefix}-${originalId}`;

    allQuotes.push({
      id,
      source: src.sourceId,
      quote: q[src.quoteKey] || q.quote || q.text || '',
      speaker: q.speaker || 'Unknown',
      timestamp: q.timestamp || null,
      categories: (q.categories || []).map(normalizeCategory),
      briu_use: q[src.briuKey] || q.briu_use || q.briu_angle || null,
      priority: q.priority || 'medium'
    });
  }
}

// Now add yang-236 from existing all-quotes.json (it was inline, not a separate file)
try {
  const existing = JSON.parse(fs.readFileSync(path.join(__dirname, 'all-quotes.json'), 'utf8'));
  const yangSource = existing.sources?.find(s => s.id === 'yang-236');
  if (yangSource) {
    sourcesMeta.unshift({
      id: 'yang-236',
      show: yangSource.show,
      episode: yangSource.episode,
      title: yangSource.title,
      speakers: yangSource.guests || ['Andrew Yang'],
      date: yangSource.date || '2026',
      context: yangSource.context || null
    });
  }
  // Extract yang quotes
  const yangQuotes = (existing.quotes || []).filter(q => q.source === 'yang-236');
  for (const q of yangQuotes) {
    allQuotes.push({
      id: q.id,
      source: 'yang-236',
      quote: q.quote,
      speaker: q.speaker,
      timestamp: q.timestamp,
      categories: (q.categories || []).map(normalizeCategory),
      briu_use: q.briu_use || null,
      priority: q.priority || 'medium'
    });
  }
} catch (e) {
  console.error('Could not read existing all-quotes.json for yang data:', e.message);
}

// Deduplicate by id
const seen = new Set();
const deduped = [];
for (const q of allQuotes) {
  if (!seen.has(q.id)) {
    seen.add(q.id);
    deduped.push(q);
  }
}

// Build category index
const categoryIndex = {};
for (const q of deduped) {
  for (const cat of q.categories) {
    if (!categoryIndex[cat]) categoryIndex[cat] = [];
    categoryIndex[cat].push(q.id);
  }
}

// Build chart concepts (curated)
const chartConcepts = [
  {
    id: 'chart-pyramid-to-column',
    title: 'The New Org Chart',
    description: 'Pyramid (1 senior : 3 juniors) vs Column (1 senior + AI : 1 junior)',
    sources: ['yang-1', 'yang-2'],
    visual_type: 'side-by-side shape comparison',
    page: 'homepage',
    built: true
  },
  {
    id: 'chart-sublinear-scaling',
    title: '10x Problems, 2-3x Effort',
    description: "Karpathy's sublinear scaling: 10x ambition, 2-3x cost",
    sources: ['ak-1', 'ak333-18'],
    visual_type: 'bar comparison + counter',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-creation-vs-destruction',
    title: '100M Entrepreneurs vs 15K Layoffs',
    description: '100M people x 3 hires = 300M jobs vs 15K FAANG layoffs',
    sources: ['oc-12', 'oc237-43'],
    visual_type: 'horizontal bars + counter',
    page: 'homepage',
    built: true
  },
  {
    id: 'chart-then-vs-now',
    title: 'Karpathy 2022 vs Reality 2026',
    description: 'Six predictions that came true',
    sources: ['ak-6', 'ak-11', 'ak-9', 'ak333-14', 'ak333-22'],
    visual_type: 'two-column comparison table',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-automation-bars',
    title: 'How Much Can Agents Do?',
    description: 'Producer 80%, SDR 95%, Accountant 80%',
    sources: ['e259-08', 'oc237-42'],
    visual_type: 'horizontal bars',
    page: 'homepage',
    built: true
  },
  {
    id: 'chart-salary-crossover',
    title: 'Token Cost vs Salary',
    description: 'When token spend exceeds employee salary',
    sources: ['e261-21', 'e261-24'],
    visual_type: 'line crossover',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-cost-per-hour',
    title: 'Agent Cost Per Hour',
    description: '$300/day agent vs employee costs',
    sources: ['e261-21', 'e259-20'],
    visual_type: 'comparison bars',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-leverage-rings',
    title: '10-20x Leverage',
    description: '4 AI-native employees producing 10-20x vs 16 others',
    sources: ['e261-09'],
    visual_type: 'concentric rings',
    page: 'homepage',
    built: true
  },
  {
    id: 'chart-adoption-timeline',
    title: 'AI Adoption S-Curve',
    description: 'Bottom-up enterprise adoption acceleration',
    sources: ['e261-06', 'e259-09'],
    visual_type: 'S-curve timeline',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-infra-scale',
    title: 'AI Infrastructure Scale',
    description: 'Current 20-25 GW → 100 GW by 2030',
    sources: ['elon-12', 'elon-38'],
    visual_type: 'growth chart',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-compression-meter',
    title: 'Time Compression',
    description: 'Days of work → 2 hours',
    sources: ['e261-05', 'oc237-34'],
    visual_type: 'compression meter',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-migration-curve',
    title: 'Work Migration',
    description: '5-10% per week moving to agents',
    sources: ['e261-11'],
    visual_type: 'area chart',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-week-breakdown',
    title: 'Weekly Agent Breakdown',
    description: 'How agent time splits across tasks',
    sources: ['e259-08', 'e259-06'],
    visual_type: 'donut chart',
    page: 'homepage',
    built: true
  },
  {
    id: 'chart-agent-team',
    title: 'Agent Org Chart',
    description: 'Human → Orchestrator → Specialist agents',
    sources: ['e261-13', 'oc237-29', 'oc237-27'],
    visual_type: 'org diagram',
    page: 'homepage',
    built: true
  },
  {
    id: 'chart-intelligence-timeline',
    title: 'Intelligence Timeline',
    description: 'AI exceeds human intelligence in 5-6 years',
    sources: ['elon-18'],
    visual_type: 'timeline',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-ownership-risk',
    title: 'Ownership Risk',
    description: 'Platform risk with closed-source providers',
    sources: ['e259-30', 'e259-31'],
    visual_type: 'risk comparison',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-compound-loop',
    title: 'Compounding Intelligence',
    description: 'Every integration makes agents smarter',
    sources: ['e259-11', 'e259-10'],
    visual_type: 'circular flow',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-cost-arbitrage',
    title: '$1,000/day → $10/day',
    description: 'Closed-source API vs optimized open-source',
    sources: ['e259-20', 'e259-24', 'e259-22'],
    visual_type: 'waterfall / comparison',
    page: 'homepage',
    built: true
  },
  {
    id: 'chart-energy-bottleneck',
    title: 'AI Energy Gap',
    description: 'Chip production outpacing ability to power them',
    sources: ['elon-1', 'elon-8', 'elon-26'],
    visual_type: 'paired bars',
    page: 'why-now',
    built: true
  },
  {
    id: 'chart-4yr-40yr',
    title: '4 Years = 40 Years',
    description: 'AI acceleration compresses decades into years',
    sources: ['yang-7', 'oc-17'],
    visual_type: 'compression visual',
    page: 'homepage',
    built: true
  },
  {
    id: 'chart-200-to-5m',
    title: '$200/mo → $5M Company',
    description: 'Niche OpenClaw business on an Anthropic sub',
    sources: ['oc-2', 'oc237-45'],
    visual_type: 'scale comparison',
    page: 'homepage',
    built: true
  },
  {
    id: 'chart-software-factory',
    title: 'The Software Factory',
    description: '5 agents building and improving software autonomously',
    sources: ['oc237-12', 'oc237-13', 'oc237-18'],
    visual_type: 'pipeline diagram',
    page: 'homepage',
    built: true
  }
];

// High-priority quotes for quick access
const highPriority = deduped.filter(q => q.priority === 'high').map(q => q.id);

const output = {
  last_updated: '2026-03-09',
  total_quotes: deduped.length,
  total_sources: sourcesMeta.length,
  sources: sourcesMeta,
  quotes: deduped,
  chart_concepts: chartConcepts,
  indexes: {
    by_category: categoryIndex,
    high_priority: highPriority,
    security_article: deduped.filter(q =>
      q.categories.some(c => c.includes('security')) || q.categories.some(c => c.includes('trust'))
    ).map(q => q.id),
    empowerment: deduped.filter(q =>
      q.categories.some(c => c.includes('empowerment'))
    ).map(q => q.id),
    chart_worthy: deduped.filter(q =>
      q.categories.some(c => c.includes('chart'))
    ).map(q => q.id)
  }
};

const outPath = path.join(__dirname, 'all-quotes.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`Merged ${deduped.length} quotes from ${sourcesMeta.length} sources`);
console.log(`High priority: ${highPriority.length}`);
console.log(`Chart-worthy: ${output.indexes.chart_worthy.length}`);
console.log(`Security: ${output.indexes.security_article.length}`);
console.log(`Chart concepts: ${chartConcepts.length} (${chartConcepts.filter(c => c.built).length} built)`);
console.log(`Written to ${outPath}`);
