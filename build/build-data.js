/**
 * build-data.js — Structured cost data for the Briu build.
 * Single source of truth for all build articles, charts, and comparisons.
 */

var BuildData = (function () {

  // Daily API spend by date (Feb 10 – Mar 8, 2026)
  var dailySpend = [
    { date: 'Feb 10', cost: 4.22,   phase: 'build',    milestone: 'First skills deployed',       commits: 1 },
    { date: 'Feb 11', cost: 10.70,  phase: 'build',    milestone: null,                          commits: 0 },
    { date: 'Feb 12', cost: 23.02,  phase: 'build',    milestone: 'Gmail + Calendar connected',  commits: 36 },
    { date: 'Feb 13', cost: 36.38,  phase: 'build',    milestone: 'HubSpot + Apollo live',       commits: 14 },
    { date: 'Feb 14', cost: 23.54,  phase: 'build',    milestone: null,                          commits: 12 },
    { date: 'Feb 15', cost: 4.84,   phase: 'build',    milestone: null,                          commits: 6 },
    { date: 'Feb 16', cost: 26.08,  phase: 'build',    milestone: null,                          commits: 16 },
    { date: 'Feb 17', cost: 17.13,  phase: 'stable',   milestone: 'Morning briefing v3',         commits: 26 },
    { date: 'Feb 18', cost: 8.31,   phase: 'stable',   milestone: null,                          commits: 7 },
    { date: 'Feb 19', cost: 9.58,   phase: 'stable',   milestone: null,                          commits: 1 },
    { date: 'Feb 20', cost: 5.63,   phase: 'stable',   milestone: null,                          commits: 7 },
    { date: 'Feb 21', cost: 7.11,   phase: 'stable',   milestone: null,                          commits: 0 },
    { date: 'Feb 22', cost: 4.02,   phase: 'stable',   milestone: null,                          commits: 0 },
    { date: 'Feb 23', cost: 8.88,   phase: 'stable',   milestone: null,                          commits: 6 },
    { date: 'Feb 24', cost: 9.00,   phase: 'optimize', milestone: 'State database live',         commits: 15 },
    { date: 'Feb 25', cost: 40.74,  phase: 'optimize', milestone: 'Cost crisis: 195K token session', commits: 13 },
    { date: 'Feb 26', cost: 33.65,  phase: 'optimize', milestone: 'Cache + context pruning deployed', commits: 13 },
    { date: 'Feb 27', cost: 1.79,   phase: 'optimize', milestone: 'Cost drops 90%',              commits: 7 },
    { date: 'Feb 28', cost: 38.29,  phase: 'optimize', milestone: 'Sales prospecting skill chain', commits: 22 },
    { date: 'Mar 1',  cost: 7.81,   phase: 'launch',   milestone: null,                          commits: 1 },
    { date: 'Mar 2',  cost: 1.19,   phase: 'launch',   milestone: null,                          commits: 1 },
    { date: 'Mar 3',  cost: 0.55,   phase: 'launch',   milestone: null,                          commits: 5 },
    { date: 'Mar 4',  cost: 5.15,   phase: 'launch',   milestone: null,                          commits: 13 },
    { date: 'Mar 5',  cost: 3.22,   phase: 'launch',   milestone: 'Briu launched',               commits: 28 },
    { date: 'Mar 6',  cost: 42.58,  phase: 'launch',   milestone: 'Website + services built',    commits: 1 },
    { date: 'Mar 7',  cost: 2.59,   phase: 'launch',   milestone: null,                          commits: 1 },
    { date: 'Mar 8',  cost: 13.78,  phase: 'launch',   milestone: 'Privacy policy + site audit', commits: 12 }
  ];

  // Phases (maps phase key → display opacity for charts)
  var phases = {
    build:    { label: 'Building',      days: 7, alpha: 0.8 },
    stable:   { label: 'Stabilization', days: 7, alpha: 0.45 },
    optimize: { label: 'Cost Fix',      days: 5, alpha: 0.6 },
    launch:   { label: 'Briu Launch',   days: 8, alpha: 0.95 }
  };

  // Skill-level costs (what each capability cost in API spend)
  var skillCosts = [
    { skill: 'Email (Gmail)',           cost: 42.10 },
    { skill: 'Calendar',               cost: 18.50 },
    { skill: 'CRM (HubSpot)',          cost: 56.20 },
    { skill: 'Sales Prospecting',      cost: 68.40 },
    { skill: 'Morning Briefing',       cost: 31.80 },
    { skill: 'Browser Automation',     cost: 24.60 },
    { skill: 'Reporting',              cost: 19.30 },
    { skill: 'Security Monitoring',    cost: 15.70 },
    { skill: 'Cost Controls',          cost: 12.40 },
    { skill: 'State Management',       cost: 22.50 },
    { skill: 'Context Pruning',        cost: 33.80 },
    { skill: 'Orchestration',          cost: 30.70 }
  ];

  // Platform costs (monthly recurring)
  var platformCosts = {
    claudeMax: { label: 'Claude Max', cost: 200, period: 'month' }
  };

  // One-time costs
  var oneTimeCosts = {
    agentAPI:  { label: 'Agent API spend',        cost: 376 },
    brand:     { label: 'Brand (Midjourney)',      cost: 30 },
    website:   { label: 'Website API cost',        cost: 0 },
    domain:    { label: 'Domain (briu.ai)',        cost: 85 },
    trademark: { label: 'Trademark (2 classes)',   cost: 710 }
  };

  // API costs aggregated by month
  var apiCostsByMonth = {
    'Feb 2026': {
      days: 19,
      total: 263.37,
      avgDaily: 13.86,
      peak: { date: 'Feb 25', cost: 40.74, note: 'Cost crisis: 195K token session' }
    },
    'Mar 2026': {
      days: 8,
      total: 76.87,
      avgDaily: 9.61,
      peak: { date: 'Mar 6', cost: 42.58, note: 'Website + services built' }
    }
  };

  // Operating cost tiers (steady-state ranges)
  var operatingTiers = [
    { tier: 'Light Usage',       range: [260, 350],    perMonth: true, breakdown: '$200/mo platform + $2–5/day API' },
    { tier: 'Briu Average',      range: [769, 769],    perMonth: true, breakdown: '$200/mo platform + $18.97/day avg API' },
    { tier: 'Scaled Production', range: [1000, 3000],  perMonth: true, breakdown: 'Platform + heavy API + dedicated compute' },
    { tier: 'Full Agent Team',   range: [5000, 10000], perMonth: true, breakdown: 'Multiple seats + Opus-class agents running 24/7' }
  ];

  // Traditional equivalents (agent cost vs. traditional route)
  var traditionalEquivalents = [
    {
      category: 'Production Agent',
      agent:       { cost: 376,         time: '3 days',   note: 'API costs only' },
      traditional: { cost: [15000, 30000], time: '3–6 months', note: 'Dev agency or internal hire' }
    },
    {
      category: 'Brand & Identity',
      agent:       { cost: 30,          time: '1 session', note: '400+ generations' },
      traditional: { cost: [15000, 25000], time: '4–8 weeks',  note: 'Branding agency' }
    },
    {
      category: 'Website',
      agent:       { cost: 0,           time: 'Ongoing',   note: 'Built in-terminal with Claude Code' },
      traditional: { cost: [8000, 20000],  time: '4–6 weeks',  note: 'Dev shop' }
    },
    {
      category: 'Platform',
      agent:       { cost: 200,         time: '/mo',       note: 'Claude Max — shared across all three' },
      traditional: { cost: [2000, null],   time: '/mo',       note: 'SaaS stack, consultants, multiple tools' }
    }
  ];

  // Totals
  var totals = {
    directBuild:     406,    // API + brand + website
    totalToLaunch:   1391,   // including trademark, domain, platform
    traditionalLow:  40000,
    traditionalHigh: 75000,
    avgDailyCost:    18.97,
    peakDayCost:     42.58,  // Mar 6
    steadyState:     [2, 5], // $/day after optimization
    buildDays:       27
  };

  // Comparison bars (for horizontal bar charts)
  var comparisonBars = [
    { label: 'Part-time VA (3 mo)',      cost: 4500 },
    { label: 'Freelance dev (website)',   cost: 8000 },
    { label: 'Branding agency',          cost: 15000 },
    { label: 'Full agent build',         cost: 376, briu: true }
  ];

  // Helpers
  function totalAPISpend() {
    return dailySpend.reduce(function (sum, d) { return sum + d.cost; }, 0);
  }

  function totalCommits() {
    return dailySpend.reduce(function (sum, d) { return sum + d.commits; }, 0);
  }

  function cumulativeSpend() {
    var running = 0;
    return dailySpend.map(function (d) {
      running += d.cost;
      return { date: d.date, cumulative: running, daily: d.cost, milestone: d.milestone };
    });
  }

  function milestones() {
    return dailySpend.filter(function (d) { return d.milestone; });
  }

  function spendByPhase() {
    var result = {};
    dailySpend.forEach(function (d) {
      if (!result[d.phase]) result[d.phase] = 0;
      result[d.phase] += d.cost;
    });
    return result;
  }

  return {
    dailySpend:              dailySpend,
    phases:                  phases,
    skillCosts:              skillCosts,
    platformCosts:           platformCosts,
    oneTimeCosts:            oneTimeCosts,
    apiCostsByMonth:         apiCostsByMonth,
    operatingTiers:          operatingTiers,
    traditionalEquivalents:  traditionalEquivalents,
    totals:                  totals,
    comparisonBars:          comparisonBars,
    totalAPISpend:           totalAPISpend,
    totalCommits:            totalCommits,
    cumulativeSpend:         cumulativeSpend,
    milestones:              milestones,
    spendByPhase:            spendByPhase
  };

})();
