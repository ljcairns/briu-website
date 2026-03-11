(function() {
  'use strict';

  var path = window.location.pathname;

  // --- NAV ---
  var navLinks = [
    { href: '/why-now/', label: 'Why Now' },
    { href: '/build/', label: 'Build' },
    { href: '/services/', label: 'Services' }
  ];

  function buildNav() {
    var linksHtml = '';
    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var isActive = path === link.href || (link.href !== '/' && path.indexOf(link.href) === 0);
      linksHtml += '<a href="' + link.href + '"' + (isActive ? ' class="active"' : '') + '>' + link.label + '</a>\n';
    }

    return '<header class="site-header">\n' +
      '<nav>\n' +
      '  <a href="/" class="logo"><img src="/briu-logo-transparent.png" alt="Briu"></a>\n' +
      '  <button class="nav-toggle" onclick="this.classList.toggle(\'open\');document.querySelector(\'.nav-links\').classList.toggle(\'open\')" aria-label="Menu"><span></span><span></span><span></span></button>\n' +
      '  <div class="nav-links">\n' +
      '    ' + linksHtml +
      '    <a href="#" onclick="openContactForm();return false" class="mobile-cta">Book a Call</a>\n' +
      '  </div>\n' +
      '  <a href="#" onclick="openContactForm();return false" class="cta-nav cta-shimmer">Book a Call</a>\n' +
      '</nav>\n' +
      '</header>';
  }

  // --- FOOTER ---
  var footerHtml = '<footer>\n' +
    '  <p>&copy; 2026 Briu. All rights reserved.</p>\n' +
    '  <div class="footer-links"><a href="mailto:hi@briu.ai">hi@briu.ai</a> <a href="/privacy/">Privacy</a></div>\n' +
    '</footer>';

  // --- CONTACT MODAL ---
  function getSubjectLine() {
    if (path === '/' || path === '/index.html') return 'New inquiry from briu.ai';
    // Derive from path: /services/ -> "Services", /build/ -> "Build", etc.
    var parts = path.replace(/^\/|\/$/g, '').split('/');
    // For nested paths like /build/brand-in-a-session/, use the page title approach
    var segment = parts[parts.length - 1] || parts[0] || '';
    // Convert slug to title case
    var label = segment.replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    return 'New inquiry from briu.ai (' + label + ')';
  }

  var modalHtml = '<div class="modal-overlay" id="contactModal" onclick="if(event.target===this)closeContactForm()">\n' +
    '  <div class="modal">\n' +
    '    <button class="modal-close" onclick="closeContactForm()" aria-label="Close">&times;</button>\n' +
    '\n' +
    '    <div class="q-progress"><div class="q-dot filled"></div><div class="q-dot"></div><div class="q-dot"></div><div class="q-dot"></div></div>\n' +
    '\n' +
    '    <div class="q-step active" id="q-step-1">\n' +
    '      <h3>How does your business use AI today?</h3>\n' +
    '      <p>This helps us tailor the conversation to where you are.</p>\n' +
    '      <button class="q-option" onclick="selectAI(\'Getting started — free tools\', event)" data-ai-level="starter">\n' +
    '        <div class="q-opt-label">Getting started</div>\n' +
    '        <div class="q-opt-desc">Free tools like ChatGPT for ad-hoc tasks</div>\n' +
    '      </button>\n' +
    '      <button class="q-option" onclick="selectAI(\'Paid AI accounts across the team\', event)" data-ai-level="paid">\n' +
    '        <div class="q-opt-label">Paid accounts</div>\n' +
    '        <div class="q-opt-desc">Team or enterprise AI accounts with one or more vendors</div>\n' +
    '      </button>\n' +
    '      <button class="q-option" onclick="selectAI(\'Already building agents or automation\', event)" data-ai-level="building">\n' +
    '        <div class="q-opt-label">Building with AI</div>\n' +
    '        <div class="q-opt-desc">Building agents, automating workflows, or evaluating platforms</div>\n' +
    '      </button>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="q-step" id="q-step-2">\n' +
    '      <h3>How big is your team?</h3>\n' +
    '      <p>This helps us recommend the right engagement.</p>\n' +
    '      <button class="q-option" onclick="selectTeam(\'solo\')">\n' +
    '        <div class="q-opt-label">Just me</div>\n' +
    '        <div class="q-opt-desc">Solo founder or individual</div>\n' +
    '      </button>\n' +
    '      <button class="q-option" onclick="selectTeam(\'small\')">\n' +
    '        <div class="q-opt-label">2–10 people</div>\n' +
    '        <div class="q-opt-desc">Small team, everyone wears multiple hats</div>\n' +
    '      </button>\n' +
    '      <button class="q-option" onclick="selectTeam(\'medium\')">\n' +
    '        <div class="q-opt-label">11–50 people</div>\n' +
    '        <div class="q-opt-desc">Dedicated roles, some process overhead</div>\n' +
    '      </button>\n' +
    '      <button class="q-option" onclick="selectTeam(\'large\')">\n' +
    '        <div class="q-opt-label">50+ people</div>\n' +
    '        <div class="q-opt-desc">Multiple departments, established workflows</div>\n' +
    '      </button>\n' +
    '      <button class="q-back" onclick="goToStep(1)">&larr; Back</button>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="q-step" id="q-step-3">\n' +
    '      <h3>What takes the most time?</h3>\n' +
    '      <p id="q-step-3-sub">Pick one, or describe in your own words.</p>\n' +
    '      <div id="q-focus-picks"></div>\n' +
    '      <textarea id="q-automate" placeholder="Or describe what you\'d like to automate..."></textarea>\n' +
    '      <button class="modal-btn cta-shimmer" onclick="goToStep(4)">Continue</button>\n' +
    '      <button class="q-back" onclick="goToStep(2)">&larr; Back</button>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="q-step" id="q-step-4">\n' +
    '      <div id="q-recommendation" style="margin-bottom:1.25rem;"></div>\n' +
    '      <h3>Where should we send our thoughts?</h3>\n' +
    '      <p>We\'ll reply within 24 hours with specific ideas for your business.</p>\n' +
    '      <form id="contactForm" action="https://formsubmit.co/ajax/hi@briu.ai" method="POST">\n' +
    '        <input type="text" name="_honey" style="display:none">\n' +
    '        <input type="hidden" name="_subject" value="' + getSubjectLine() + '">\n' +
    '        <input type="hidden" name="ai_usage" id="q-ai-usage">\n' +
    '        <input type="hidden" name="team_size" id="q-team-size">\n' +
    '        <input type="hidden" name="focus" id="q-focus-val">\n' +
    '        <input type="hidden" name="automate" id="q-automate-val">\n' +
    '        <input type="text" name="name" id="q-name" placeholder="Your name" required>\n' +
    '        <input type="email" name="email" id="q-email" placeholder="Your email" required>\n' +
    '        <input type="text" name="company" placeholder="Company (optional)">\n' +
    '        <button type="submit" class="modal-btn cta-shimmer">Send</button>\n' +
    '      </form>\n' +
    '      <button class="q-back" onclick="goToStep(3)">&larr; Back</button>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="form-success" id="formSuccess">\n' +
    '      <h3>Message sent</h3>\n' +
    '      <p>We\'ll be in touch within 24 hours.</p>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</div>';

  var bookingModalHtml = '<div class="modal-overlay" id="bookingModal" onclick="if(event.target===this)closeBookingModal()">\n' +
    '  <div class="modal">\n' +
    '    <button class="modal-close" onclick="closeBookingModal()" aria-label="Close">&times;</button>\n' +
    '    <h3>Reserve Your <span class="booking-tier-label">Kickoff</span></h3>\n' +
    '    <p style="color:var(--text-muted);font-size:0.92rem;margin-bottom:1.5rem;">We\'ll send you an invoice within 24 hours. No payment processors, no fees.</p>\n' +
    '    <form onsubmit="submitBooking(event)">\n' +
    '      <input type="text" id="book-name" placeholder="Your name" required>\n' +
    '      <input type="email" id="book-email" placeholder="Your email" required>\n' +
    '      <input type="text" id="book-company" placeholder="Company (optional)">\n' +
    '      <textarea id="book-message" placeholder="Anything we should know? (optional)" style="min-height:60px;"></textarea>\n' +
    '      <div class="booking-payment-methods">\n' +
    '        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.5rem;">Preferred payment method</p>\n' +
    '        <label class="booking-payment-opt"><input type="radio" name="payment_method" value="invoice" checked> <span>Bank transfer / wire</span></label>\n' +
    '        <label class="booking-payment-opt"><input type="radio" name="payment_method" value="crypto"> <span>Cryptocurrency</span></label>\n' +
    '      </div>\n' +
    '      <button type="submit" class="modal-btn cta-shimmer booking-submit-btn">Reserve &mdash; We\'ll Send an Invoice</button>\n' +
    '    </form>\n' +
    '    <div id="bookingSuccess" style="display:none;text-align:center;padding:2rem 0;">\n' +
    '      <h3 style="color:var(--gold);margin-bottom:0.75rem;">Booking received</h3>\n' +
    '      <p style="color:var(--text-muted);font-size:0.95rem;">We\'ll send you <span class="booking-success-method">an invoice</span> within 24 hours.<br>We start researching your business immediately.</p>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</div>';

  // --- INJECT ---
  var navTarget = document.getElementById('site-nav');
  var footerTarget = document.getElementById('site-footer');
  var modalTarget = document.getElementById('site-modal');

  if (navTarget) navTarget.outerHTML = '<a href="#main" class="skip-link">Skip to main content</a>\n' + buildNav();
  if (footerTarget) footerTarget.outerHTML = footerHtml;
  if (modalTarget) modalTarget.outerHTML = modalHtml;

  // Inject booking modal
  document.body.insertAdjacentHTML('beforeend', bookingModalHtml);
})();
