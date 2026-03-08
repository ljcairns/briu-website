/* ===== Briu Shared Scripts ===== */

/* Contact Form Modal */
var qData = {};
function openContactForm() { document.getElementById('contactModal').classList.add('active'); document.body.style.overflow = 'hidden'; goToStep(1); }
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
