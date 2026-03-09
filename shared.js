/* ===== Briu Shared Scripts ===== */

/* ─── User State & Personalization ─── */
(function() {
  var user = { email: null, company: null, answers: null, stage: 'visitor', score: 0 };
  try {
    var e = localStorage.getItem('briu_email');
    if (e) user.email = e;
    var c = localStorage.getItem('briu_company');
    if (c) user.company = JSON.parse(c);
    var a = localStorage.getItem('briu_assess');
    if (a) user.answers = JSON.parse(a);
    var s = localStorage.getItem('briu_stage');
    if (s) user.stage = s;
    var conv = localStorage.getItem('briu_conv');
    if (conv) {
      var p = JSON.parse(conv);
      if (p.msgs && p.msgs.length > 0 && user.stage === 'assessed') user.stage = 'chatting';
    }
  } catch(ex) {}

  // Compute score if answers exist
  if (user.answers && user.answers.q1) {
    var sc = 0;
    sc += ({founder:20, leader:20, ic:10, exploring:15})[user.answers.q1] || 15;
    sc += ({solo:15, small:20, medium:25, large:20})[user.answers.q2] || 20;
    sc += ({none:5, free:15, paid:25, building:30})[user.answers.q3] || 15;
    sc += 20;
    user.score = Math.min(sc, 95);
    if (user.stage === 'visitor') user.stage = 'assessed';
  }

  window.Briu = { user: user };

  // Update stage helper — called by interactive.js and chat-bubble.js
  window.briuSetStage = function(stage) {
    user.stage = stage;
    try { localStorage.setItem('briu_stage', stage); } catch(ex) {}
  };

  // ─── Cross-page personalization (runs on all pages) ───
  function personalize() {
    if (!user.answers) return;

    // Pre-fill contact form name/email if available
    var nameInput = document.getElementById('q-name');
    var emailInput = document.getElementById('q-email');
    if (emailInput && user.email && !emailInput.value) emailInput.value = user.email;
    if (nameInput && user.email && !nameInput.value) {
      var prefix = user.email.split('@')[0].replace(/[._-]/g, ' ');
      nameInput.value = prefix.replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    }

    // Highlight recommended kickoff tier on any page
    var recTier = (user.answers.q2 === 'solo' || user.answers.q2 === 'small') ? 'Founder' : 'Team';
    var tiers = document.querySelectorAll('.tier, .kickoff-card, .kickoff-pair .tier');
    tiers.forEach(function(t) {
      var name = t.querySelector('.tier-name, h3');
      if (!name) return;
      var existing = t.querySelector('.rec-badge');
      if (existing) return; // don't double-badge
      if (name.textContent.indexOf(recTier) !== -1) {
        t.style.borderColor = 'rgba(212,160,90,0.4)';
        var badge = document.createElement('div');
        badge.className = 'rec-badge';
        badge.textContent = 'Recommended for you';
        t.insertBefore(badge, t.firstChild);
      }
    });

    // Company-aware CTAs
    if (user.company && user.company.name) {
      var ctas = document.querySelectorAll('[data-personalize-cta]');
      ctas.forEach(function(el) {
        el.textContent = el.getAttribute('data-personalize-cta').replace('{company}', user.company.name);
      });
    }

    // Stage-aware CTA text
    var stageCtas = document.querySelectorAll('[data-stage-cta]');
    stageCtas.forEach(function(el) {
      if (user.stage === 'chatting' || user.stage === 'contacted') {
        el.textContent = 'Continue the conversation';
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', personalize);
  else personalize();
})();

/* Contact Form Modal (branching quiz) */
var qData = {};

// Focus picks: branched by AI level
var focusPicks = {
  starter: [
    { val: 'email', label: 'Email & inbox management', desc: 'Triage, drafts, follow-ups' },
    { val: 'reporting', label: 'Reports & dashboards', desc: 'Weekly summaries, data pulls' },
    { val: 'admin', label: 'Admin & scheduling', desc: 'Calendar, tasks, reminders' },
  ],
  paid: [
    { val: 'email', label: 'Email & communications', desc: 'Triage, drafts, routing' },
    { val: 'sales', label: 'Sales & CRM', desc: 'Prospecting, pipeline, outreach' },
    { val: 'reporting', label: 'Reporting & analytics', desc: 'Automated dashboards, alerts' },
    { val: 'ops', label: 'Operations & workflows', desc: 'Multi-step processes, handoffs' },
  ],
  building: [
    { val: 'orchestration', label: 'Multi-agent orchestration', desc: 'Coordinated systems, routing' },
    { val: 'integration', label: 'Tool integrations', desc: 'Connect existing stack to agents' },
    { val: 'security', label: 'Security & controls', desc: 'Approvals, audit, sandboxing' },
    { val: 'scale', label: 'Scaling what we have', desc: 'More agents, better reliability' },
  ]
};

function openContactForm(prefill) {
  document.getElementById('contactModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  if (prefill && prefill.ai_usage) {
    qData.ai_usage = prefill.ai_usage;
    document.getElementById('q-ai-usage').value = prefill.ai_usage;
    if (prefill.automate) document.getElementById('q-automate').value = prefill.automate;
    document.getElementById('q-automate-val').value = prefill.automate || '';
    goToStep(4);
    var dots = document.querySelectorAll('#contactModal .q-dot');
    dots.forEach(function(d) { d.classList.add('filled'); });
  } else if (window.Briu && window.Briu.user && window.Briu.user.answers) {
    var u = window.Briu.user;
    var aiMap = { none: 'starter', free: 'starter', paid: 'paid', building: 'building' };
    qData.ai_level = aiMap[u.answers.q3] || 'starter';
    qData.ai_usage = u.answers.q3 || '';
    document.getElementById('q-ai-usage').value = qData.ai_usage;
    if (u.answers.q2) {
      qData.team_size = u.answers.q2;
      document.getElementById('q-team-size').value = u.answers.q2;
    }
    buildFocusPicks();
    goToStep(3);
    var dots = document.querySelectorAll('#contactModal .q-dot');
    for (var di = 0; di < 2; di++) if (dots[di]) dots[di].classList.add('filled');
  } else {
    goToStep(1);
  }
}
function closeContactForm() { document.getElementById('contactModal').classList.remove('active'); document.body.style.overflow = ''; }

function goToStep(n) {
  document.querySelectorAll('#contactModal .q-step').forEach(function(el) { el.classList.remove('active'); });
  var step = document.getElementById('q-step-' + n);
  if (step) step.classList.add('active');
  var dots = document.querySelectorAll('#contactModal .q-dot');
  dots.forEach(function(d, i) { d.classList.toggle('filled', i < n); });
  // Build recommendation on final step
  if (n === 4) buildRecommendation();
}

function selectAI(val) {
  qData.ai_usage = val;
  document.getElementById('q-ai-usage').value = val;
  // Determine AI level from the button's data attribute
  var btn = event.target.closest('.q-option');
  qData.ai_level = btn ? btn.getAttribute('data-ai-level') : 'starter';
  goToStep(2);
}

function selectTeam(val) {
  qData.team_size = val;
  document.getElementById('q-team-size').value = val;
  buildFocusPicks();
  goToStep(3);
}
window.selectTeam = selectTeam;

function buildFocusPicks() {
  var container = document.getElementById('q-focus-picks');
  if (!container) return;
  container.innerHTML = '';
  var picks = focusPicks[qData.ai_level] || focusPicks.starter;
  for (var i = 0; i < picks.length; i++) {
    var p = picks[i];
    var btn = document.createElement('button');
    btn.className = 'q-option q-focus-opt';
    btn.setAttribute('data-focus', p.val);
    btn.innerHTML = '<div class="q-opt-label">' + p.label + '</div><div class="q-opt-desc">' + p.desc + '</div>';
    btn.addEventListener('click', (function(val) {
      return function() {
        qData.focus = val;
        document.getElementById('q-focus-val').value = val;
        // Highlight selected
        var opts = container.querySelectorAll('.q-focus-opt');
        for (var j = 0; j < opts.length; j++) opts[j].classList.toggle('q-option-selected', opts[j] === this);
      };
    })(p.val));
    container.appendChild(btn);
  }
}

function buildRecommendation() {
  var rec = document.getElementById('q-recommendation');
  if (!rec) return;
  var isLargeTeam = qData.team_size === 'medium' || qData.team_size === 'large';
  var isAdvanced = qData.ai_level === 'building';
  var tier, tierNote;
  if (isLargeTeam) {
    tier = 'Kickoff + Workshop — $7,500';
    tierNote = 'Recommended for teams of 10+. Includes hands-on sessions with your team members.';
  } else if (isAdvanced) {
    tier = 'Kickoff — $5,000';
    tierNote = 'Since you\'re already building, we\'ll focus on architecture review and scaling.';
  } else {
    tier = 'Kickoff — $5,000';
    tierNote = 'We\'ll map your workflows and deploy your first agent in the session.';
  }
  rec.innerHTML = '<div style="padding:0.75rem 1rem;background:rgba(212,160,90,0.05);border-left:2px solid var(--gold);margin-bottom:0.5rem;">' +
    '<div style="font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--gold);margin-bottom:0.25rem;">Recommended</div>' +
    '<div style="font-size:0.95rem;color:var(--text);font-weight:500;">' + tier + '</div>' +
    '<div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.25rem;">' + tierNote + '</div>' +
    '</div>';
}

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeContactForm(); });

document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault(); var form = this;
  document.getElementById('q-automate-val').value = document.getElementById('q-automate').value;
  if (qData.focus) document.getElementById('q-focus-val').value = qData.focus;
  var btn = form.querySelector('.modal-btn'); btn.textContent = 'Sending...'; btn.disabled = true;
  fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) })
  .then(function(r) { return r.json(); }).then(function() {
    document.querySelectorAll('#contactModal .q-step').forEach(function(el) { el.classList.remove('active'); });
    document.querySelector('#contactModal .q-progress').style.display = 'none'; document.getElementById('formSuccess').style.display = 'block';
    setTimeout(function() { closeContactForm(); document.querySelector('#contactModal .q-progress').style.display = ''; document.getElementById('formSuccess').style.display = ''; form.reset(); document.getElementById('q-automate').value = ''; btn.textContent = 'Send'; btn.disabled = false; qData = {}; }, 3000);
  }).catch(function() { btn.textContent = 'Error — try again'; btn.disabled = false; });
});

