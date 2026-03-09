/* ============================================
   Briu Chart Component Library
   ============================================
   Usage: <div id="my-chart"></div>
          <script>Briu.charts.automationBars('my-chart');</script>
   ============================================ */

var Briu = Briu || {};
Briu.charts = {};

/* ---- Utilities ---- */

Briu.charts._observe = function(el, callback, threshold) {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        callback(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: threshold || 0.15 });
  obs.observe(el);
};

Briu.charts._countUp = function(el, target, duration, prefix, suffix) {
  prefix = prefix || '';
  suffix = suffix || '';
  duration = duration || 1400;
  var start = 0;
  var startTime = null;
  var isFloat = target % 1 !== 0;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = start + (target - start) * eased;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};

Briu.charts._initChartJsDefaults = function() {
  if (Briu.charts._defaultsSet) return;
  if (typeof Chart === 'undefined') return;
  Chart.defaults.color = '#94909A';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.font.size = 11;
  Briu.charts._defaultsSet = true;
};

Briu.charts._tooltipConfig = function() {
  return {
    backgroundColor: '#0E1219',
    borderColor: 'rgba(212,160,90,0.3)',
    borderWidth: 1,
    titleColor: '#D4A05A',
    bodyColor: '#EAE7E3',
    padding: 12
  };
};


/* ============================================
   Chart 1: Automation Bars
   Shows % of work automated by role
   ============================================ */
Briu.charts.automationBars = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var data = [
    { role: 'SDR', pct: 95, color: 'var(--gold)', detail: '95% of SDR tasks automated — Calacanis, All-In E259' },
    { role: 'Producer', pct: 80, color: 'var(--coral)', detail: '40 of 50 hours/week handled by agents — Calacanis, All-In E259' },
    { role: 'Exec Assistant', pct: 30, color: 'var(--river)', detail: '30% of EA work offloaded to AI replicant — Calacanis, All-In E261' },
    { role: 'Investment Team', pct: 20, color: 'var(--forest)', detail: '20% of work done by agents in real time — Calacanis, All-In E261' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">Real-world agent automation by role</div><div class="auto-bars">';
  data.forEach(function(d) {
    html += '<div class="auto-bar-row">' +
      '<div class="auto-bar-role">' + d.role + '</div>' +
      '<div class="auto-bar-track"><div class="auto-bar-fill" style="--target:' + d.pct + '%;background:' + d.color + '"></div></div>' +
      '<div class="auto-bar-pct" data-count="' + d.pct + '">0%</div>' +
      '</div>' +
      '<div class="auto-bar-row" style="grid-template-columns:140px 1fr"><div></div><div class="auto-bar-detail">' + d.detail + '</div></div>';
  });
  html += '</div><div class="chart-source">Source: Jason Calacanis on OpenClaw deployment — All-In Podcast E259, E261</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
    el.querySelectorAll('.auto-bar-pct').forEach(function(numEl) {
      Briu.charts._countUp(numEl, parseInt(numEl.getAttribute('data-count')), 1400, '', '%');
    });
  });
};


/* ============================================
   Chart 3: Leverage Rings
   Shows multiplier effects of AI adoption
   ============================================ */
Briu.charts.leverageRings = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var rings = [
    { num: '10-20x', pct: 85, color: 'var(--gold)', label: 'Leverage', desc: 'AI-focused employees vs non-adopters', source: 'Calacanis, E261' },
    { num: '2x', pct: 50, color: 'var(--coral)', label: 'Min. bar', desc: 'Productivity floor being actively applied', source: 'Chamath, E261' },
    { num: '2hrs', pct: 88, color: 'var(--river)', label: 'Not days', desc: 'Tasks that took days, done in hours', source: 'Sacks, E261' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">Employee leverage with AI agents</div><div class="leverage-rings">';
  rings.forEach(function(r) {
    var deg = Math.round(r.pct * 3.6);
    html += '<div class="lever-ring">' +
      '<div class="lever-ring-circle" style="--ring-color:' + r.color + '" data-deg="' + deg + '">' +
      '<div class="lever-ring-inner"><div class="lever-ring-num">' + r.num + '</div><div class="lever-ring-label">' + r.label + '</div></div>' +
      '</div>' +
      '<div class="lever-ring-desc">' + r.desc + '</div>' +
      '</div>';
  });
  html += '</div><div class="chart-source">Source: All-In Podcast E261</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
    el.querySelectorAll('.lever-ring-circle').forEach(function(circle) {
      var deg = parseInt(circle.getAttribute('data-deg'));
      var color = circle.style.getPropertyValue('--ring-color');
      circle.style.background = 'conic-gradient(' + color + ' 0deg, ' + color + ' ' + deg + 'deg, rgba(255,255,255,0.06) ' + deg + 'deg)';
    });
  });
};


