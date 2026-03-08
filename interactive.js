/* ========================================
   Briu Interactive Features
   Assessment · Calculator · Personalization
   ======================================== */

/* AI Readiness Assessment */
(function() {
  'use strict';
  var KEY = 'briu_assess';
  var STEPS = 4;
  var answers = {};

  // Restore saved results
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) {
      answers = JSON.parse(saved);
      var ready = function() { showResults(true); };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
      else ready();
    }
  } catch(e) {}

  window.assessSelect = function(step, btn) {
    var opts = btn.parentElement.querySelectorAll('.assess-opt');
    for (var i = 0; i < opts.length; i++) opts[i].classList.remove('selected');
    btn.classList.add('selected');
    answers['q' + step] = btn.getAttribute('data-value');

    var bar = document.getElementById('assessProgress');
    if (bar) bar.style.width = ((step / STEPS) * 100) + '%';

    setTimeout(function() {
      var cur = document.getElementById('assess-' + step);
      if (cur) cur.classList.remove('active');
      if (step < STEPS) {
        var nxt = document.getElementById('assess-' + (step + 1));
        if (nxt) nxt.classList.add('active');
      } else {
        try { localStorage.setItem(KEY, JSON.stringify(answers)); } catch(e) {}
        showResults(false);
      }
    }, 250);
  };

  window.resetAssess = function() {
    try { localStorage.removeItem(KEY); } catch(e) {}
    answers = {};
    var r = document.getElementById('assessResult');
    if (r) { r.classList.remove('active'); r.innerHTML = ''; }
    var s1 = document.getElementById('assess-1');
    if (s1) s1.classList.add('active');
    var bar = document.getElementById('assessProgress');
    if (bar) bar.style.width = '0%';
    var opts = document.querySelectorAll('.assess-opt');
    for (var i = 0; i < opts.length; i++) opts[i].classList.remove('selected');
    removePersonalization();
  };

  function score() {
    var s = 0;
    s += ({founder:20, leader:20, ic:10, exploring:15})[answers.q1] || 15;
    s += ({solo:15, small:20, medium:25, large:20})[answers.q2] || 20;
    s += ({none:5, free:15, paid:25, building:30})[answers.q3] || 15;
    s += 20;
    return Math.min(s, 95);
  }

  function persona(s) {
    if (s >= 80) return { label: 'Ready to deploy', desc: 'You have the foundation and the awareness. The fastest path is a focused first deployment on the workflow that costs you the most time.' };
    if (s >= 65) return { label: 'Strong foundation', desc: 'You know where the time goes and you have some AI experience. A structured kickoff will get your first agent running within a week.' };
    return { label: 'Perfect starting point', desc: 'You are at the ideal moment to start right. A single focused deployment will teach your team more than months of exploration.' };
  }

  function recs() {
    var r = [];
    var uc = {
      email: { t: 'Start with email triage', d: 'An agent that reads, categorizes, and drafts responses. Most founders save 1-2 hours daily.' },
      sales: { t: 'Start with sales prospecting', d: 'Agent-powered lead research, personalized outreach drafts, and CRM updates.' },
      reporting: { t: 'Start with automated reporting', d: 'Daily and weekly reports from your existing data. PDF delivery, trend analysis, anomaly alerts.' },
      ops: { t: 'Start with operations automation', d: 'CRM hygiene, calendar management, task routing. Admin work that eats hours but needs minimal judgment.' },
      support: { t: 'Start with support triage', d: 'Inbound request sorting, draft responses, smart routing. Nothing sends without approval.' }
    };
    var pick = uc[answers.q4] || uc.email;
    r.push({ title: pick.t, desc: pick.d });

    if (answers.q2 === 'solo' || answers.q2 === 'small')
      r.push({ title: 'Founder Kickoff — $3,500', desc: 'One working session. Workflow mapping, first agent deployed, written architecture plan.' });
    else
      r.push({ title: 'Team Kickoff — $5,000', desc: 'Full team briefing, exec sessions, first agent deployed, and a roadmap your whole team can execute.' });

    if (answers.q3 === 'none' || answers.q3 === 'free')
      r.push({ title: 'Read: Why Now', desc: 'The economics, timing, and case for controlled early deployment.', link: '/why-now/' });
    else
      r.push({ title: 'Read: How we built Briu', desc: 'Our exact toolchain, costs, and what agents can and cannot do.', link: '/build/' });

    return r;
  }

  function showResults(instant) {
    var el = document.getElementById('assessResult');
    if (!el) return;
    var s = score();
    var p = persona(s);
    var rc = recs();
    var angle = (s / 100) * 360;

    var h = '<div class="assess-gauge" style="background:conic-gradient(var(--gold) 0deg,var(--gold) ' + angle + 'deg,rgba(255,255,255,0.06) ' + angle + 'deg)">' +
      '<div class="assess-gauge-inner"><div class="assess-gauge-score">' + (instant ? s : '0') + '</div><div class="assess-gauge-label">Readiness</div></div></div>' +
      '<h3 class="assess-persona">' + p.label + '</h3>' +
      '<p class="assess-desc">' + p.desc + '</p><div class="assess-recs">';

    for (var i = 0; i < rc.length; i++) {
      h += '<div class="assess-rec"><p><strong>' + rc[i].title + '</strong> — ' + rc[i].desc;
      if (rc[i].link) h += ' <a href="' + rc[i].link + '" style="color:var(--gold)">Read →</a>';
      h += '</p></div>';
    }

    h += '</div><div class="assess-cta-group">' +
      '<a href="#" onclick="openContactForm();return false" class="hero-cta-primary cta-shimmer">Book a Call</a>' +
      '<a href="#services" class="hero-cta-secondary">See pricing</a></div>' +
      '<button class="assess-retake" onclick="resetAssess()">Retake assessment</button>';

    el.innerHTML = h;
    el.classList.add('active');

    for (var j = 1; j <= STEPS; j++) {
      var step = document.getElementById('assess-' + j);
      if (step) step.classList.remove('active');
    }
    var bar = document.getElementById('assessProgress');
    if (bar) bar.style.width = '100%';

    // Animate score
    if (!instant) {
      var scoreEl = el.querySelector('.assess-gauge-score');
      if (scoreEl) countUp(scoreEl, 0, s, 1200);
    }

    personalizePageSections();
  }

  function countUp(el, from, to, dur) {
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var ease = p < 0.5 ? 2*p*p : -1 + (4 - 2*p)*p;
      el.textContent = Math.round(from + (to - from) * ease);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function personalizePageSections() {
    // Reorder use cases
    var orderMap = {
      email: ['Personal Assistants', 'Autonomous Operations', 'Email, CRM', 'Reporting'],
      sales: ['Email, CRM', 'Personal Assistants', 'Autonomous Operations', 'Reporting'],
      reporting: ['Reporting', 'Autonomous Operations', 'Email, CRM', 'Personal Assistants'],
      ops: ['Autonomous Operations', 'Personal Assistants', 'Email, CRM', 'Reporting'],
      support: ['Personal Assistants', 'Email, CRM', 'Autonomous Operations', 'Reporting']
    };
    var order = orderMap[answers.q4] || orderMap.email;
    var cards = document.querySelectorAll('.use-case');
    for (var i = 0; i < cards.length; i++) {
      var h3 = cards[i].querySelector('h3');
      if (!h3) continue;
      for (var j = 0; j < order.length; j++) {
        if (h3.textContent.indexOf(order[j]) !== -1) {
          cards[i].style.order = j;
          if (j === 0) cards[i].style.borderColor = 'rgba(212,160,90,0.3)';
          else cards[i].style.borderColor = '';
          break;
        }
      }
    }

    // Highlight recommended tier
    var recTier = (answers.q2 === 'solo' || answers.q2 === 'small') ? 'Founder' : 'Team';
    var kickoffs = document.querySelectorAll('.kickoff-card');
    for (var k = 0; k < kickoffs.length; k++) {
      var name = kickoffs[k].querySelector('.tier-name');
      if (!name) continue;
      var existing = kickoffs[k].querySelector('.rec-badge');
      if (existing) existing.remove();

      if (name.textContent.indexOf(recTier) !== -1) {
        kickoffs[k].style.borderColor = 'rgba(212,160,90,0.4)';
        var badge = document.createElement('div');
        badge.className = 'rec-badge';
        badge.textContent = 'Recommended for you';
        kickoffs[k].insertBefore(badge, kickoffs[k].firstChild);
      } else {
        kickoffs[k].style.borderColor = '';
      }
    }
  }

  function removePersonalization() {
    var cards = document.querySelectorAll('.use-case');
    for (var i = 0; i < cards.length; i++) { cards[i].style.order = ''; cards[i].style.borderColor = ''; }
    var kickoffs = document.querySelectorAll('.kickoff-card');
    for (var k = 0; k < kickoffs.length; k++) {
      kickoffs[k].style.borderColor = '';
      var badge = kickoffs[k].querySelector('.rec-badge');
      if (badge) badge.remove();
    }
  }
})();


