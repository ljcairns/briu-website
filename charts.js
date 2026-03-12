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

  var html = '<div class="chart-surface" style="padding:24px 18px 14px">' +
    '<div class="chart-label">What a typical agent deployment looks like</div>' +
    '<div class="constellation constellation-hp">' +

    /* SVG lines — desktop only */
    '<svg class="constellation-lines" viewBox="0 0 700 400" preserveAspectRatio="xMidYMid meet">' +
    /* You to orchestrator */
    '<line x1="350" y1="70" x2="350" y2="160" />' +
    /* Orchestrator to 4 agents */
    '<line x1="350" y1="210" x2="100" y2="320" />' +
    '<line x1="350" y1="210" x2="270" y2="320" />' +
    '<line x1="350" y1="210" x2="440" y2="320" />' +
    '<line x1="350" y1="210" x2="610" y2="320" />' +
    '</svg>' +

    /* Row 1: You */
    '<div class="c-row c-row-hp-you">' +
    '<div class="c-node c-founder">' +
    '<div class="c-circle c-human"><span>You</span></div>' +
    '<div class="c-label">Your Team</div>' +
    '<div class="c-sub">Approve &middot; direct &middot; override</div>' +
    '</div>' +
    '</div>' +
    '<div class="c-connector"></div>' +

    /* Row 2: Orchestrator */
    '<div class="c-row c-row-hp-orch">' +
    '<div class="c-node c-primary">' +
    '<div class="c-circle c-orchestrator"><span>&#x1f9e0;</span></div>' +
    '<div class="c-label">Orchestrator</div>' +
    '<div class="c-sub">Manages agents &middot; checks work &middot; reports daily</div>' +
    '</div>' +
    '</div>' +
    '<div class="c-connector"></div>' +

    /* Row label */
    '<div class="c-row-label c-row-label-hp-agents">Your Agents</div>' +

    /* Row 3: 4 specialist agents */
    '<div class="c-row c-row-hp-agents">' +
    '<div class="c-node c-skill">' +
    '<div class="c-circle c-agent"><span>&#x2709;</span></div>' +
    '<div class="c-label">Email</div>' +
    '<div class="c-sub">Triage &middot; draft &middot; follow-up</div>' +
    '</div>' +
    '<div class="c-node c-skill">' +
    '<div class="c-circle c-agent"><span>&#x1f4ca;</span></div>' +
    '<div class="c-label">CRM</div>' +
    '<div class="c-sub">Pipeline &middot; updates &middot; scoring</div>' +
    '</div>' +
    '<div class="c-node c-skill">' +
    '<div class="c-circle c-agent"><span>&#x1f50d;</span></div>' +
    '<div class="c-label">Research</div>' +
    '<div class="c-sub">Prospects &middot; competitive intel</div>' +
    '</div>' +
    '<div class="c-node c-skill">' +
    '<div class="c-circle c-agent"><span>&#x1f4c8;</span></div>' +
    '<div class="c-label">Reporting</div>' +
    '<div class="c-sub">Dashboards &middot; alerts</div>' +
    '</div>' +
    '</div>' +

    '</div>' + /* end constellation */
    '<div class="chart-source">Typical deployment pattern. Your agents connect to your existing tools — nothing changes without your approval.</div></div>';

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

  var html = '<div class="chart-surface"><div class="chart-label">SaaS dependency vs owning your stack</div>' +
    '<div class="own-compare">' +
    '<div class="own-col risk">' +
    '<div class="own-col-title">Renting AI from a Platform</div>' +
    '<div class="own-items">' +
    '<div class="own-item"><span class="own-item-icon">\u2717</span>Your workflows live inside someone else\'s product</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2717</span>Pricing, features, and limits change without notice</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2717</span>One TOS update can break your entire workflow</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2717</span>Locked into one vendor\'s model and ecosystem</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2717</span>No visibility into what you\'re spending or why</div>' +
    '</div>' +
    '<div class="own-bottom">"You\'re one terms of service update away from everything breaking." \u2014 Chamath</div>' +
    '</div>' +
    '<div class="own-col safe">' +
    '<div class="own-col-title">Owning Your Agent Stack</div>' +
    '<div class="own-items">' +
    '<div class="own-item"><span class="own-item-icon">\u2713</span>You own all code, configs, and agent skills</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2713</span>Your API keys, your accounts \u2014 swap models anytime</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2713</span>Full audit trail on every agent action</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2713</span>Budget ceilings and approval gates you control</div>' +
    '<div class="own-item"><span class="own-item-icon">\u2713</span>Everything keeps running if you stop working with us</div>' +
    '</div>' +
    '<div class="own-bottom">"You will need AI to survive. But you don\'t have to give up control to get it." \u2014 Briu</div>' +
    '</div>' +
    '</div>' +
    '<div class="chart-source">Ownership framing inspired by Chamath Palihapitiya on vendor lock-in \u2014 All-In E259, E261</div></div>';

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