/* ============================================
   Chart 4: Adoption Timeline
   Shows speed of agent deployment
   ============================================ */
Briu.charts.adoptionTimeline = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var milestones = [
    { num: '72hrs', label: '5 agents deployed from scratch', color: 'var(--gold)' },
    { num: '5-10%', label: 'Work migrated to agents each week', color: 'var(--coral)' },
    { num: '20%', label: 'Of team work done by agents within weeks', color: 'var(--river)' },
    { num: '6 months', label: 'To full adoption across a firm', color: 'var(--forest)' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">Agent deployment velocity</div>' +
    '<div class="adopt-timeline"><div class="adopt-track"><div class="adopt-track-fill"></div></div>' +
    '<div class="adopt-milestones">';
  milestones.forEach(function(m) {
    html += '<div class="adopt-milestone">' +
      '<div class="adopt-dot" style="background:' + m.color + ';--dot-color:' + m.color + '"></div>' +
      '<div class="adopt-milestone-num">' + m.num + '</div>' +
      '<div class="adopt-milestone-label">' + m.label + '</div>' +
      '</div>';
  });
  html += '</div></div><div class="chart-source">Source: Calacanis, Sacks — All-In Podcast E259, E261</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 5: Infrastructure Scale Cards
   Shows macro AI investment numbers
   ============================================ */
Briu.charts.infraScale = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var cards = [
    { num: '$600B', label: 'Hyperscaler Capex', desc: 'From just 4 companies this year', color: 'var(--gold)', barWidth: '100%' },
    { num: '~2%', label: 'GDP Tailwind', desc: 'From capex alone — before any software ROI', color: 'var(--coral)', barWidth: '60%' },
    { num: '33,000', label: 'New Jobs', desc: 'Construction jobs in one month from AI/data centers', color: 'var(--river)', barWidth: '45%' },
    { num: '+26%', label: 'Copper Surge', desc: 'Price jump in a single month from AI infrastructure demand', color: 'var(--forest)', barWidth: '35%' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">The infrastructure is being built now</div><div class="infra-grid">';
  cards.forEach(function(c) {
    html += '<div class="infra-card" style="--card-color:' + c.color + '">' +
      '<div class="infra-card-label" style="color:' + c.color + '">' + c.label + '</div>' +
      '<div class="infra-card-num">' + c.num + '</div>' +
      '<div class="infra-card-desc">' + c.desc + '</div>' +
      '<div class="infra-bar"><div class="infra-bar-fill" style="--bar-width:' + c.barWidth + ';background:' + c.color + '"></div></div>' +
      '</div>';
  });
  html += '</div><div class="chart-source">Source: All-In Podcast E261, CBO data</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 7: Compression Meter
   Shows cost/compute reduction trajectory
   ============================================ */
Briu.charts.compressionMeter = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var html = '<div class="chart-surface"><div class="chart-label">Cost compression trajectory</div>' +
    '<div class="compress-meter">' +
    '<div class="compress-bars">' +
    '<div class="compress-bar-row">' +
    '<div class="compress-bar-label">Today</div>' +
    '<div class="compress-bar-track"><div class="compress-bar-fill before">$100/day</div></div>' +
    '</div>' +
    '<div class="compress-bar-row">' +
    '<div class="compress-bar-label">Projected</div>' +
    '<div class="compress-bar-track"><div class="compress-bar-fill after" style="--target:10%">$10/day</div></div>' +
    '</div>' +
    '</div>' +
    '<div class="compress-factor">' +
    '<div class="compress-factor-num">90%</div>' +
    '<div class="compress-factor-label">cost reduction with open-source + next-gen silicon</div>' +
    '</div>' +
    '<div class="compress-stats">' +
    '<div class="compress-stat"><div class="compress-stat-num">90%</div><div class="compress-stat-label">Cost reduction</div></div>' +
    '<div class="compress-stat"><div class="compress-stat-num">70-100x</div><div class="compress-stat-label">Compute efficiency</div></div>' +
    '<div class="compress-stat"><div class="compress-stat-num">$10/day</div><div class="compress-stat-label">Projected agent cost</div></div>' +
    '</div>' +
    '</div>' +
    '<div class="chart-source">Source: Chamath Palihapitiya (90% cut), David Friedberg (70-100x compute) — All-In E259</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 6: Token Cost vs Salary Crossover
   Chart.js line chart
   ============================================ */
Briu.charts.salaryCrossover = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  if (typeof Chart === 'undefined') return;

  Briu.charts._initChartJsDefaults();

  var html = '<div class="chart-surface">' +
    '<div class="chart-label">Token cost as % of equivalent employee salary</div>' +
    '<div style="position:relative;height:280px"><canvas id="' + containerId + '-canvas"></canvas></div>' +
    '<div class="chart-legend">' +
    '<div class="chart-legend-item"><div style="width:18px;height:2px;background:var(--gold)"></div>Superstar developer</div>' +
    '<div class="chart-legend-item"><div style="width:18px;height:2px;background:var(--river)"></div>Average employee</div>' +
    '<div class="chart-legend-item"><div style="width:18px;height:0;border-top:2px dashed var(--coral)"></div>Salary parity</div>' +
    '</div>' +
    '<div class="chart-source">Source: Chamath Palihapitiya — All-In E261. Projections based on observed pricing trends.</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
    var ctx = document.getElementById(containerId + '-canvas');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['2023', 'Early 2025', 'Mid 2026', '2027 est.', '2028 est.'],
        datasets: [
          {
            label: 'Superstar dev token spend',
            data: [5, 40, 100, 150, 200],
            borderColor: '#D4A05A',
            backgroundColor: 'rgba(212,160,90,0.08)',
            fill: true,
            borderWidth: 2.5,
            pointBackgroundColor: '#0E1219',
            pointBorderColor: '#D4A05A',
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.4
          },
          {
            label: 'Average employee token spend',
            data: [1, 5, 15, 40, 80],
            borderColor: '#5A9DAC',
            backgroundColor: 'rgba(90,157,172,0.06)',
            fill: true,
            borderWidth: 2.5,
            pointBackgroundColor: '#0E1219',
            pointBorderColor: '#5A9DAC',
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.4
          },
          {
            label: 'Salary parity',
            data: [100, 100, 100, 100, 100],
            borderColor: '#E07B5F',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: Briu.charts._tooltipConfig()
        },
        scales: {
          x: {
            ticks: { color: '#94909A', font: { size: 11 } },
            grid: { color: 'rgba(255,255,255,0.04)' },
            border: { color: 'rgba(255,255,255,0.06)' }
          },
          y: {
            min: 0, max: 220,
            ticks: {
              color: '#94909A',
              font: { size: 11 },
              callback: function(v) { return v + '%'; }
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
            border: { display: false }
          }
        }
      }
    });
  });
};


