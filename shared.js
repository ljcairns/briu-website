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

/* Contact — all contact flows through the chatbot now */

// All contact flows through the chatbot — openContactForm redirects to chat
function openContactForm(prefill) {
  var context = '';
  if (prefill && prefill.automate) context = prefill.automate;
  else if (prefill && prefill.ai_usage) context = 'I want to learn about agents for my business';
  if (window.briuToggleChatPanel) {
    window.briuToggleChatPanel({ prefill: context });
  }
}
function closeContactForm() {}
function selectAI() {}
function selectTeam() {}
window.selectTeam = selectTeam;

/* Scroll Progress Bar — fixed below nav */
(function() {
  var bar = document.createElement('div');
  bar.className = 'nav-progress';
  bar.id = 'navProgress';
  document.body.appendChild(bar);

  // Position below nav
  function setBarPosition() {
    var nav = document.querySelector('nav');
    if (nav) bar.style.top = nav.offsetHeight + 'px';
  }
  setBarPosition();
  window.addEventListener('resize', setBarPosition);

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
    if (docHeight > 0) bar.style.width = (scrollTop / docHeight) * 100 + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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