/* ============================================
   Chart 14: Briu Constellation Org
   Circular node architecture — founder hub with agent spokes
   ============================================ */
Briu.charts.briuOrg = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  function card(c) {
    var cls = 'sb-card' + (c.accent ? ' sb-' + c.accent : '') + (c.future ? ' sb-future' : '');
    var h = '<div class="' + cls + '">';
    h += '<div class="sb-card-head">';
    h += '<span class="sb-card-name">' + c.name + '</span>';
    if (c.status) h += '<span class="sb-status sb-status-' + c.status + '">' + (c.status === 'active' ? 'Active' : c.status === 'audit' ? 'Verifying' : 'Open') + '</span>';
    h += '</div>';
    if (c.role) h += '<div class="sb-card-role">' + c.role + '</div>';
    if (c.tools) h += '<div class="sb-card-tools">' + c.tools + '</div>';
    if (c.metric) h += '<div class="sb-card-metric">' + c.metric + '</div>';
    if (c.env) h += '<div class="sb-card-env">' + c.env + '</div>';
    h += '</div>';
    return h;
  }

  var html = '<div class="chart-surface sb-surface" style="padding:24px 18px 14px">' +
    /* Gaudi-inspired organic background */
    '<svg class="sb-bg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">' +
    '<defs>' +
    '<linearGradient id="sbGrad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#D4A05A" stop-opacity="0.06"/><stop offset="100%" stop-color="#5A9DAC" stop-opacity="0.03"/></linearGradient>' +
    '<linearGradient id="sbGrad2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#E07B5F" stop-opacity="0.04"/><stop offset="100%" stop-color="#D4A05A" stop-opacity="0.02"/></linearGradient>' +
    '</defs>' +
    /* Organic arches — Gaudi cathedral windows */
    '<path d="M80,600 Q80,350 200,280 Q320,210 320,600" fill="none" stroke="url(#sbGrad1)" stroke-width="1"/>' +
    '<path d="M120,600 Q120,380 220,320 Q320,260 320,600" fill="none" stroke="url(#sbGrad1)" stroke-width="0.5"/>' +
    '<path d="M680,600 Q680,300 800,250 Q920,200 920,600" fill="none" stroke="url(#sbGrad2)" stroke-width="1"/>' +
    '<path d="M720,600 Q720,340 810,290 Q900,240 900,600" fill="none" stroke="url(#sbGrad2)" stroke-width="0.5"/>' +
    /* Flowing horizontal curves */
    '<path d="M0,150 Q250,100 500,150 Q750,200 1000,130" fill="none" stroke="url(#sbGrad1)" stroke-width="0.6"/>' +
    '<path d="M0,450 Q300,400 600,460 Q850,510 1000,440" fill="none" stroke="url(#sbGrad2)" stroke-width="0.6"/>' +
    /* Scattered mosaic dots */
    '<circle cx="150" cy="180" r="2" fill="#D4A05A" opacity="0.08"/>' +
    '<circle cx="850" cy="120" r="1.5" fill="#5A9DAC" opacity="0.06"/>' +
    '<circle cx="500" cy="500" r="2" fill="#E07B5F" opacity="0.06"/>' +
    '<circle cx="300" cy="80" r="1" fill="#D4A05A" opacity="0.1"/>' +
    '<circle cx="700" cy="400" r="1.5" fill="#5A9DAC" opacity="0.08"/>' +
    '<circle cx="50" cy="350" r="1" fill="#E07B5F" opacity="0.07"/>' +
    '<circle cx="950" cy="500" r="1" fill="#D4A05A" opacity="0.09"/>' +
    '</svg>' +
    '<div class="chart-label">How this company actually runs</div>' +
    '<div class="sb-grid">' +

    /* Left: The human */
    '<div class="sb-col sb-col-human">' +
    '<div class="sb-human-card">' +
      '<div class="sb-human-icon">&#x1f464;</div>' +
      '<div class="sb-human-title">1 Founder</div>' +
      '<div class="sb-human-sub">Judgment &middot; taste &middot; approval</div>' +
      '<div class="sb-human-detail">Every agent action passes through human review. The founder sets direction, approves outputs, and makes the calls that require trust.</div>' +
    '</div>' +
    '<div class="sb-arrow">&rarr;</div>' +
    '</div>' +

    /* Center: VPS Orchestrator */
    '<div class="sb-col sb-col-interfaces">' +
    '<div class="sb-col-label">Orchestrator</div>' +
    card({ name: 'Claw (VPS)', accent: 'gold', status: 'active', role: 'Orchestrator', tools: 'Discord &middot; OpenClaw &middot; HMAC manifests', metric: '<span data-dynamic="agent-skills">9</span> skills &middot; 24/7', env: 'Sandboxed VPS' }) +
    '<div class="sb-arrow" style="text-align:center;color:var(--gold);font-size:0.75rem;padding:4px 0;">HMAC-signed manifests &darr;</div>' +
    card({ name: 'Dispatch Daemon', accent: 'forest', status: 'active', role: 'Task Router', tools: 'Mac &middot; cron &middot; queue', metric: 'Routes tasks to execution agents', env: 'Local machine' }) +
    '</div>' +

    /* Right: Execution Agents */
    '<div class="sb-col sb-col-agents">' +
    '<div class="sb-col-label">Execution Agents</div>' +
    card({ name: 'Claude Code Max', accent: 'forest', status: 'active', role: 'Engineering', tools: 'Terminal &middot; GitHub &middot; full codebase', metric: '<span data-dynamic="website-commits">371</span> website commits', env: 'Local machine' }) +
    card({ name: 'Codex Pro', accent: 'teal', status: 'active', role: 'Parallel Execution', tools: 'Sandboxed &middot; async &middot; batch', metric: 'Overnight &middot; parallel &middot; continuous', env: 'Cloud sandbox' }) +
    card({ name: 'Daily Ops', accent: 'forest', status: 'active', tools: 'Email &middot; CRM &middot; Reports &middot; Cron', metric: 'Morning briefing &middot; cost monitor' }) +
    '</div>' +

    '</div>' + /* end sb-grid */

    '<div class="chart-source">Live architecture. 1 person, VPS orchestrator, Mac dispatch daemon, 3 execution agents. Running cost: $29&ndash;39/day.</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 15: Pyramid to Column
   Yang's org structure shift — AI replaces junior layers
   ============================================ */
