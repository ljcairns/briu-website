(function() {
  'use strict';

  // Inject AI services manifest link
  var aiLink = document.createElement('link');
  aiLink.rel = 'ai-services';
  aiLink.type = 'application/json';
  aiLink.href = '/.well-known/ai-services.json';
  document.head.appendChild(aiLink);

  var path = window.location.pathname;

  // --- NAV ---
  var navLinks = [
    { href: '/why-now/', label: 'Why Now' },
    { href: '/industries/', label: 'Industries' },
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
      '    <a href="#" onclick="openDiscovery();return false" class="mobile-cta">Find Your Use Case</a>\n' +
      '  </div>\n' +
      '  <a href="#" onclick="openDiscovery();return false" class="cta-nav cta-shimmer">Find Your Use Case</a>\n' +
      '</nav>\n' +
      '</header>';
  }

  // --- FOOTER ---
  var footerHtml = '<footer>\n' +
    '  <p>&copy; 2026 Briu. All rights reserved.</p>\n' +
    '  <div class="footer-links"><a href="mailto:hi@briu.ai">hi@briu.ai</a> <a href="/refer/">Refer &amp; Earn</a> <a href="/press/">Press</a> <a href="/privacy/">Privacy</a> <a href="/agents/">For AI Agents</a></div>\n' +
    '</footer>';

  // Contact modal removed — all contact flows through chat bubble now
  var modalHtml = '<!-- Contact flows through chat bubble -->';

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
