/* ===== Briu Shared Scripts ===== */

/* Contact Form Modal */
var qData = {};
function openContactForm(prefill) {
  document.getElementById('contactModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  if (prefill && prefill.ai_usage) {
    qData.ai_usage = prefill.ai_usage;
    document.getElementById('q-ai-usage').value = prefill.ai_usage;
    if (prefill.automate) document.getElementById('q-automate').value = prefill.automate;
    document.getElementById('q-automate-val').value = prefill.automate || '';
    goToStep(3);
    var dots = document.querySelectorAll('.q-dot');
    dots.forEach(function(d) { d.classList.add('filled'); });
  } else {
    goToStep(1);
  }
}
function closeContactForm() { document.getElementById('contactModal').classList.remove('active'); document.body.style.overflow = ''; }
function goToStep(n) { document.querySelectorAll('.q-step').forEach(function(el) { el.classList.remove('active'); }); document.getElementById('q-step-' + n).classList.add('active'); var dots = document.querySelectorAll('.q-dot'); dots.forEach(function(d, i) { d.classList.toggle('filled', i < n); }); }
function selectAI(val) { qData.ai_usage = val; document.getElementById('q-ai-usage').value = val; goToStep(2); }
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeContactForm(); });

document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault(); var form = this;
  document.getElementById('q-automate-val').value = document.getElementById('q-automate').value;
  var btn = form.querySelector('.modal-btn'); btn.textContent = 'Sending...'; btn.disabled = true;
  fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) })
  .then(function(r) { return r.json(); }).then(function() {
    document.querySelectorAll('.q-step').forEach(function(el) { el.classList.remove('active'); });
    document.querySelector('.q-progress').style.display = 'none'; document.getElementById('formSuccess').style.display = 'block';
    setTimeout(function() { closeContactForm(); document.querySelector('.q-progress').style.display = ''; document.getElementById('formSuccess').style.display = ''; form.reset(); document.getElementById('q-automate').value = ''; btn.textContent = 'Send'; btn.disabled = false; }, 3000);
  }).catch(function() { btn.textContent = 'Error — try again'; btn.disabled = false; });
});

/* Scroll Progress Bar */
var navProgress = document.getElementById('navProgress');
window.addEventListener('scroll', function() {
  var scrollTop = window.scrollY;
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  var scrollPercent = (scrollTop / docHeight) * 100;
  navProgress.style.width = scrollPercent + '%';
});

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