Briu.charts.pyramidToColumn = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var html = '<div class="chart-surface"><div class="chart-label">The new org chart</div>' +
    '<div class="p2c-compare">' +

    '<div class="p2c-side p2c-before">' +
    '<div class="p2c-title">Before AI</div>' +
    '<div class="p2c-pyramid">' +
    '<div class="p2c-block p2c-senior" style="width:40%"><span>1 Senior</span></div>' +
    '<div class="p2c-block p2c-junior" style="width:65%"><span>Junior</span></div>' +
    '<div class="p2c-block p2c-junior" style="width:85%"><span>Junior</span></div>' +
    '<div class="p2c-block p2c-junior" style="width:100%"><span>Junior</span></div>' +
    '</div>' +
    '<div class="p2c-ratio">1 : 3</div>' +
    '</div>' +

    '<div class="p2c-arrow">&rarr;</div>' +

    '<div class="p2c-side p2c-after">' +
    '<div class="p2c-title">With AI Agents</div>' +
    '<div class="p2c-column">' +
    '<div class="p2c-block p2c-senior" style="width:60%"><span>1 Senior</span></div>' +
    '<div class="p2c-block p2c-ai" style="width:60%"><span>AI Agents</span></div>' +
    '<div class="p2c-block p2c-junior-kept" style="width:60%"><span>1 Junior</span></div>' +
    '</div>' +
    '<div class="p2c-ratio p2c-ratio-gold">1 : 1 + AI</div>' +
    '</div>' +

    '</div>' +
    '<div class="p2c-quote">\u201CYou used to have pyramids \u2014 three juniors for every senior. Now you have columns. A senior and one junior and you\u2019re good.\u201D</div>' +
    '<div class="chart-source">Andrew Yang \u2014 Moonshots #236</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 16: Sublinear Scaling
   Karpathy's 10x problems = 2-3x effort
   ============================================ */