/* Cost Calculator */
(function() {
  'use strict';

  window.setComplexity = function(val, btn) {
    var toggles = btn.parentElement.querySelectorAll('.calc-toggle');
    for (var i = 0; i < toggles.length; i++) toggles[i].classList.remove('active');
    btn.classList.add('active');
    updateCalc();
  };

  window.updateCalc = function() {
    var hoursEl = document.getElementById('calcHours');
    var rateEl = document.getElementById('calcRate');
    if (!hoursEl || !rateEl) return;

    var hours = parseFloat(hoursEl.value) || 4;
    var rate = parseFloat(rateEl.value) || 50;

    var activeToggle = document.querySelector('.calc-toggle.active');
    var complexity = activeToggle ? activeToggle.getAttribute('data-val') : 'practical';

    document.getElementById('calcHoursVal').textContent = hours + 'h/day';
    document.getElementById('calcRateVal').textContent = '$' + rate + '/hr';

    var currentMonthly = Math.round(hours * rate * 22);
    var dailyAgent = ({practical: 3.50, moderate: 15, frontier: 50})[complexity] || 3.50;
    var agentMonthly = Math.round(dailyAgent * 30);
    var platform = 200;
    var totalAgent = agentMonthly + platform;
    var savings = currentMonthly - totalAgent;
    var pct = currentMonthly > 0 ? Math.round((savings / currentMonthly) * 100) : 0;

    document.getElementById('calcCurrentCost').textContent = '$' + currentMonthly.toLocaleString();
    document.getElementById('calcAgentCost').textContent = '$' + totalAgent.toLocaleString();
    document.getElementById('calcAgentBreakdown').textContent = '($' + agentMonthly + ' API + $200 platform)';

    var sav = document.getElementById('calcSavings');
    if (savings > 0) {
      sav.innerHTML = '<div class="calc-savings-num">$' + savings.toLocaleString() + '<span>/mo</span></div><div class="calc-savings-label">Estimated savings (' + pct + '% reduction)</div>';
      sav.className = 'calc-savings positive';
    } else {
      sav.innerHTML = '<div class="calc-savings-label">At this rate, an agent is cost-comparable. The value is in speed, consistency, and 24/7 availability.</div>';
      sav.className = 'calc-savings neutral';
    }
  };

  var init = function() { if (document.getElementById('calcHours')) updateCalc(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