/* Scroll Progress Bar — sits in header, below nav, no positioning tricks */
(function() {
  var bar = document.getElementById('navProgress');
  if (!bar) return;
  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) bar.style.width = (scrollTop / docHeight) * 100 + '%';
  }, { passive: true });
})();

/* Scroll Reveal */
var revealEls = document.querySelectorAll('.reveal, .reveal-scale');
var revealObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObs.unobserve(entry.target); } });
}, { threshold: 0.15 });
revealEls.forEach(function(el) { revealObs.observe(el); });

/* Cursor Glow (desktop only) */
(function() {
  if (window.matchMedia('(pointer: fine)').matches) {
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    var mx = 0, my = 0, gx = 0, gy = 0;
    document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
    (function render() {
      gx += (mx - gx) * 0.15; gy += (my - gy) * 0.15;
      glow.style.transform = 'translate(' + (gx - 200) + 'px,' + (gy - 200) + 'px)';
      requestAnimationFrame(render);
    })();
  }
})();

/* Number Counter Animation */
(function() {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  var counterObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseFloat(el.getAttribute('data-count'));
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = (target % 1 !== 0) ? (target.toString().split('.')[1] || '').length : 0;
      var start = 0, duration = 1500, startTime = null;
      function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
      function step(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / duration, 1);
        var val = start + (target - start) * ease(p);
        el.textContent = prefix + val.toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.3 });
  counters.forEach(function(el) { counterObs.observe(el); });
})();

