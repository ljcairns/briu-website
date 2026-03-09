/* ========================================
   Briu Chat Bubble
   Persistent floating chat across all pages
   ======================================== */
(function() {
  'use strict';

  var API_BASE = 'https://briu-assess.briu.workers.dev';
  var CONV_KEY = 'briu_conv';
  var CONV_VERSION = 7;
  var conversation = [];
  var sessionId = null;
  var isWaiting = false;
  var userEmail = '';
  var companyData = null;
  var answers = {};
  var isOpen = false;
  var loadingQuoteTimer = null;

  var LOADING_QUOTES = [
    'Agents don\'t forget to follow up.',
    'Every email triaged teaches patterns.',
    '$2-5/day. Not $200K/year.',
    'Your API keys. Your infrastructure.',
    'Knowledge compounds, salaries don\'t.',
    'One developer. 354 commits. 12 agent skills.',
    'No vendor lock-in. Everything you own.',
    '30x less cost. 7x faster delivery.',
    'Agents as capital, not expense.'
  ];

  // ─── Restore state from localStorage ───
  try {
    var savedEmail = localStorage.getItem('briu_email');
    if (savedEmail) userEmail = savedEmail;
    var savedCompany = localStorage.getItem('briu_company');
    if (savedCompany) companyData = JSON.parse(savedCompany);
    var savedAnswers = localStorage.getItem('briu_assess');
    if (savedAnswers) answers = JSON.parse(savedAnswers);
    var savedConv = localStorage.getItem(CONV_KEY);
    if (savedConv) {
      var parsed = JSON.parse(savedConv);
      if (parsed._v === CONV_VERSION) conversation = parsed.msgs || [];
    }
  } catch(e) {}

  // Only show bubble if there's been a conversation or email captured
  function shouldShow() {
    return conversation.length > 0 || userEmail;
  }

  // ─── Inject CSS ───
  function injectStyles() {
    if (document.getElementById('briuChatStyles')) return;
    var style = document.createElement('style');
    style.id = 'briuChatStyles';
    style.textContent = [
      // Bubble
      '.briu-chat-bubble{position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;box-shadow:0 4px 20px rgba(0,0,0,0.3);background:linear-gradient(135deg,rgba(212,160,90,0.15),rgba(90,157,172,0.1));border:1px solid rgba(212,160,90,0.25);}',
      '.briu-chat-bubble:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(212,160,90,0.2);border-color:rgba(212,160,90,0.4);}',
      '.briu-chat-bubble .fractal-mini{position:relative;width:28px;height:28px;}',
      '.briu-chat-bubble .fractal-mini .fr{position:absolute;inset:0;border-radius:50%;border:1.5px solid transparent;}',
      '.briu-chat-bubble .fr-1{border-top-color:#d4a05a;animation:fractalSpin1 2.4s cubic-bezier(0.68,-0.55,0.27,1.55) infinite;}',
      '.briu-chat-bubble .fr-2{inset:4px;border-top-color:rgba(90,157,172,0.8);animation:fractalSpin2 3.2s cubic-bezier(0.68,-0.55,0.27,1.55) infinite;}',
      '.briu-chat-bubble .fr-3{inset:8px;border-bottom-color:rgba(77,128,112,0.8);animation:fractalSpin3 1.8s cubic-bezier(0.68,-0.55,0.27,1.55) infinite;}',
      '.briu-chat-bubble .fr-dot{position:absolute;top:50%;left:50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:#d4a05a;animation:fractalPulse 2s ease-in-out infinite;}',
      '.briu-chat-bubble .bubble-badge{position:absolute;top:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:#d4a05a;border:2px solid #1a1a2e;}',
      // Panel
      '.briu-chat-panel{position:fixed;bottom:90px;right:24px;z-index:9998;width:380px;max-height:520px;background:var(--surface,#0E1219);border:1px solid rgba(255,255,255,0.08);border-radius:2px;box-shadow:0 12px 48px rgba(0,0,0,0.5);display:flex;flex-direction:column;opacity:0;transform:translateY(12px) scale(0.95);transition:all 0.25s ease;pointer-events:none;font-family:var(--sans,"DM Sans",-apple-system,sans-serif);}',
      '.briu-chat-panel.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}',
      // Header
      '.briu-chat-header{display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;}',
      '.briu-chat-title{font-size:0.85rem;color:#e8e6e1;font-weight:600;display:flex;align-items:center;gap:0.5rem;}',
      '.briu-chat-title::before{content:"";width:8px;height:8px;border-radius:50%;background:#d4a05a;animation:fractalPulse 2s ease-in-out infinite;}',
      '.briu-chat-close{background:none;border:none;color:#888;font-size:1.2rem;cursor:pointer;padding:4px 8px;line-height:1;}',
      '.briu-chat-close:hover{color:#e8e6e1;}',
      // Thread
      '.briu-chat-thread{flex:1;overflow-y:auto;padding:0.75rem 1rem;min-height:200px;max-height:340px;}',
      '.bc-msg{margin-bottom:0.75rem;animation:convFade 0.3s ease;}',
      '.bc-msg p{margin:0;font-size:0.85rem;line-height:1.55;}',
      '.bc-msg-user{text-align:right;}',
      '.bc-msg-user p{display:inline-block;background:rgba(212,160,90,0.12);border:1px solid rgba(212,160,90,0.15);color:#e8e6e1;padding:0.5rem 0.75rem;max-width:85%;text-align:left;}',
      '.bc-msg-assistant p{color:#a8a598;border-left:2px solid rgba(212,160,90,0.2);padding:0.5rem 0.75rem;max-width:90%;}',
      '.bc-msg-assistant a{color:#d4a05a;}',
      // Loading
      '.bc-loading{text-align:center;padding:1rem;}',
      '.bc-loading .conv-fractal-loader{width:40px;height:40px;margin:0 auto 0.5rem;}',
      '.bc-loading-quote{font-size:0.78rem;color:#888;font-style:italic;transition:opacity 0.3s;}',
      // Quick replies
      '.bc-replies{display:flex;flex-wrap:wrap;gap:0.4rem;padding:0 1rem 0.5rem;}',
      '.bc-reply-btn{font-size:0.78rem;color:#a8a598;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:0.4rem 0.75rem;cursor:pointer;font-family:inherit;transition:all 0.2s;}',
      '.bc-reply-btn:hover{color:#d4a05a;border-color:rgba(212,160,90,0.35);background:rgba(212,160,90,0.05);}',
      // Input
      '.bc-input-row{display:flex;gap:0.5rem;padding:0.75rem 1rem;border-top:1px solid rgba(255,255,255,0.06);flex-shrink:0;}',
      '.bc-input{flex:1;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:0.6rem 0.75rem;color:#e8e6e1;font-size:0.85rem;font-family:inherit;outline:none;}',
      '.bc-input:focus{border-color:rgba(212,160,90,0.4);}',
      '.bc-send{width:36px;height:36px;background:rgba(212,160,90,0.15);border:1px solid rgba(212,160,90,0.3);color:#d4a05a;font-size:0.9rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}',
      '.bc-send:hover{background:rgba(212,160,90,0.25);}',
      // Handoff card
      '.bc-handoff{margin:0.5rem 0;padding:0.75rem;border:1px solid rgba(106,174,156,0.25);background:rgba(106,174,156,0.04);}',
      '.bc-handoff-label{font-size:0.82rem;color:#e8e6e1;margin-bottom:0.5rem;}',
      '.bc-handoff-btn{font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#d4a05a;background:none;border:1px solid rgba(212,160,90,0.3);padding:0.5rem 1rem;cursor:pointer;font-family:inherit;transition:all 0.2s;}',
      '.bc-handoff-btn:hover{background:rgba(212,160,90,0.08);border-color:rgba(212,160,90,0.5);}',
      '.bc-handoff-sent{font-size:0.82rem;color:rgba(106,174,156,0.9);}',
      // Estimate card
      '.bc-estimate{margin:0.5rem 0;padding:0.75rem;border:1px solid rgba(212,160,90,0.15);background:rgba(212,160,90,0.03);}',
      '.bc-est-label{font-size:0.8rem;color:#e8e6e1;margin-bottom:0.4rem;font-weight:600;}',
      '.bc-est-row{display:flex;justify-content:space-between;font-size:0.8rem;color:#a8a598;padding:0.15rem 0;}',
      '.bc-est-cost{color:#d4a05a;}',
      // Mobile
      '@media(max-width:480px){.briu-chat-panel{right:0;left:0;bottom:0;width:100%;max-height:100vh;max-height:100dvh;}.briu-chat-bubble{bottom:16px;right:16px;}}',
      '@keyframes convFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ─── Build DOM ───
  function injectBubble() {
    if (document.getElementById('briuChatBubble')) return;

    // Bubble
    var bubble = document.createElement('div');
    bubble.className = 'briu-chat-bubble';
    bubble.id = 'briuChatBubble';
    bubble.innerHTML = '<div class="fractal-mini">' +
      '<div class="fr fr-1"></div><div class="fr fr-2"></div><div class="fr fr-3"></div><div class="fr-dot"></div>' +
      '</div>' +
      (conversation.length > 0 ? '<div class="bubble-badge"></div>' : '');
    bubble.addEventListener('click', togglePanel);

    // Panel
    var panel = document.createElement('div');
    panel.className = 'briu-chat-panel';
    panel.id = 'briuChatPanel';

    var companyLabel = companyData && companyData.name ? companyData.name : 'Briu Agent';
    panel.innerHTML =
      '<div class="briu-chat-header">' +
      '<div class="briu-chat-title">' + escapeHtml(companyLabel) + '</div>' +
      '<button class="briu-chat-close" onclick="document.getElementById(\'briuChatPanel\').classList.remove(\'open\')">&times;</button>' +
      '</div>' +
      '<div class="briu-chat-thread" id="bcThread"></div>' +
      '<div class="bc-replies" id="bcReplies"></div>' +
      '<div class="bc-input-row">' +
      '<input type="text" class="bc-input" id="bcInput" placeholder="Ask about agents, pricing, workflows..." autocomplete="off">' +
      '<button class="bc-send" id="bcSend">&#8593;</button>' +
      '</div>';

    document.body.appendChild(bubble);
    document.body.appendChild(panel);

    // Bind events
    var input = document.getElementById('bcInput');
    var sendBtn = document.getElementById('bcSend');
    if (input) input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
    });
    if (sendBtn) sendBtn.addEventListener('click', function() { sendMessage(); });

    // Restore conversation
    restoreThread();

    // Close on escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var p = document.getElementById('briuChatPanel');
        if (p) p.classList.remove('open');
      }
    });
  }

  function togglePanel() {
    var panel = document.getElementById('briuChatPanel');
    if (!panel) return;
    isOpen = !panel.classList.contains('open');
    panel.classList.toggle('open');
    if (isOpen) {
      var badge = document.querySelector('.bubble-badge');
      if (badge) badge.remove();
      scrollThread();
      var input = document.getElementById('bcInput');
      if (input) setTimeout(function() { input.focus(); }, 100);
    }
  }

  // ─── Thread rendering ───
  function restoreThread() {
    var thread = document.getElementById('bcThread');
    if (!thread) return;

    if (conversation.length === 0) {
      // Show welcome message
      var welcome = companyData && companyData.name
        ? 'Hey! I can help you figure out what agents could do for ' + companyData.name + '. Ask me anything.'
        : 'Hey! I can help you figure out what agents could handle for your business. Ask me anything.';
      appendMsg(thread, 'assistant', welcome);
      showReplies(getDefaultReplies());
      return;
    }

    for (var i = 0; i < conversation.length; i++) {
      var msg = conversation[i];
      appendMsg(thread, msg.role, msg.content);
      if (msg.role === 'assistant' && msg.actions) {
        renderInlineCards(thread, msg.actions);
      }
    }

    // Show last replies
    var lastA = null;
    for (var j = conversation.length - 1; j >= 0; j--) {
      if (conversation[j].role === 'assistant') { lastA = conversation[j]; break; }
    }
    if (lastA && lastA.actions) {
      for (var k = 0; k < lastA.actions.length; k++) {
        if (lastA.actions[k].type === 'replies') showReplies(lastA.actions[k].options);
      }
    }
  }

  function appendMsg(thread, role, text) {
    var div = document.createElement('div');
    div.className = 'bc-msg bc-msg-' + role;
    div.innerHTML = '<p>' + formatText(text) + '</p>';
    thread.appendChild(div);
  }

  function renderInlineCards(thread, actions) {
    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];
      if (a.type === 'estimate') {
        var card = document.createElement('div');
        card.className = 'bc-estimate';
        var h = '<div class="bc-est-label">' + escapeHtml(a.label || 'Estimate') + '</div>';
        for (var ei = 0; ei < (a.items || []).length; ei++) {
          h += '<div class="bc-est-row"><span>' + escapeHtml(a.items[ei].name) + '</span><span class="bc-est-cost">' + escapeHtml(a.items[ei].cost) + '</span></div>';
        }
        card.innerHTML = h;
        thread.appendChild(card);
      }
      if (a.type === 'handoff') {
        var hcard = document.createElement('div');
        hcard.className = 'bc-handoff';
        hcard.innerHTML = '<div class="bc-handoff-label">' + escapeHtml(a.message || 'Ready to connect you with the Briu team') + '</div>' +
          '<button class="bc-handoff-btn" onclick="window.briuChatHandoff(this)">Hand off to Briu team</button>';
        thread.appendChild(hcard);
      }
    }
  }

  function showReplies(options) {
    var container = document.getElementById('bcReplies');
    if (!container || !options) return;
    container.innerHTML = '';
    for (var i = 0; i < options.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'bc-reply-btn';
      btn.textContent = options[i];
      btn.setAttribute('data-reply', options[i]);
      btn.addEventListener('click', function() { sendMessage(this.getAttribute('data-reply')); });
      container.appendChild(btn);
    }
  }

  function getDefaultReplies() {
    if (companyData && companyData.workflows) {
      var r = [];
      for (var i = 0; i < Math.min(companyData.workflows.length, 2); i++) {
        r.push('Tell me about ' + companyData.workflows[i].toLowerCase());
      }
      r.push('What would this cost?');
      return r;
    }
    return ['What can agents do?', 'How much does it cost?', 'Show me real build costs'];
  }

  // ─── Loading ───
  function appendLoading(thread) {
    var div = document.createElement('div');
    div.className = 'bc-msg bc-loading';
    div.id = 'bcLoadingMsg';
    var qi = Math.floor(Math.random() * LOADING_QUOTES.length);
    div.innerHTML =
      '<div class="conv-fractal-loader" style="width:40px;height:40px;position:relative;margin:0 auto 0.5rem;">' +
      '<div class="fractal-ring fractal-ring-1" style="position:absolute;inset:0;border-radius:50%;border:2px solid transparent;border-top-color:#d4a05a;border-right-color:rgba(212,160,90,0.3);animation:fractalSpin1 2.4s cubic-bezier(0.68,-0.55,0.27,1.55) infinite;"></div>' +
      '<div class="fractal-ring fractal-ring-2" style="position:absolute;inset:6px;border-radius:50%;border:2px solid transparent;border-top-color:rgba(90,157,172,0.8);border-left-color:rgba(90,157,172,0.3);animation:fractalSpin2 3.2s cubic-bezier(0.68,-0.55,0.27,1.55) infinite;"></div>' +
      '<div class="fractal-ring fractal-ring-3" style="position:absolute;inset:12px;border-radius:50%;border:2px solid transparent;border-bottom-color:rgba(77,128,112,0.8);border-right-color:rgba(77,128,112,0.3);animation:fractalSpin3 1.8s cubic-bezier(0.68,-0.55,0.27,1.55) infinite;"></div>' +
      '<div class="fractal-dot" style="position:absolute;top:50%;left:50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:#d4a05a;animation:fractalPulse 2s ease-in-out infinite;"></div>' +
      '</div>' +
      '<div class="bc-loading-quote" id="bcLoadingQuote">' + LOADING_QUOTES[qi] + '</div>';
    thread.appendChild(div);

    var quoteIdx = qi;
    loadingQuoteTimer = setInterval(function() {
      quoteIdx = (quoteIdx + 1) % LOADING_QUOTES.length;
      var el = document.getElementById('bcLoadingQuote');
      if (el) {
        el.style.opacity = '0';
        setTimeout(function() {
          if (el) { el.textContent = LOADING_QUOTES[quoteIdx]; el.style.opacity = '1'; }
        }, 250);
      }
    }, 2500);
  }

  function removeLoading() {
    if (loadingQuoteTimer) { clearInterval(loadingQuoteTimer); loadingQuoteTimer = null; }
    var ld = document.getElementById('bcLoadingMsg');
    if (ld) ld.remove();
  }

  // Check if the homepage inline chat is active (to avoid dual writes)
  function isInlineChatActive() {
    return window.location.pathname === '/' && document.getElementById('convThread');
  }

  // ─── Send message ───
  function sendMessage(text) {
    if (isWaiting) return;
    var input = document.getElementById('bcInput');
    if (!text && input) { text = input.value.trim(); if (input) input.value = ''; }
    if (!text) return;

    conversation.push({ role: 'user', content: text });
    if (!isInlineChatActive()) saveConversation();

    var thread = document.getElementById('bcThread');
    appendMsg(thread, 'user', text);

    // Clear replies
    var replies = document.getElementById('bcReplies');
    if (replies) replies.innerHTML = '';

    appendLoading(thread);
    scrollThread();

    fetchChat(function(data) {
      removeLoading();
      if (data && data.text) {
        var entry = { role: 'assistant', content: data.text, actions: data.actions || [] };
        conversation.push(entry);
        if (!isInlineChatActive()) saveConversation();
        appendMsg(thread, 'assistant', data.text);
        renderInlineCards(thread, data.actions || []);

        // Show replies
        for (var i = 0; i < (data.actions || []).length; i++) {
          if (data.actions[i].type === 'replies') {
            showReplies(data.actions[i].options);
          }
        }
      } else {
        appendMsg(thread, 'assistant', 'Sorry, I had trouble connecting. Reach the team at hi@briu.ai.');
      }
      scrollThread();
    });
  }

  function fetchChat(callback) {
    isWaiting = true;
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
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
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

  // ─── Handoff to Discord ───
  window.briuChatHandoff = function(btn) {
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    var summary = 'Chat handoff from ' + (userEmail || 'unknown visitor');
    if (companyData && companyData.name) summary += ' at ' + companyData.name;
    if (answers.q1) summary += ' | Role: ' + answers.q1;
    if (answers.q4) summary += ' | Focus: ' + answers.q4;

    fetch(API_BASE + '/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userEmail ? userEmail.split('@')[0] : '',
        email: userEmail || 'not-provided@briu.ai',
        summary: summary,
        messages: conversation,
        company: companyData || undefined,
        quiz: answers || undefined
      })
    })
    .then(function() {
      if (window.briuSetStage) window.briuSetStage('contacted');
      var parent = btn.parentElement;
      if (parent) parent.innerHTML = '<div class="bc-handoff-sent">Sent to the Briu team. Lucas will follow up within 24 hours.</div>';
    })
    .catch(function() {
      btn.textContent = 'Failed — try hi@briu.ai';
      btn.disabled = false;
    });
  };

  // ─── Utilities ───
  function scrollThread() {
    var thread = document.getElementById('bcThread');
    if (thread) thread.scrollTop = thread.scrollHeight;
  }

  function saveConversation() {
    try { localStorage.setItem(CONV_KEY, JSON.stringify({ _v: CONV_VERSION, msgs: conversation })); } catch(e) {}
  }

  function escapeHtml(t) {
    var d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  function safeHref(url) {
    if (!url) return '#';
    if (url.charAt(0) === '/') return url;
    if (url.indexOf('https://') === 0) return url;
    return '#';
  }

  function formatText(text) {
    var d = document.createElement('div');
    d.textContent = text;
    var safe = d.innerHTML;
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(m, linkText, url) {
      return '<a href="' + safeHref(url) + '">' + linkText + '</a>';
    });
    safe = safe.replace(/(^|\s)(\/[a-z][a-z0-9\-\/]*\/?)(\s|[.,;!?]|$)/gi, function(m, pre, path, post) {
      return pre + '<a href="' + path + '">' + path + '</a>' + post;
    });
    safe = safe.replace(/\n\n/g, '</p><p>');
    return safe;
  }

  // ─── Init ───
  function init() {
    if (!shouldShow()) return;
    injectStyles();
    injectBubble();
  }

  // Check for keyframe animations (they come from homepage CSS, need them on other pages too)
  function ensureKeyframes() {
    if (document.getElementById('briuChatKeyframes')) return;
    var s = document.createElement('style');
    s.id = 'briuChatKeyframes';
    s.textContent = [
      '@keyframes fractalSpin1{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.08)}100%{transform:rotate(360deg) scale(1)}}',
      '@keyframes fractalSpin2{0%{transform:rotate(120deg) scale(1)}50%{transform:rotate(-60deg) scale(0.92)}100%{transform:rotate(-240deg) scale(1)}}',
      '@keyframes fractalSpin3{0%{transform:rotate(240deg) scale(1)}50%{transform:rotate(60deg) scale(1.1)}100%{transform:rotate(-120deg) scale(1)}}',
      '@keyframes fractalPulse{0%,100%{opacity:.6;transform:scale(1);box-shadow:0 0 8px rgba(212,160,90,.3)}50%{opacity:1;transform:scale(1.5);box-shadow:0 0 20px rgba(212,160,90,.6),0 0 40px rgba(90,157,172,.2)}}',
    ].join('\n');
    document.head.appendChild(s);
  }

  // ─── Boot ───
  function boot() {
    ensureKeyframes();
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Re-check when localStorage changes (e.g., conversation started on homepage)
  window.addEventListener('storage', function(e) {
    if (e.key === CONV_KEY || e.key === 'briu_email') {
      try {
        if (e.key === 'briu_email') userEmail = e.newValue || '';
        if (e.key === CONV_KEY && e.newValue) {
          var p = JSON.parse(e.newValue);
          if (p._v === CONV_VERSION) conversation = p.msgs || [];
        }
      } catch(ex) {}
      if (shouldShow() && !document.getElementById('briuChatBubble')) {
        injectStyles();
        injectBubble();
      }
    }
  });

  // Expose for homepage to trigger bubble appearance
  window.briuShowChatBubble = function() {
    if (!document.getElementById('briuChatBubble')) {
      injectStyles();
      injectBubble();
    }
  };

  // Same-tab sync: interactive.js calls this after every saveConversation
  window.briuSyncConversation = function(msgs, sid) {
    conversation = msgs || [];
    if (sid) sessionId = sid;
    // Re-read other state that may have changed
    try {
      var e = localStorage.getItem('briu_email');
      if (e) userEmail = e;
      var c = localStorage.getItem('briu_company');
      if (c) companyData = JSON.parse(c);
      var a = localStorage.getItem('briu_assess');
      if (a) answers = JSON.parse(a);
    } catch(ex) {}
    // If bubble exists and panel is open, refresh the thread
    var thread = document.getElementById('bcThread');
    if (thread && document.getElementById('briuChatPanel') && document.getElementById('briuChatPanel').classList.contains('open')) {
      thread.innerHTML = '';
      restoreThread();
      scrollThread();
    }
  };
})();
