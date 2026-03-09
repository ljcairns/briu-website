/* ========================================
   Briu Interactive Features
   Assessment · Conversation · Calculator
   ======================================== */

/* AI Readiness Assessment + Conversational Agent */
(function() {
  'use strict';
  var KEY = 'briu_assess';
  var CONV_KEY = 'briu_conv';
  var API_BASE = 'https://briu-assess.briu.workers.dev';
  var STEPS = 4;
  var answers = {};
  var conversation = []; // { role, content }
  var sessionId = null;
  var isWaiting = false;
  var userEmail = '';
  var companyData = null; // { found, domain, name, description, industries, workflows }
  var companyFetching = false;

  var FREE_PROVIDERS = ['gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','aol.com','protonmail.com','mail.com','ymail.com','live.com'];

  // Restore saved state
  var CONV_VERSION = 6; // bump to clear stale conversations
  try {
    var savedEmail = localStorage.getItem('briu_email');
    if (savedEmail) userEmail = savedEmail;
    var savedCompany = localStorage.getItem('briu_company');
    if (savedCompany) companyData = JSON.parse(savedCompany);
    var saved = localStorage.getItem(KEY);
    if (saved) {
      answers = JSON.parse(saved);
      var savedConv = localStorage.getItem(CONV_KEY);
      if (savedConv) {
        var parsed = JSON.parse(savedConv);
        if (parsed._v === CONV_VERSION) {
          conversation = parsed.msgs || [];
        } else {
          localStorage.removeItem(CONV_KEY);
        }
      }
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
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(CONV_KEY);
      localStorage.removeItem('briu_email');
      localStorage.removeItem('briu_company');
    } catch(e) {}
    answers = {};
    conversation = [];
    sessionId = null;
    userEmail = '';
    companyData = null;
    var r = document.getElementById('assessResult');
    if (r) { r.classList.remove('active'); r.innerHTML = ''; }
    // Show step 0 (email), hide step 1
    var s0 = document.getElementById('assess-0');
    var s1 = document.getElementById('assess-1');
    if (s0) s0.classList.add('active');
    if (s1) s1.classList.remove('active');
    var bar = document.getElementById('assessProgress');
    if (bar) bar.style.width = '0%';
    var opts = document.querySelectorAll('.assess-opt');
    for (var i = 0; i < opts.length; i++) opts[i].classList.remove('selected');
    removePersonalization();
  };

  // ─── Email step ───
  // Bind enter key on email input when DOM is ready
  function bindEmailInput() {
    var input = document.getElementById('assessEmail');
    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); assessEmailSubmit(); }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindEmailInput);
  else bindEmailInput();

  window.assessEmailSubmit = function() {
    var input = document.getElementById('assessEmail');
    if (!input) return;
    var email = input.value.trim();
    if (!email || email.indexOf('@') === -1) {
      input.style.borderColor = 'rgba(220,80,80,0.5)';
      return;
    }
    userEmail = email;
    try { localStorage.setItem('briu_email', email); } catch(e) {}
    var domain = email.split('@')[1].toLowerCase();

    // Advance to step 1
    var s0 = document.getElementById('assess-0');
    if (s0) s0.classList.remove('active');
    var s1 = document.getElementById('assess-1');
    if (s1) s1.classList.add('active');

    // If work email, show lookup panel and fetch company
    if (FREE_PROVIDERS.indexOf(domain) === -1) {
      var panel = document.getElementById('assessLookupPanel');
      if (panel) panel.style.display = '';
      companyFetching = true;

      fetch(API_BASE + '/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        companyFetching = false;
        if (data && data.found) {
          companyData = data;
          try { localStorage.setItem('briu_company', JSON.stringify(data)); } catch(e) {}
          showLookupReady(data);
        } else {
          // Hide panel if no data found
          if (panel) panel.style.display = 'none';
        }
      })
      .catch(function() {
        companyFetching = false;
        if (panel) panel.style.display = 'none';
      });
    }
  };

  function showLookupReady(data) {
    var loading = document.getElementById('lookupLoading');
    var ready = document.getElementById('lookupReady');
    var companyEl = document.getElementById('lookupCompany');
    if (loading) loading.style.display = 'none';
    if (ready) ready.style.display = '';
    if (companyEl) companyEl.textContent = data.name + ' — ' + (data.industries || []).join(', ');

    // Bind mini chat input
    var chatInput = document.getElementById('lookupChatInput');
    var chatSend = document.getElementById('lookupChatSend');
    if (chatInput) {
      chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); sendFromLookup(); }
      });
    }
    if (chatSend) chatSend.addEventListener('click', sendFromLookup);
  }

  function sendFromLookup() {
    var input = document.getElementById('lookupChatInput');
    if (!input) return;
    var text = input.value.trim();
    if (!text || isWaiting) return;
    input.value = '';

    // Expand into full chat
    expandLookupToChat(text);
  }

  function expandLookupToChat(initialMessage) {
    var panel = document.getElementById('assessLookupPanel');
    if (!panel) return;
    panel.classList.add('chat-expanded');

    // Build full chat UI inside the panel
    var h = '<div class="conv-progress-bar" id="convProgress"><div class="conv-progress-fill" style="width:25%"></div><span class="conv-progress-label">Chatting</span></div>' +
      '<div class="conv-thread" id="convThread"></div>' +
      '<div class="conv-quick-replies" id="convReplies"></div>' +
      '<div class="conv-input-row" id="convInputRow">' +
      '<input type="text" class="conv-input" id="convInput" placeholder="Ask about agents, pricing, or your specific workflow..." autocomplete="off">' +
      '<button class="conv-send" id="convSend" aria-label="Send">&#8593;</button>' +
      '</div>';
    panel.innerHTML = h;
    bindInput();

    // Send the initial message
    if (initialMessage) {
      submitMessage(initialMessage);
    }
  }

  window.assessEmailSkip = function() {
    var s0 = document.getElementById('assess-0');
    if (s0) s0.classList.remove('active');
    var s1 = document.getElementById('assess-1');
    if (s1) s1.classList.add('active');
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

  // Build programmatic suggestions based on quiz answers + company data (no API call)
  function buildReadinessActions() {
    var suggestions = [];

    // If we have company data, lead with their specific workflows
    if (companyData && companyData.workflows) {
      for (var w = 0; w < Math.min(companyData.workflows.length, 2); w++) {
        suggestions.push('Tell me about ' + companyData.workflows[w].toLowerCase());
      }
      suggestions.push('What would this cost for ' + companyData.name + '?');
    } else {
      // Fallback to focus-area based suggestions
      var focusMap = {
        email: ['How would an email agent work?', 'What does approval flow look like?'],
        sales: ['How do agents handle CRM updates?', 'What does prospecting automation look like?'],
        reporting: ['Can agents generate weekly reports?', 'How does data pull automation work?'],
        ops: ['How do multi-agent systems work?', 'What operations can agents handle?'],
        support: ['Can agents draft customer responses?', 'How does ticket triage work?']
      };
      var focus = focusMap[answers.q4] || ['What can agents do for my team?', 'How does this work?'];
      suggestions = suggestions.concat(focus);
    }

    // Based on AI experience (q3)
    if (answers.q3 === 'none' || answers.q3 === 'free') {
      suggestions.push('What does an agent actually cost?');
    } else if (!companyData) {
      suggestions.push('How is this different from what I already use?');
    }

    // Always include
    suggestions.push('Show me your real build costs');

    return suggestions;
  }

  // ─── Recommendations based on quiz + company data ───
  function recs() {
    var r = [];
    var uc = {
      email: { t: 'Start with email triage', d: 'An agent that reads, categorizes, and drafts responses. Most founders save 1-2 hours daily.' },
      sales: { t: 'Start with sales prospecting', d: 'Agent-powered lead research, personalized outreach drafts, and CRM updates.' },
      reporting: { t: 'Start with automated reporting', d: 'Daily and weekly reports from your existing data. PDF delivery, trend analysis, anomaly alerts.' },
      ops: { t: 'Start with operations automation', d: 'CRM hygiene, calendar management, task routing. Admin work that eats hours but needs minimal judgment.' },
      support: { t: 'Start with support triage', d: 'Inbound request sorting, draft responses, smart routing. Nothing sends without approval.' }
    };

    // Company-specific workflows if available
    if (companyData && companyData.workflows && companyData.workflows.length > 0) {
      r.push({ title: 'For ' + companyData.name, desc: companyData.workflows.slice(0, 3).join(', ') + ' — all on your infrastructure, your API keys.' });
    }

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

  function showResults(instant) {
    var el = document.getElementById('assessResult');
    if (!el) return;
    var s = score();

    // Hide quiz steps (including email step 0)
    for (var j = 0; j <= STEPS; j++) {
      var step = document.getElementById('assess-' + j);
      if (step) step.classList.remove('active');
    }
    var bar = document.getElementById('assessProgress');
    if (bar) bar.style.width = '100%';

    var buildResult = function() {
      var p = persona(s);
      var rc = recs();
      var angle = (s / 100) * 360;

      var companyGreeting = '';
      if (companyData && companyData.found) {
        companyGreeting = '<div class="assess-company-greeting">Personalized for <strong>' + escapeHtml(companyData.name) + '</strong></div>';
      }

      var h = companyGreeting +
        '<div class="assess-gauge" style="background:conic-gradient(var(--gold) 0deg,var(--gold) ' + angle + 'deg,rgba(255,255,255,0.06) ' + angle + 'deg)">' +
        '<div class="assess-gauge-inner"><div class="assess-gauge-score">' + (instant ? s : '0') + '</div><div class="assess-gauge-label">Readiness</div></div></div>' +
        '<h3 class="assess-persona">' + p.label + '</h3>' +
        '<p class="assess-desc">' + p.desc + '</p><div class="assess-recs">';

      for (var i = 0; i < rc.length; i++) {
        h += '<div class="assess-rec"><p><strong>' + rc[i].title + '</strong> — ' + rc[i].desc;
        if (rc[i].link) h += ' <a href="' + rc[i].link + '" style="color:var(--gold)">Read →</a>';
        h += '</p></div>';
      }

      h += '</div><div class="assess-cta-group">' +
        '<a href="#" onclick="openContactFromAssess();return false" class="hero-cta-primary cta-shimmer">Book a Call</a>' +
        '<a href="#services" class="hero-cta-secondary">See pricing</a></div>';

      h += '</div><div class="assess-cta-group-bottom">' +
        '<button class="assess-retake" onclick="resetAssess()">Retake assessment</button></div>';

      el.innerHTML = h;
      el.classList.add('active');

      // Convert lookup panel into chat
      var lookupPanel = document.getElementById('assessLookupPanel');
      if (lookupPanel) {
        lookupPanel.style.display = '';
        lookupPanel.classList.add('chat-expanded');
        // Build chat UI inside lookup panel
        var chatHtml = '<div class="conv-thread" id="convThread"></div>' +
          '<div class="conv-quick-replies" id="convReplies"></div>' +
          '<div class="conv-input-row" id="convInputRow">' +
          '<input type="text" class="conv-input" id="convInput" placeholder="Ask about agents, pricing, or your specific workflow..." autocomplete="off">' +
          '<button class="conv-send" id="convSend" aria-label="Send">&#8593;</button>' +
          '</div>';
        lookupPanel.innerHTML = chatHtml;
      }

      // Animate score
      if (!instant) {
        var scoreEl = el.querySelector('.assess-gauge-score');
        if (scoreEl) countUp(scoreEl, 0, s, 1200);
      }

      // If conversation exists, restore it
      if (conversation.length > 0) {
        var thread = document.getElementById('convThread');
        for (var ci = 0; ci < conversation.length; ci++) {
          var msg = conversation[ci];
          if (msg.role === 'user') appendUserMessage(thread, msg.content);
          else appendAssistantMessage(thread, msg.content, msg.actions || []);
        }
        var lastA = null;
        for (var lj = conversation.length - 1; lj >= 0; lj--) {
          if (conversation[lj].role === 'assistant') { lastA = conversation[lj]; break; }
        }
        if (lastA && lastA.actions) renderActions(lastA.actions);
      } else {
        // Pre-populate quick replies
        var replies = document.getElementById('convReplies');
        if (replies) {
          var suggestions = buildReadinessActions();
          for (var si = 0; si < suggestions.length; si++) {
            var btn = document.createElement('button');
            btn.className = 'conv-reply-btn';
            btn.textContent = suggestions[si];
            btn.setAttribute('data-reply', suggestions[si]);
            btn.addEventListener('click', function() {
              submitMessage(this.getAttribute('data-reply'));
            });
            replies.appendChild(btn);
          }
        }
      }

      bindInput();
      personalizePageSections();
    };

    // Wait up to 2s for company fetch if it's still in flight
    if (!instant && companyFetching) {
      var waited = 0;
      var checkInterval = setInterval(function() {
        waited += 200;
        if (!companyFetching || waited >= 2000) {
          clearInterval(checkInterval);
          buildResult();
        }
      }, 200);
    } else {
      buildResult();
    }
  }


  function bindInput() {
    var input = document.getElementById('convInput');
    var sendBtn = document.getElementById('convSend');
    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage(); }
      });
    }
    if (sendBtn) sendBtn.addEventListener('click', function() { submitMessage(); });
  }

  function submitMessage(text) {
    if (isWaiting) return;
    var input = document.getElementById('convInput');
    if (!text && input) { text = input.value.trim(); if (input) input.value = ''; }
    if (!text) return;

    conversation.push({ role: 'user', content: text });
    saveConversation();

    // Show floating bubble so chat persists if they navigate away
    if (window.briuShowChatBubble) window.briuShowChatBubble();

    var thread = document.getElementById('convThread');
    appendUserMessage(thread, text);
    clearActions();
    appendLoading();
    scrollThread();

    fetchChat(function(data) {
      removeLoading();
      if (data && data.text) {
        var entry = { role: 'assistant', content: data.text, actions: data.actions || [] };
        conversation.push(entry);
        saveConversation();
        appendAssistantMessage(thread, data.text, data.actions || []);
        renderActions(data.actions || []);
      } else {
        appendAssistantMessage(thread, 'Sorry, I had trouble connecting. You can reach the team directly at hi@briu.ai.', []);
      }
      scrollThread();
    });
  }

  function fetchChat(callback) {
    isWaiting = true;

    // Timeout after 25s
    var timedOut = false;
    var timer = setTimeout(function() {
      timedOut = true;
      isWaiting = false;
      callback(null);
    }, 25000);

    var payload = {
      quiz: answers,
      page: window.location.pathname,
      sessionId: sessionId,
      email: userEmail || undefined,
      company: companyData || undefined,
      messages: []
    };

    for (var i = 0; i < conversation.length; i++) {
      payload.messages.push({ role: conversation[i].role, content: conversation[i].content });
    }

    fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (timedOut) return;
      clearTimeout(timer);
      isWaiting = false;
      sessionId = data.sessionId || sessionId;
      callback(data);
    })
    .catch(function() {
      if (timedOut) return;
      clearTimeout(timer);
      isWaiting = false;
      callback(null);
    });
  }

  // ─── Email domain pitch ───
  window.submitCollected = function(field) {
    var input = document.getElementById('convCollect_' + field);
    if (!input) return;
    var val = input.value.trim();
    if (!val) return;

    // If email with work domain, extract company domain for pitch
    if (field === 'email' && val.indexOf('@') !== -1) {
      var domain = val.split('@')[1];
      var freeProviders = ['gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','aol.com','protonmail.com','mail.com'];
      if (freeProviders.indexOf(domain.toLowerCase()) === -1) {
        // Work email — trigger domain pitch
        submitMessage('My email is ' + val + ' — I work at ' + domain);
        return;
      }
    }

    var labels = { company: 'My company is ', name: 'My name is ', email: 'My email is ', website: 'Our website is ', workflow: '' };
    submitMessage((labels[field] || '') + val);
  };

  // ─── Message rendering ───
  function appendUserMessage(thread, text) {
    if (!thread) return;
    var div = document.createElement('div');
    div.className = 'conv-msg conv-msg-user';
    div.innerHTML = '<p>' + escapeHtml(text) + '</p>';
    thread.appendChild(div);
  }

  function appendAssistantMessage(thread, text, actions) {
    if (!thread) return;
    var div = document.createElement('div');
    div.className = 'conv-msg conv-msg-assistant';
    div.innerHTML = formatMessage(text);

    // Render inline action cards (estimate, page, collect)
    var inlineActions = (actions || []).filter(function(a) {
      return a.type === 'estimate' || a.type === 'page' || a.type === 'collect' || a.type === 'handoff' || a.type === 'pitch';
    });
    for (var i = 0; i < inlineActions.length; i++) {
      div.appendChild(renderActionCard(inlineActions[i]));
    }

    thread.appendChild(div);
  }

  // ─── Loading animation with fractal + rotating quotes ───
  var LOADING_QUOTES = [
    'Agents don\'t forget to follow up.',
    'Every email triaged teaches patterns.',
    '$2-5/day. Not $200K/year.',
    'Your API keys. Your infrastructure.',
    'Knowledge compounds, salaries don\'t.',
    'Agents work nights, weekends, holidays.',
    'One developer. 354 commits. 12 agent skills.',
    'The cheapest this capability will ever be.',
    'No vendor lock-in. Everything you own.',
    'Approval gates on every action.',
    '30x less cost. 7x faster delivery.',
    'Agents as capital, not expense.'
  ];
  var loadingQuoteIndex = 0;
  var loadingQuoteTimer = null;

  function appendLoading() {
    var thread = document.getElementById('convThread');
    if (!thread) return;
    var div = document.createElement('div');
    div.className = 'conv-msg conv-msg-assistant conv-loading';
    div.id = 'convLoadingMsg';

    // Pick a random starting quote
    loadingQuoteIndex = Math.floor(Math.random() * LOADING_QUOTES.length);

    div.innerHTML = '<div class="conv-fractal-loader">' +
      '<div class="fractal-ring fractal-ring-1"></div>' +
      '<div class="fractal-ring fractal-ring-2"></div>' +
      '<div class="fractal-ring fractal-ring-3"></div>' +
      '<div class="fractal-dot"></div>' +
      '</div>' +
      '<div class="conv-loading-quote" id="convLoadingQuote">' + LOADING_QUOTES[loadingQuoteIndex] + '</div>';

    thread.appendChild(div);

    // Rotate quotes every 2.5s
    loadingQuoteTimer = setInterval(function() {
      loadingQuoteIndex = (loadingQuoteIndex + 1) % LOADING_QUOTES.length;
      var el = document.getElementById('convLoadingQuote');
      if (el) {
        el.style.opacity = '0';
        setTimeout(function() {
          if (el) {
            el.textContent = LOADING_QUOTES[loadingQuoteIndex];
            el.style.opacity = '1';
          }
        }, 300);
      }
    }, 2500);
  }

  function removeLoading() {
    if (loadingQuoteTimer) { clearInterval(loadingQuoteTimer); loadingQuoteTimer = null; }
    var ld = document.getElementById('convLoadingMsg');
    if (ld) ld.remove();
  }

  function scrollThread() {
    var thread = document.getElementById('convThread');
    if (thread) thread.scrollTop = thread.scrollHeight;
  }

  // ─── Action rendering ───
  function renderActions(actions) {
    if (!actions || !actions.length) return;

    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];

      if (a.type === 'progress') {
        var bar = document.querySelector('.conv-progress-fill');
        var label = document.querySelector('.conv-progress-label');
        if (bar) bar.style.width = a.value + '%';
        if (label) label.textContent = a.label || '';
      }

      if (a.type === 'replies') {
        var container = document.getElementById('convReplies');
        if (container) {
          container.innerHTML = '';
          for (var j = 0; j < a.options.length; j++) {
            var btn = document.createElement('button');
            btn.className = 'conv-reply-btn';
            btn.textContent = a.options[j];
            btn.setAttribute('data-reply', a.options[j]);
            btn.addEventListener('click', function() {
              submitMessage(this.getAttribute('data-reply'));
            });
            container.appendChild(btn);
          }
        }
      }
    }
  }

  function renderActionCard(action) {
    var card = document.createElement('div');
    card.className = 'conv-action-card conv-card-' + action.type;

    if (action.type === 'estimate') {
      var h = '<div class="conv-card-label">' + escapeHtml(action.label || 'Estimate') + '</div>';
      for (var i = 0; i < (action.items || []).length; i++) {
        var item = action.items[i];
        h += '<div class="conv-estimate-row"><span>' + escapeHtml(item.name) + '</span><span class="conv-estimate-cost">' + escapeHtml(item.cost) + '</span></div>';
      }
      card.innerHTML = h;
    }

    if (action.type === 'page') {
      card.innerHTML = '<a href="' + escapeHtml(action.path) + '" class="conv-page-link">' +
        '<div class="conv-card-label">' + escapeHtml(action.title) + '</div>' +
        '<div class="conv-card-desc">' + escapeHtml(action.desc || '') + '</div>' +
        '<span class="conv-card-arrow">→</span></a>';
    }

    if (action.type === 'collect') {
      var inputId = 'convCollect_' + action.field;
      card.innerHTML = '<label class="conv-card-label" for="' + inputId + '">' + escapeHtml(action.label) + '</label>' +
        '<div class="conv-collect-row">' +
        '<input type="text" class="conv-input conv-collect-input" id="' + inputId + '" placeholder="' + escapeHtml(action.placeholder || '') + '">' +
        '<button class="conv-send conv-collect-send" onclick="submitCollected(\'' + action.field + '\')">&#8593;</button>' +
        '</div>';
    }

    if (action.type === 'handoff') {
      card.innerHTML = '<div class="conv-card-label">' + escapeHtml(action.message || 'Ready to connect') + '</div>' +
        '<button class="conv-action-btn conv-handoff-btn" onclick="sendConversation()">Send to Lucas</button>';
    }

    if (action.type === 'pitch') {
      var ph = '<div class="conv-pitch-header">' +
        '<div class="conv-card-label">Pitch for ' + escapeHtml(action.company || action.domain) + '</div>' +
        '</div>';
      if (action.points && action.points.length) {
        ph += '<ul class="conv-pitch-points">';
        for (var p = 0; p < action.points.length; p++) {
          ph += '<li>' + escapeHtml(action.points[p]) + '</li>';
        }
        ph += '</ul>';
      }
      if (action.estimate) {
        ph += '<div class="conv-pitch-estimate">' +
          '<div class="conv-estimate-row"><span>Starting tier</span><span class="conv-estimate-cost">' + escapeHtml(action.estimate.tier || '') + '</span></div>' +
          '<div class="conv-estimate-row"><span>Build</span><span class="conv-estimate-cost">' + escapeHtml(action.estimate.build || '') + '</span></div>' +
          '<div class="conv-estimate-row"><span>Monthly</span><span class="conv-estimate-cost">' + escapeHtml(action.estimate.monthly || '') + '</span></div>' +
          '</div>';
      }
      card.innerHTML = ph;
    }

    return card;
  }

  function clearActions() {
    var replies = document.getElementById('convReplies');
    if (replies) replies.innerHTML = '';
  }

  // ─── Message formatting ───
  function formatMessage(text) {
    var div = document.createElement('div');
    div.textContent = text;
    var safe = div.innerHTML;
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    safe = safe.replace(/(^|\s)(\/[a-z][a-z0-9\-\/]*\/?)(\s|[.,;!?]|$)/gi, function(m, pre, path, post) {
      return pre + '<a href="' + path + '">' + path + '</a>' + post;
    });
    safe = safe.replace(/\n\n/g, '</p><p>');
    return '<p>' + safe + '</p>';
  }

  function saveConversation() {
    try { localStorage.setItem(CONV_KEY, JSON.stringify({ _v: CONV_VERSION, msgs: conversation })); } catch(e) {}
  }

  // Send conversation summary to Briu team
  window.sendConversation = function() {
    var el = document.getElementById('assessResult');
    if (!el) return;

    // Show email capture form
    var actions = el.querySelector('.conv-actions');
    if (!actions) return;
    actions.innerHTML =
      '<div class="conv-send-form">' +
      '<p style="color:var(--text-muted);font-size:0.88rem;margin-bottom:1rem">We\'ll send this conversation to Lucas so he can follow up with specifics.</p>' +
      '<input type="text" class="conv-input" id="convName" placeholder="Your name" style="margin-bottom:0.5rem">' +
      '<input type="email" class="conv-input" id="convEmail" placeholder="Your email" style="margin-bottom:0.75rem">' +
      '<button class="conv-action-btn" onclick="submitConversation()">Send to Briu</button>' +
      '</div>';
  };

  window.submitConversation = function() {
    var name = (document.getElementById('convName') || {}).value || '';
    var email = (document.getElementById('convEmail') || {}).value || '';
    if (!email) return;

    // Build summary from quiz + conversation
    var roleMap = { founder: 'Founder/CEO', leader: 'Team Lead', ic: 'IC', exploring: 'Exploring' };
    var teamMap = { solo: 'Solo', small: '2-10', medium: '11-50', large: '50+' };
    var focusMap = { email: 'Email', sales: 'Sales', reporting: 'Reporting', ops: 'Operations', support: 'Support' };

    var summary = 'Role: ' + (roleMap[answers.q1] || answers.q1) +
      ' | Team: ' + (teamMap[answers.q2] || answers.q2) +
      ' | Focus: ' + (focusMap[answers.q4] || answers.q4) +
      ' | Score: ' + score() + '/95';

    fetch(API_BASE + '/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        summary: summary,
        messages: conversation
      })
    }).then(function() {
      var actions = document.querySelector('.conv-actions');
      if (actions) {
        actions.innerHTML = '<p style="color:var(--forest);font-size:0.9rem">Sent. Lucas will be in touch within 24 hours.</p>' +
          '<button class="assess-retake" onclick="resetAssess()" style="margin-top:0.75rem">Start over</button>';
      }
    }).catch(function() {
      // Fall back to mailto
      window.location.href = 'mailto:hi@briu.ai?subject=Inquiry from briu.ai&body=' + encodeURIComponent(summary);
    });
  };

  window.openContactFromAssess = function() {
    var aiMap = {
      none: 'We haven\'t started with AI yet',
      free: 'We use free tools like ChatGPT',
      paid: 'Enterprise AI accounts with multiple vendors',
      building: 'Already building agents or significant automation'
    };
    var sinkMap = {
      email: 'Email & communication',
      sales: 'Sales & prospecting',
      reporting: 'Reporting & data',
      ops: 'Operations & admin',
      support: 'Customer support'
    };
    var roleMap = { founder: 'Founder/CEO', leader: 'Team Lead/Manager', ic: 'Individual Contributor', exploring: 'Exploring for company' };
    var teamMap = { solo: 'Solo', small: '2-10 people', medium: '11-50 people', large: '50+' };

    var automate = (sinkMap[answers.q4] || 'Not specified') +
      ' | Role: ' + (roleMap[answers.q1] || 'Not specified') +
      ' | Team: ' + (teamMap[answers.q2] || 'Not specified') +
      ' | Readiness: ' + score() + '/95';

    openContactForm({
      ai_usage: aiMap[answers.q3] || 'Not specified',
      automate: automate
    });
  };

  function personalizePageSections() {
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