/* ============================================
   Chart 8: Migration Curve
   Chart.js area chart showing adoption S-curve
   ============================================ */
Briu.charts.migrationCurve = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  if (typeof Chart === 'undefined') return;

  Briu.charts._initChartJsDefaults();

  var html = '<div class="chart-surface">' +
    '<div class="chart-label">Compound adoption — % of firm work handled by agents</div>' +
    '<div style="position:relative;height:280px"><canvas id="' + containerId + '-canvas"></canvas></div>' +
    '<div class="chart-legend">' +
    '<div class="chart-legend-item"><div style="width:18px;height:2px;background:var(--gold)"></div>Work handled by agents</div>' +
    '<div class="chart-legend-item"><div style="width:18px;height:0;border-top:2px dashed var(--river)"></div>Inflection point</div>' +
    '</div>' +
    '<div class="chart-source">Source: 5-10% weekly migration rate (Calacanis, E261). Modeled as logistic S-curve.</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  // Generate S-curve data (logistic function)
  var weeks = [];
  var values = [];
  for (var w = 0; w <= 26; w++) {
    weeks.push(w === 0 ? 'Start' : 'Week ' + w);
    // Logistic: L / (1 + e^(-k(x-x0))) where L=95, k=0.35, x0=10
    var val = 95 / (1 + Math.exp(-0.35 * (w - 10)));
    values.push(Math.round(val * 10) / 10);
  }

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
    var ctx = document.getElementById(containerId + '-canvas');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: weeks,
        datasets: [
          {
            label: '% work by agents',
            data: values,
            borderColor: '#D4A05A',
            backgroundColor: function(context) {
              var chart = context.chart;
              var ctx2 = chart.ctx;
              var area = chart.chartArea;
              if (!area) return 'rgba(212,160,90,0.1)';
              var gradient = ctx2.createLinearGradient(0, area.top, 0, area.bottom);
              gradient.addColorStop(0, 'rgba(212,160,90,0.2)');
              gradient.addColorStop(1, 'rgba(212,160,90,0.01)');
              return gradient;
            },
            fill: true,
            borderWidth: 2.5,
            pointRadius: function(context) {
              var i = context.dataIndex;
              return (i === 0 || i === 4 || i === 10 || i === 26) ? 5 : 0;
            },
            pointBackgroundColor: '#0E1219',
            pointBorderColor: '#D4A05A',
            pointBorderWidth: 2,
            tension: 0.4
          },
          {
            label: '50% inflection',
            data: Array(27).fill(50),
            borderColor: '#5A9DAC',
            borderWidth: 1.5,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: Object.assign({}, Briu.charts._tooltipConfig(), {
            callbacks: {
              label: function(context) {
                if (context.datasetIndex === 1) return 'Inflection: 50%';
                return context.parsed.y.toFixed(1) + '% of work automated';
              }
            }
          })
        },
        scales: {
          x: {
            ticks: {
              color: '#94909A',
              font: { size: 10 },
              maxTicksLimit: 7
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
            border: { color: 'rgba(255,255,255,0.06)' }
          },
          y: {
            min: 0, max: 100,
            ticks: {
              color: '#94909A',
              font: { size: 11 },
              callback: function(v) { return v + '%'; }
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
            border: { display: false }
          }
        }
      }
    });
  });
};

