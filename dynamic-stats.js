/* ========================================
   Briu Dynamic Stats
   Live commit count, computed dates, timeline "Today"
   ======================================== */
(function() {
  'use strict';
  var REPO = 'ljcairns/briu-website';
  var CACHE_KEY = 'briu_gh_stats';
  var CACHE_TTL = 3600000; // 1 hour
  var FOUNDED = new Date('2026-03-05T00:00:00-08:00');
  var FIRST_COMMIT = new Date('2026-02-10T00:00:00-08:00');

  function pacificNow() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  }

  function daysSince(date) {
    return Math.floor((pacificNow() - date) / 86400000);
  }

  function formatDate(d) {
    var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return m[d.getMonth()] + ' ' + d.getDate();
  }

  function updateEls(key, value) {
    var els = document.querySelectorAll('[data-dynamic="' + key + '"]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = value;
      if (els[i].hasAttribute('data-count')) els[i].setAttribute('data-count', value);
    }
  }

  function updateComputed() {
    var buildDays = daysSince(FIRST_COMMIT);

    updateEls('build-days', buildDays);

    // Update "Commits in X Days" labels
    var labels = document.querySelectorAll('[data-dynamic-label="commit-days"]');
    for (var i = 0; i < labels.length; i++) {
      labels[i].textContent = 'Commits in ' + buildDays + ' Days';
    }

    // Add "Today" to timeline
    var vtl = document.querySelector('.vtl');
    if (vtl && !document.getElementById('vtl-today')) {
      var today = pacificNow();
      var entry = document.createElement('div');
      entry.className = 'vtl-entry';
      entry.id = 'vtl-today';
      entry.setAttribute('data-category', 'business');
      entry.innerHTML =
        '<div class="vtl-dot" style="background:var(--forest);box-shadow:0 0 0 4px rgba(77,128,112,0.2),0 0 12px rgba(77,128,112,0.3)"></div>' +
        '<div class="vtl-card" style="border-color:rgba(77,128,112,0.2)">' +
        '<div class="vtl-date" style="color:var(--forest)">' + formatDate(today) + '</div>' +
        '<div class="vtl-title">Today</div>' +
        '<div class="vtl-desc">Day ' + buildDays + ' of building with agents.</div>' +
        '</div>';
      vtl.appendChild(entry);
    }

    // Update "Last updated" timestamp
    var meta = document.querySelector('.stats-meta');
    if (meta) meta.textContent = 'Live · ' + formatDate(pacificNow()) + ', ' + pacificNow().getFullYear() + ' PT';
  }

  function fetchCommits() {
    try {
      var cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        applyCommits(cached.commits);
        return;
      }
    } catch(e) {}

    // Use commits API with per_page=1 and parse total from Link header
    fetch('https://api.github.com/repos/' + REPO + '/commits?per_page=1')
      .then(function(r) {
        var link = r.headers.get('Link');
        if (!link) return 1;
        var match = link.match(/page=(\d+)>;\s*rel="last"/);
        return match ? parseInt(match[1], 10) : 1;
      })
      .then(function(total) {
        if (total < 2) return; // sanity check
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ commits: total, ts: Date.now() })); } catch(e) {}
        applyCommits(total);
      })
      .catch(function() { /* fail silently, keep hardcoded defaults */ });
  }

  function applyCommits(count) {
    updateEls('commits', count);
  }

  function init() {
    updateComputed();
    fetchCommits();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