/* Card Tilt on Hover (desktop only) */
(function() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  var cards = document.querySelectorAll('.use-case, .stat-box, .kickoff-card, .trust-card, .cost-card, .build-item, .tier');
  cards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'perspective(800px) rotateY(' + (x * 4) + 'deg) rotateX(' + (-y * 4) + 'deg) translateY(-3px)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });
})();

/* Page Transitions */
(function() {
  if (!window.fetch || !history.pushState) return;
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    // Only internal page links (not anchors, modals, or external)
    if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('http') === 0) return;
    if (link.getAttribute('onclick')) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    var main = document.querySelector('main');
    if (!main) { location.href = href; return; }
    main.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    main.style.opacity = '0';
    main.style.transform = 'translateY(-8px)';
    setTimeout(function() { location.href = href; }, 200);
  });
  // Fade in on load
  var main = document.querySelector('main');
  if (main) {
    main.style.opacity = '0';
    main.style.transform = 'translateY(8px)';
    main.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
      });
    });
  }
  // Fix back button: bfcache restores page with exit animation applied
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      var m = document.querySelector('main');
      if (m) {
        m.style.transition = 'none';
        m.style.opacity = '1';
        m.style.transform = 'translateY(0)';
      }
    }
  });
})();

/* Magnetic Buttons (desktop only) */
(function() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  var btns = document.querySelectorAll('.cta-nav, .modal-btn, .cta');
  btns.forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) * 0.15;
      var dy = (e.clientY - cy) * 0.15;
      btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.transform = '';
    });
  });
})();