/* --- NEW CHARTS (8-13) appended via separate file load --- */


/* ============================================
   Chart 8: Week Breakdown (Donut)
   Shows a producer's 50-hour week split
   ============================================ */
Briu.charts.weekBreakdown = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var agentHrs = 40, humanHrs = 10, total = 50;
  var circumference = 2 * Math.PI * 72;
  var agentArc = (agentHrs / total) * circumference;
  var humanArc = (humanHrs / total) * circumference;

  var html = '<div class="chart-surface"><div class="chart-label">A producer\'s 50-hour week — before and after agents</div>' +
    '<div class="week-donut">' +
    '<div class="week-donut-ring" style="--agent-arc:' + agentArc.toFixed(1) + ';--human-arc:' + humanArc.toFixed(1) + '">' +
    '<svg viewBox="0 0 180 180">' +
    '<circle class="week-donut-track" />' +
    '<circle class="week-donut-agent" />' +
    '<circle class="week-donut-human" />' +
    '</svg>' +
    '<div class="week-donut-center"><div class="week-donut-center-num">50</div><div class="week-donut-center-label">hrs/week</div></div>' +
    '</div>' +
    '<div class="week-donut-legend">' +
    '<div class="week-donut-item"><div class="week-donut-swatch" style="background:var(--gold)"></div><div><div class="week-donut-item-num">40 hours</div><div class="week-donut-item-label">Handled by AI agent — scheduling, research, drafts, data entry, follow-ups, prep work</div></div></div>' +
    '<div class="week-donut-item"><div class="week-donut-swatch" style="background:var(--river)"></div><div><div class="week-donut-item-num">10 hours</div><div class="week-donut-item-label">Human judgment — creative decisions, relationships, strategy, final approvals</div></div></div>' +
    '</div>' +
    '</div>' +
    '<div class="chart-source">Source: Jason Calacanis on producer workload — All-In Podcast E259</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 9: Agent Team Org
   Shows meta-agent architecture
   ============================================ */