Briu.charts.sublinearScaling = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var html = '<div class="chart-surface"><div class="chart-label">Sublinear scaling of difficulty</div>' +
    '<div class="sublinear">' +
    '<div class="sublinear-bars">' +
    '<div class="sublinear-row">' +
    '<div class="sublinear-label">Ambition</div>' +
    '<div class="sublinear-track"><div class="sublinear-fill sublinear-ambition" style="--target:100%"><span>10x</span></div></div>' +
    '</div>' +
    '<div class="sublinear-row">' +
    '<div class="sublinear-label">Effort</div>' +
    '<div class="sublinear-track"><div class="sublinear-fill sublinear-effort" style="--target:25%"><span>2\u20133x</span></div></div>' +
    '</div>' +
    '</div>' +
    '<div class="sublinear-center">' +
    '<div class="sublinear-multiplier" data-count="10">0x</div>' +
    '<div class="sublinear-sub">the outcome</div>' +
    '</div>' +
    '<div class="sublinear-insight">When you change the approach \u2014 not just scale the effort \u2014 the economics flip. A 10x more ambitious project costs 2\u20133x more, because you fundamentally redesign how you do it.</div>' +
    '</div>' +
    '<div class="p2c-quote">\u201C10x problems are not 10x hard. Usually a 10x harder problem is like 2 or 3x harder to execute on. Because you fundamentally change the approach.\u201D</div>' +
    '<div class="chart-source">Andrej Karpathy \u2014 Lex Fridman #333 (2022)</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
    var numEl = el.querySelector('.sublinear-multiplier');
    if (numEl) Briu.charts._countUp(numEl, 10, 1600, '', 'x');
  });
};


/* ============================================
   Chart 17: Then vs Now
   Karpathy 2022 predictions vs 2026 reality
   ============================================ */
Briu.charts.thenVsNow = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var rows = [
    { then: '\u201CGPTs can solve problems when prompted\u201D', now: 'GPT-4 and Claude run entire business operations autonomously' },
    { then: '\u201CCopilot is helpful when the pattern is clear\u201D', now: 'AI agents build full applications, deploy code, manage infrastructure' },
    { then: '\u201CWe might share digital space with synthetic beings\u201D', now: 'AI agents operate in Slack, email, CRM, and Discord daily' },
    { then: '\u201CWe might need proof of personhood\u201D', now: 'Content authentication, AI watermarking, and digital signing are shipping' },
    { then: '\u201CHumans are not very good at writing software\u201D', now: 'AI writes, tests, and deploys code faster than human teams' },
    { then: '\u201CFew-shot learning from a handful of examples\u201D', now: 'Zero-shot instruction following \u2014 no examples needed at all' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">What the experts knew was coming</div>' +
    '<div class="tvn-table">' +
    '<div class="tvn-header"><div class="tvn-col-head tvn-then-head">Karpathy, October 2022</div><div class="tvn-col-head tvn-now-head">Reality, March 2026</div></div>';

  rows.forEach(function(r, i) {
    html += '<div class="tvn-row" style="--delay:' + (i * 0.12) + 's">' +
      '<div class="tvn-cell tvn-then">' + r.then + '</div>' +
      '<div class="tvn-cell tvn-now">' + r.now + '</div>' +
      '</div>';
  });

  html += '</div>' +
    '<div class="p2c-quote">\u201CThis is an explosion. We\u2019re living in a firecracker.\u201D</div>' +
    '<div class="chart-source">Andrej Karpathy \u2014 Lex Fridman #333, recorded before ChatGPT launched</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 18: Creation vs Destruction
   100M entrepreneurs vs 15K FAANG layoffs
   ============================================ */
Briu.charts.creationVsDestruction = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var html = '<div class="chart-surface"><div class="chart-label">Net effect of AI on jobs</div>' +
    '<div class="cvd-chart">' +

    '<div class="cvd-row cvd-destroy">' +
    '<div class="cvd-label">FAANG layoffs</div>' +
    '<div class="cvd-track"><div class="cvd-fill cvd-fill-destroy" style="--target:5%"></div></div>' +
    '<div class="cvd-value cvd-value-destroy">15K</div>' +
    '</div>' +

    '<div class="cvd-row cvd-create">' +
    '<div class="cvd-label">New entrepreneurs</div>' +
    '<div class="cvd-track"><div class="cvd-fill cvd-fill-create" style="--target:100%"></div></div>' +
    '<div class="cvd-value cvd-value-create" data-count="100">0M</div>' +
    '</div>' +

    '<div class="cvd-row cvd-create">' +
    '<div class="cvd-label">Jobs they create (x3)</div>' +
    '<div class="cvd-track"><div class="cvd-fill cvd-fill-jobs" style="--target:100%"></div></div>' +
    '<div class="cvd-value cvd-value-create" data-count="300">0M</div>' +
    '</div>' +

    '<div class="cvd-punchline">' +
    '<div class="cvd-ratio" data-count="20000">0x</div>' +
    '<div class="cvd-ratio-label">more creation than destruction</div>' +
    '</div>' +
    '</div>' +

    '<div class="p2c-quote">\u201CWhat happens when 100 million people get their hands on this and they all start their own businesses and they each hire three people? That\u2019s a lot more creation than destruction.\u201D</div>' +
    '<div class="chart-source">Alex Finn \u2014 Moonshots #237</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
    el.querySelectorAll('.cvd-value-create').forEach(function(numEl) {
      Briu.charts._countUp(numEl, parseInt(numEl.getAttribute('data-count')), 1800, '', 'M');
    });
    var ratioEl = el.querySelector('.cvd-ratio');
    if (ratioEl) Briu.charts._countUp(ratioEl, 20000, 2200, '', 'x');
  });
};


