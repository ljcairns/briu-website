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

    return '<nav>\n' +
      '  <a href="/" class="logo"><img src="/briu-logo-transparent.png" alt="Briu"></a>\n' +
      '  <button class="nav-toggle" onclick="this.classList.toggle(\'open\');document.querySelector(\'.nav-links\').classList.toggle(\'open\')" aria-label="Menu"><span></span><span></span><span></span></button>\n' +
      '  <div class="nav-links">\n' +
      '    ' + linksHtml +
      '    <a href="#" onclick="openContactForm();return false" class="mobile-cta">Book a Call</a>\n' +
      '  </div>\n' +
      '  <a href="#" onclick="openContactForm();return false" class="cta-nav cta-shimmer">Book a Call</a>\n' +
      '  <div class="nav-progress" id="navProgress"></div>\n' +
      '</nav>';
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
    '    <div class="q-progress"><div class="q-dot filled"></div><div class="q-dot"></div><div class="q-dot"></div></div>\n' +
    '\n' +
    '    <div class="q-step active" id="q-step-1">\n' +
    '      <h3>How does your business use AI today?</h3>\n' +
    '      <p>This helps us tailor the conversation to where you are.</p>\n' +
    '      <button class="q-option" onclick="selectAI(\'We use free tools like ChatGPT\')">\n' +
    '        <div class="q-opt-label">Getting started</div>\n' +
    '        <div class="q-opt-desc">We use free tools like ChatGPT for ad-hoc tasks</div>\n' +
    '      </button>\n' +
    '      <button class="q-option" onclick="selectAI(\'Enterprise AI accounts with multiple vendors\')">\n' +
    '        <div class="q-opt-label">Enterprise accounts</div>\n' +
    '        <div class="q-opt-desc">We have paid AI accounts across the team or multiple vendors</div>\n' +
    '      </button>\n' +
    '      <button class="q-option" onclick="selectAI(\'Already building agents or significant automation\')">\n' +
    '        <div class="q-opt-label">Building with AI</div>\n' +
    '        <div class="q-opt-desc">We\'re already building agents or automating significant business processes</div>\n' +
    '      </button>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="q-step" id="q-step-2">\n' +
    '      <h3>What would you most like to automate?</h3>\n' +
    '      <p>No wrong answers. Just tell us what takes up your team\'s time.</p>\n' +
    '      <textarea id="q-automate" placeholder="e.g. Sales prospecting, email triage, CRM updates, reporting, customer onboarding..."></textarea>\n' +
    '      <button class="modal-btn cta-shimmer" onclick="goToStep(3)">Continue</button>\n' +
    '      <button class="q-back" onclick="goToStep(1)">&larr; Back</button>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="q-step" id="q-step-3">\n' +
    '      <h3>Where should we send our thoughts?</h3>\n' +
    '      <p>We\'ll get back within 24 hours with specific ideas for your business.</p>\n' +
    '      <form id="contactForm" action="https://formsubmit.co/ajax/hi@briu.ai" method="POST">\n' +
    '        <input type="text" name="_honey" style="display:none">\n' +
    '        <input type="hidden" name="_subject" value="' + getSubjectLine() + '">\n' +
    '        <input type="hidden" name="ai_usage" id="q-ai-usage">\n' +
    '        <input type="hidden" name="automate" id="q-automate-val">\n' +
    '        <input type="text" name="name" placeholder="Your name" required>\n' +
    '        <input type="email" name="email" placeholder="Your email" required>\n' +
    '        <input type="text" name="company" placeholder="Company (optional)">\n' +
    '        <button type="submit" class="modal-btn cta-shimmer">Send</button>\n' +
    '      </form>\n' +
    '      <button class="q-back" onclick="goToStep(2)">&larr; Back</button>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="form-success" id="formSuccess">\n' +
    '      <h3>Message sent</h3>\n' +
    '      <p>We\'ll be in touch within 24 hours.</p>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</div>';

  // --- INJECT ---
  var navTarget = document.getElementById('site-nav');
  var footerTarget = document.getElementById('site-footer');
  var modalTarget = document.getElementById('site-modal');

  if (navTarget) navTarget.outerHTML = buildNav();
  if (footerTarget) footerTarget.outerHTML = footerHtml;
  if (modalTarget) modalTarget.outerHTML = modalHtml;
})();
