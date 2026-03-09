/* ========================================
   Briu Cost Config
   Reads from costs.json, updates elements
   with data-cost attributes.
   Caches in localStorage for 1 hour.
   ======================================== */
(function() {
  'use strict';
  var CACHE_KEY = 'briu_costs';
  var CACHE_TTL = 3600000; // 1 hour

  function applyAll(data) {
    var els = document.querySelectorAll('[data-cost]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key = el.getAttribute('data-cost');
      if (!(key in data)) continue;
      var val = data[key];
      var fmt = el.getAttribute('data-cost-format') || '$';
      if (fmt === '~$') el.textContent = '~$' + val;
      else if (fmt === '$/mo') el.textContent = '$' + val + '/mo';
      else el.textContent = '$' + val;
    }
  }

  function init() {
    try {
      var cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        applyAll(cached.data);
        return;
      }
    } catch(e) {}

    fetch('/costs.json?v=' + Date.now())
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data) return;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data, ts: Date.now() }));
        } catch(e) {}
        applyAll(data);
      })
      .catch(function() { /* fail silently, keep hardcoded values */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