/* ============================================
   Chart 19: Cost Arbitrage
   $1,000/day → $10/day with open-source
   ============================================ */
Briu.charts.costArbitrage = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var stages = [
    { label: 'Closed-source APIs', cost: 1000, color: 'var(--coral)', detail: 'Full Claude/GPT API at scale — Calacanis E259' },
    { label: 'Hybrid routing', cost: 100, color: 'var(--gold)', detail: '95% local, 5% cloud fallback — Calacanis E259' },
    { label: 'Optimized local', cost: 10, color: 'var(--forest)', detail: 'Open-source on commodity hardware — Chamath E259' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">Daily agent cost by deployment model</div>' +
    '<div class="arb-chart">';

  stages.forEach(function(s, i) {
    var pct = (s.cost / 1000) * 100;
    html += '<div class="arb-row">' +
      '<div class="arb-label">' + s.label + '</div>' +
      '<div class="arb-track"><div class="arb-fill" style="--target:' + pct + '%;background:' + s.color + ';transition-delay:' + (i * 0.3) + 's"></div></div>' +
      '<div class="arb-price" data-count="' + s.cost + '">$0</div>' +
      '</div>' +
      '<div class="arb-detail">' + s.detail + '</div>';
  });

  html += '<div class="arb-savings">' +
    '<div class="arb-savings-num" data-count="100">0x</div>' +
    '<div class="arb-savings-label">cost reduction possible</div>' +
    '</div>' +
    '</div>' +
    '<div class="p2c-quote">\u201CYou\u2019re going to cut the cost of AI by 90%. And when you do that, your bill is going to be 10 bucks a day.\u201D</div>' +
    '<div class="chart-source">Chamath Palihapitiya \u2014 All-In Podcast E259</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
    el.querySelectorAll('.arb-price').forEach(function(numEl) {
      Briu.charts._countUp(numEl, parseInt(numEl.getAttribute('data-count')), 1400, '$', '/day');
    });
    var savEl = el.querySelector('.arb-savings-num');
    if (savEl) Briu.charts._countUp(savEl, 100, 1800, '', 'x');
  });
};


/* ============================================
   Chart 20: Energy Bottleneck
   Chip production vs power availability
   ============================================ */