/* ─── Booking (Invoice / Crypto) ─── */
window.bookTier = function(tier) {
  var tierNames = { kickoff: 'Kickoff — $5,000', 'kickoff+workshop': 'Kickoff + Workshop — $7,500' };
  window._bookingTier = tier;
  var modal = document.getElementById('bookingModal');
  if (!modal) return;
  var label = modal.querySelector('.booking-tier-label');
  if (label) label.textContent = tierNames[tier] || tier;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  var nameInput = modal.querySelector('#book-name');
  if (nameInput) nameInput.focus();
};

window.closeBookingModal = function() {
  var modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
};

window.submitBooking = function(e) {
  e.preventDefault();
  var form = e.target;
  var btn = form.querySelector('.booking-submit-btn');
  var origText = btn.textContent;
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  var data = {
    tier: window._bookingTier || 'kickoff',
    name: form.querySelector('#book-name').value,
    email: form.querySelector('#book-email').value,
    company: form.querySelector('#book-company').value,
    payment_method: form.querySelector('input[name="payment_method"]:checked')?.value || 'invoice',
    message: form.querySelector('#book-message')?.value || '',
  };

  fetch('https://briu-assess.briu.workers.dev/api/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (res.success) {
      form.style.display = 'none';
      var success = document.getElementById('bookingSuccess');
      if (success) {
        var method = data.payment_method === 'crypto' ? 'crypto wallet details' : 'an invoice';
        success.querySelector('.booking-success-method').textContent = method;
        success.style.display = 'block';
      }
      setTimeout(function() {
        closeBookingModal();
        form.style.display = '';
        if (success) success.style.display = 'none';
        form.reset();
        btn.textContent = origText;
        btn.disabled = false;
      }, 5000);
    } else {
      btn.textContent = res.error || 'Error — try again';
      btn.disabled = false;
    }
  })
  .catch(function() {
    btn.textContent = 'Error — try again';
    btn.disabled = false;
  });
};

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { if (window.closeBookingModal) closeBookingModal(); }
});