Briu.charts.agentTeam = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var agents = [
    { title: 'Email Agent', desc: 'Triage, draft, follow-up', tools: ['Gmail', 'Contacts', 'Calendar'] },
    { title: 'CRM Agent', desc: 'Pipeline, updates, scoring', tools: ['HubSpot', 'PipeDrive', 'Apollo'] },
    { title: 'Research Agent', desc: 'Prospects, competitive intel', tools: ['Web', 'LinkedIn', 'Docs'] },
    { title: 'Reporting Agent', desc: 'Dashboards, summaries, alerts', tools: ['Notion', 'Slack', 'Sheets'] }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">How a real agent deployment is structured</div>' +
    '<div class="agent-org">' +
    '<div class="agent-org-level"><div class="agent-org-node human">' +
    '<div class="agent-org-icon">&#x1f464;</div>' +
    '<div class="agent-org-title">You</div>' +
    '<div class="agent-org-desc">Approve, direct, override</div>' +
    '</div></div>' +
    '<div class="agent-org-connector"></div>' +
    '<div class="agent-org-level"><div class="agent-org-node meta">' +
    '<div class="agent-org-icon">&#x1f9e0;</div>' +
    '<div class="agent-org-title">Meta-Agent</div>' +
    '<div class="agent-org-desc">Manages all agents, checks work, summarizes daily</div>' +
    '</div></div>' +
    '<div class="agent-org-connector"></div>' +
    '<div class="agent-org-level">';
  agents.forEach(function(a) {
    html += '<div class="agent-org-node sub">' +
      '<div class="agent-org-title">' + a.title + '</div>' +
      '<div class="agent-org-desc">' + a.desc + '</div>' +
      '<div class="agent-org-tools">' + a.tools.map(function(t) { return '<span class="agent-org-tool">' + t + '</span>'; }).join('') + '</div>' +
      '</div>';
  });
  html += '</div></div>' +
    '<div class="chart-source">Source: Calacanis "Ultron" meta-agent managing 4 replicants — All-In E261</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 10: Cost Per Hour Comparison
   Agent vs human hourly rates
   ============================================ */
Briu.charts.costPerHour = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var rows = [
    { label: 'AI Agent', price: '$12.50', pct: 8, color: 'var(--forest)' },
    { label: 'Junior Hire', price: '$25', pct: 17, color: 'var(--river)' },
    { label: 'Senior Hire', price: '$50', pct: 33, color: 'var(--gold)' },
    { label: 'Consultant', price: '$150', pct: 100, color: 'var(--coral)' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">Hourly cost comparison — agent vs human labor</div>' +
    '<div class="cph-bars">';
  rows.forEach(function(r) {
    html += '<div class="cph-row">' +
      '<div class="cph-label">' + r.label + '</div>' +
      '<div class="cph-track"><div class="cph-fill" style="--target:' + r.pct + '%;background:' + r.color + '"></div></div>' +
      '<div class="cph-price">' + r.price + '<span style="font-size:0.7rem;color:var(--text-muted)">/hr</span></div>' +
      '</div>';
  });
  html += '</div>' +
    '<div class="cph-savings">' +
    '<div class="cph-savings-num">75-92%</div>' +
    '<div class="cph-savings-label">cost reduction vs human labor for automatable tasks</div>' +
    '</div>' +
    '<div class="chart-source">Agent cost: $300/day ÷ 24hrs (Calacanis, E261). Human rates: US market averages.</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 11: Intelligence Timeline
   AI capability predictions mapped over time
   ============================================ */
Briu.charts.intelligenceTimeline = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var events = [
    { year: '2025', desc: 'AI smarter than any single human', source: 'Elon Musk', color: 'var(--river)' },
    { year: '2026', desc: 'Year of the personal AI assistant', source: 'David Sacks, E259', color: 'var(--gold)' },
    { year: '2028', desc: 'AI smarter than all humans combined', source: 'Elon Musk', color: 'var(--coral)' },
    { year: '2030s', desc: 'AI costs approach zero on local hardware', source: 'Chamath, Friedberg', color: 'var(--forest)' },
    { year: '2040s', desc: '10 billion humanoid robots deployed', source: 'Elon Musk', color: 'var(--gold)' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">AI capability & deployment timeline — industry predictions</div>' +
    '<div class="intel-timeline">' +
    '<div class="intel-track"><div class="intel-track-fill"></div></div>' +
    '<div class="intel-events">';
  events.forEach(function(e) {
    html += '<div class="intel-event">' +
      '<div class="intel-event-year" style="color:' + e.color + '">' + e.year + '</div>' +
      '<div class="intel-event-desc">' + e.desc + '</div>' +
      '<div class="intel-event-source">' + e.source + '</div>' +
      '</div>';
  });
  html += '</div></div>' +
    '<div class="chart-source">These are predictions from industry leaders, not guarantees. The trajectory is directional.</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 12: Ownership Risk Comparison
   Closed source vs self-hosted
   ============================================ */
Briu.charts.ownershipRisk = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var html = '<div class="chart-surface"><div class="chart-label">Closed-source risk vs self-hosted control</div>' +
    '<div class="own-compare">' +
    '<div class="own-col risk">' +
    '<div class="own-col-title">Public AI Endpoints</div>' +
    '<div class="own-items">' +
    '<div class="own-item"><span class="own-item-icon">\u2717</span>All prompts and responses sent to model providers</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2717</span>Agent traces leak proprietary data back to builders</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2717</span>No attorney-client privilege for AI tool usage</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2717</span>One TOS update can break your entire workflow</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2717</span>Vendor sets pricing, rate limits, and access rules</div>' +
    '</div>' +
    '<div class="own-bottom">"You\'re one terms of service update away from everything breaking." \u2014 Chamath</div>' +
    '</div>' +
    '<div class="own-col safe">' +
    '<div class="own-col-title">Self-Hosted / Your Infrastructure</div>' +
    '<div class="own-items">' +
    '<div class="own-item"><span class="own-item-icon">\u2713</span>Data never leaves your environment</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2713</span>Full audit trail on every agent action</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2713</span>You own all code, configs, and agent skills</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2713</span>No vendor lock-in \u2014 switch models anytime</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2713</span>Budget ceilings and approval gates you control</div>' +
    '</div>' +
    '<div class="own-bottom">"You will need AI to survive. But you don\'t have to give up control to get it." \u2014 Briu</div>' +
    '</div>' +
    '</div>' +
    '<div class="chart-source">Source: Chamath Palihapitiya on data sovereignty \u2014 All-In E259, E261</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 13: Compound Loop
   Shows agent learning cycle
   ============================================ */
Briu.charts.compoundLoop = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var steps = [
    { num: '1', title: 'Deploy', desc: 'Agent connects to your tools with read-only access', example: '"Read my email, learn my patterns"' },
    { num: '2', title: 'Work', desc: 'Handles tasks \u2014 triage, drafts, research, data entry', example: '"40 of 50 producer hours automated"' },
    { num: '3', title: 'Learn', desc: 'Every interaction teaches it your business logic', example: '"It doesn\'t forget. It doesn\'t make mistakes."' },
    { num: '4', title: 'Build', desc: 'Creates its own tools to solve recurring problems', example: '"It built its own CRM to track guests"' },
    { num: '5', title: 'Expand', desc: 'Takes on more scope as trust is earned', example: '"5-10% more work migrated every week"' },
    { num: '6', title: 'Compound', desc: 'Each agent makes the next one smarter', example: '"Meta-agent checks the others\' work daily"' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">The agent learning cycle \u2014 why early deployment compounds</div>' +
    '<div class="compound-loop"><div class="compound-loop-ring">';
  steps.forEach(function(s) {
    html += '<div class="cl-step">' +
      '<div class="cl-step-num">' + s.num + '</div>' +
      '<div class="cl-step-title">' + s.title + '</div>' +
      '<div class="cl-step-desc">' + s.desc + '</div>' +
      '<div class="cl-step-example">' + s.example + '</div>' +
      '</div>';
  });
  html += '<div class="cl-center">' +
    '<div class="cl-center-num">\u221E</div>' +
    '<div class="cl-center-label">Knowledge is permanent. It doesn\'t quit, retire, or need retraining.</div>' +
    '</div>';
  html += '</div></div>' +
    '<div class="chart-source">Source: Calacanis (E259, E261), Steinberger (Lex #491)</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};