Briu.charts.energyBottleneck = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var data = [
    { year: '2024', chips: 15, power: 20, label: 'Balanced' },
    { year: '2025', chips: 35, power: 22, label: 'Gap opens' },
    { year: '2026', chips: 60, power: 25, label: 'Chips outpace power' },
    { year: '2028', chips: 85, power: 40, label: 'Energy scramble' },
    { year: '2030', chips: 100, power: 60, label: '100 GW target' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">AI chip production vs energy availability</div>' +
    '<div class="enb-chart">' +
    '<div class="enb-legend">' +
    '<span class="enb-legend-item"><span class="enb-dot" style="background:var(--gold)"></span>Chip capacity</span>' +
    '<span class="enb-legend-item"><span class="enb-dot" style="background:var(--forest)"></span>Power available</span>' +
    '</div>' +
    '<div class="enb-bars">';

  data.forEach(function(d, i) {
    html += '<div class="enb-col" style="--delay:' + (i * 0.15) + 's">' +
      '<div class="enb-bar-pair">' +
      '<div class="enb-bar enb-bar-chip" style="--target:' + d.chips + '%"></div>' +
      '<div class="enb-bar enb-bar-power" style="--target:' + d.power + '%"></div>' +
      '</div>' +
      '<div class="enb-year">' + d.year + '</div>' +
      '<div class="enb-label">' + d.label + '</div>' +
      '</div>';
  });

  html += '</div>' +
    '<div class="enb-gap-callout">' +
    '<div class="enb-gap-label">The Gap</div>' +
    '<div class="enb-gap-desc">Businesses that deploy now lock in capacity before the energy crunch hits.</div>' +
    '</div>' +
    '</div>' +
    '<div class="p2c-quote">\u201CTowards the end of this year, chip production will probably outpace the ability to turn chips on.\u201D</div>' +
    '<div class="chart-source">Elon Musk \u2014 Stripe interview, 2026</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 21: Time Compression
   4 years = 40 years of change
   ============================================ */
Briu.charts.timeCompression = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var milestones = [
    { year: '2022', event: 'ChatGPT launches', detail: 'First public LLM chatbot' },
    { year: '2023', event: 'GPT-4 + agents emerge', detail: 'Autonomous tool use begins' },
    { year: '2024', event: 'Open-source catches up', detail: 'Llama, Mistral close the gap' },
    { year: '2025', event: 'Agent frameworks go viral', detail: 'OpenClaw: 175K GitHub stars' },
    { year: '2026', event: 'Agents run businesses', detail: '24/7 autonomous operations' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">4 years of AI = 40 years of change</div>' +
    '<div class="tc-chart">' +
    '<div class="tc-track"><div class="tc-track-fill"></div></div>' +
    '<div class="tc-milestones">';

  milestones.forEach(function(m, i) {
    html += '<div class="tc-milestone" style="--delay:' + (i * 0.2) + 's">' +
      '<div class="tc-dot" style="background:' + (i === 4 ? 'var(--gold)' : 'var(--forest)') + ';box-shadow:0 0 12px ' + (i === 4 ? 'rgba(212,160,90,0.4)' : 'rgba(77,128,112,0.3)') + '"></div>' +
      '<div class="tc-year">' + m.year + '</div>' +
      '<div class="tc-event">' + m.event + '</div>' +
      '<div class="tc-detail">' + m.detail + '</div>' +
      '</div>';
  });

  html += '</div>' +
    '<div class="tc-punchline">' +
    '<div class="tc-punchline-num" data-count="40">0</div>' +
    '<div class="tc-punchline-label">years of change compressed into 4</div>' +
    '</div>' +
    '</div>' +
    '<div class="p2c-quote">\u201CAI is accelerating at a rate where four years is like 40 years.\u201D</div>' +
    '<div class="chart-source">Peter Diamandis \u2014 Moonshots #236</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
    var numEl = el.querySelector('.tc-punchline-num');
    if (numEl) Briu.charts._countUp(numEl, 40, 1800, '', ' years');
  });
};


/* ============================================
   Chart 22: $200 to $5M
   Subscription to company value
   ============================================ */
Briu.charts.subscriptionToCompany = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var steps = [
    { label: 'Anthropic sub', value: '$200/mo', icon: '1', color: 'var(--text-muted)', desc: 'Claude Max subscription' },
    { label: 'Pick a niche', value: '1 week', icon: '2', color: 'var(--river)', desc: 'CRM for grocery stores, marketing for lumberyards' },
    { label: 'Build with agents', value: '2-4 weeks', icon: '3', color: 'var(--gold)', desc: 'Agents build your product' },
    { label: 'Revenue', value: '$5M+', icon: '4', color: 'var(--forest)', desc: 'Vertical SaaS in weeks, not years' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">From subscription to company</div>' +
    '<div class="s2c-chart">';

  steps.forEach(function(s, i) {
    html += '<div class="s2c-step" style="--delay:' + (i * 0.2) + 's">' +
      '<div class="s2c-num" style="color:' + s.color + '">' + s.icon + '</div>' +
      '<div class="s2c-content">' +
      '<div class="s2c-label">' + s.label + '</div>' +
      '<div class="s2c-value" style="color:' + s.color + '">' + s.value + '</div>' +
      '<div class="s2c-desc">' + s.desc + '</div>' +
      '</div>' +
      '</div>';
    if (i < steps.length - 1) {
      html += '<div class="s2c-arrow">\u2192</div>';
    }
  });

  html += '</div>' +
    '<div class="s2c-multiplier">' +
    '<div class="s2c-multiplier-num">25,000x</div>' +
    '<div class="s2c-multiplier-label">potential return on $200/mo</div>' +
    '</div>' +
    '<div class="p2c-quote">\u201CTake OpenClaw, find one very specific sliver \u2014 and build the OpenClaw version for that. I think that\u2019s a $5 million company overnight that only cost you $200 for your Anthropic subscription.\u201D</div>' +
    '<div class="chart-source">Alex Finn \u2014 Moonshots #237</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};


/* ============================================
   Chart 23: Software Factory
   5 agents building autonomously
   ============================================ */
Briu.charts.softwareFactory = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var agents = [
    { name: 'Scout', role: 'Research', model: 'MiniMax', color: 'var(--river)', desc: 'Monitors web 24/7, finds opportunities' },
    { name: 'Analyst', role: 'Evaluate', model: 'ChatGPT', color: 'var(--gold)', desc: 'Assesses market fit, prioritizes' },
    { name: 'Charlie', role: 'Build', model: 'Qwen 3.5', color: 'var(--forest)', desc: 'Codes solutions autonomously' },
    { name: 'Ralph', role: 'QA', model: 'ChatGPT', color: 'var(--coral)', desc: 'Reviews code, catches bugs' },
    { name: 'Henry', role: 'Orchestrate', model: 'Opus 4.6', color: 'var(--gold-bright)', desc: 'Manages all agents, reports to human' }
  ];

  var html = '<div class="chart-surface"><div class="chart-label">The autonomous software factory</div>' +
    '<div class="sf-chart">' +
    '<div class="sf-pipeline">';

  agents.forEach(function(a, i) {
    html += '<div class="sf-node" style="--delay:' + (i * 0.15) + 's">' +
      '<div class="sf-node-circle" style="border-color:' + a.color + ';box-shadow:0 0 16px ' + a.color.replace('var(', 'rgba(').replace(')', ',0.15)') + '">' +
      '<span style="color:' + a.color + '">' + a.name.charAt(0) + '</span>' +
      '</div>' +
      '<div class="sf-node-name">' + a.name + '</div>' +
      '<div class="sf-node-role" style="color:' + a.color + '">' + a.role + '</div>' +
      '<div class="sf-node-model">' + a.model + '</div>' +
      '<div class="sf-node-desc">' + a.desc + '</div>' +
      '</div>';
    if (i < agents.length - 1) {
      html += '<div class="sf-connector">\u2192</div>';
    }
  });

  html += '</div>' +
    '<div class="sf-stats">' +
    '<div class="sf-stat"><div class="sf-stat-num">5</div><div class="sf-stat-label">Agents</div></div>' +
    '<div class="sf-stat"><div class="sf-stat-num">24/7</div><div class="sf-stat-label">Always on</div></div>' +
    '<div class="sf-stat"><div class="sf-stat-num">1</div><div class="sf-stat-label">Human</div></div>' +
    '<div class="sf-stat"><div class="sf-stat-num">$0</div><div class="sf-stat-label">Local inference</div></div>' +
    '</div>' +
    '</div>' +
    '<div class="p2c-quote">\u201CI\u2019ve pretty much built a software factory where I have five OpenClaws working together to build and improve software autonomously.\u201D</div>' +
    '<div class="chart-source">Alex Finn \u2014 Moonshots #237</div></div>';

  container.innerHTML = html;
  container.classList.add('briu-chart');

  Briu.charts._observe(container, function(el) {
    el.classList.add('visible');
  });
};
