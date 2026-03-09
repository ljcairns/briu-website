/* ========================================
   Briu Chat Bubble
   Persistent floating chat across all pages
   ======================================== */
(function() {
  'use strict';

  var API_BASE = 'https://briu-assess.briu.workers.dev';
  var CONV_KEY = 'briu_conv';
  var CONV_VERSION = 8;
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

  // Always show the bubble — email gate handles first interaction
  function shouldShow() {
    return true;
  }

  // ─── Inject CSS ───
  function injectStyles() {
    if (document.getElementById('briuChatStyles')) return;
    var style = document.createElement('style');
    style.id = 'briuChatStyles';
    style.textContent = [
      // Bubble — Gaudí fractal with gold→coral→river gradient
      '.briu-chat-bubble{position:fixed;bottom:24px;right:24px;z-index:9999;width:60px;height:60px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;box-shadow:0 4px 24px rgba(0,0,0,0.4),0 0 40px rgba(212,160,90,0.08);background:conic-gradient(from 0deg,rgba(212,160,90,0.18),rgba(224,123,95,0.12),rgba(90,157,172,0.12),rgba(212,160,90,0.18));border:1.5px solid rgba(212,160,90,0.3);animation:bubbleRotateBg 12s linear infinite;}',
      '.briu-chat-bubble:hover{transform:scale(1.12);box-shadow:0 6px 32px rgba(212,160,90,0.25),0 0 60px rgba(224,123,95,0.1);border-color:rgba(212,160,90,0.5);}',
      '.briu-chat-bubble .fractal-mini{position:relative;width:32px;height:32px;}',
      '.briu-chat-bubble .fractal-mini .fr{position:absolute;inset:0;border-radius:50%;border:1.5px solid transparent;}',
      '.briu-chat-bubble .fr-1{border-top-color:#d4a05a;border-right-color:rgba(224,123,95,0.4);animation:fractalSpin1 2.4s cubic-bezier(0.68,-0.55,0.27,1.55) infinite;}',
      '.briu-chat-bubble .fr-2{inset:5px;border-top-color:#e07b5f;border-left-color:rgba(90,157,172,0.4);animation:fractalSpin2 3.2s cubic-bezier(0.68,-0.55,0.27,1.55) infinite;}',
      '.briu-chat-bubble .fr-3{inset:10px;border-bottom-color:#5a9dac;border-right-color:rgba(212,160,90,0.4);animation:fractalSpin3 1.8s cubic-bezier(0.68,-0.55,0.27,1.55) infinite;}',
      '.briu-chat-bubble .fr-dot{position:absolute;top:50%;left:50%;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:50%;background:linear-gradient(135deg,#d4a05a,#e07b5f);animation:fractalPulse 2s ease-in-out infinite;}',
      '.briu-chat-bubble .bubble-badge{position:absolute;top:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:linear-gradient(135deg,#d4a05a,#e07b5f);border:2px solid #0E1219;box-shadow:0 0 8px rgba(212,160,90,0.4);}',
      '@keyframes bubbleRotateBg{0%{background:conic-gradient(from 0deg,rgba(212,160,90,0.18),rgba(224,123,95,0.12),rgba(90,157,172,0.12),rgba(212,160,90,0.18));}100%{background:conic-gradient(from 360deg,rgba(212,160,90,0.18),rgba(224,123,95,0.12),rgba(90,157,172,0.12),rgba(212,160,90,0.18));}}',
      // Panel
      '.briu-chat-panel{position:fixed;bottom:90px;right:24px;z-index:9998;width:380px;max-height:520px;background:var(--surface,#0E1219);border:1px solid rgba(255,255,255,0.08);border-radius:2px;box-shadow:0 12px 48px rgba(0,0,0,0.5);display:flex;flex-direction:column;opacity:0;transform:translateY(12px) scale(0.95);transition:all 0.25s ease;pointer-events:none;font-family:var(--sans,"DM Sans",-apple-system,sans-serif);}',
      '.briu-chat-panel.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}',
      // Header
      '.briu-chat-header{display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;}',
      '.briu-chat-title{font-size:0.85rem;color:#e8e6e1;font-weight:600;display:flex;align-items:center;gap:0.5rem;}',
      '.briu-chat-title::before{content:"";width:8px;height:8px;border-radius:50%;background:#d4a05a;animation:fractalPulse 2s ease-in-out infinite;}',
      '.briu-chat-header-actions{display:flex;align-items:center;gap:0.25rem;}',
      '.briu-chat-reset{background:none;border:none;color:#555;font-size:0.65rem;cursor:pointer;padding:4px 8px;line-height:1;text-transform:uppercase;letter-spacing:0.06em;font-family:inherit;transition:color 0.2s;}',
      '.briu-chat-reset:hover{color:#d4a05a;}',
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
      '.bc-reply-btn{font-size:0.78rem;color:#a8a598;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);padding:0.45rem 0.85rem;cursor:pointer;font-family:inherit;transition:all 0.3s ease;border-radius:16px;position:relative;overflow:hidden;}',
      '.bc-reply-btn::before{content:"";position:absolute;inset:0;background:conic-gradient(from 0deg,rgba(212,160,90,0.05),rgba(224,123,95,0.03),rgba(90,157,172,0.03),rgba(212,160,90,0.05));opacity:0;transition:opacity 0.3s;}',
      '.bc-reply-btn:hover{color:#d4a05a;border-color:rgba(212,160,90,0.35);transform:translateY(-1px);box-shadow:0 2px 12px rgba(212,160,90,0.08);}',
      '.bc-reply-btn:hover::before{opacity:1;}',
      // Input
      '.bc-input-row{display:flex;gap:0.5rem;padding:0.75rem 1rem;border-top:1px solid rgba(255,255,255,0.06);flex-shrink:0;}',
      '.bc-input{flex:1;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:0.6rem 0.75rem;color:#e8e6e1;font-size:0.85rem;font-family:inherit;outline:none;}',
      '.bc-input:focus{border-color:rgba(212,160,90,0.4);}',
      '.bc-send{width:36px;height:36px;background:conic-gradient(from 0deg,rgba(212,160,90,0.18),rgba(224,123,95,0.12),rgba(90,157,172,0.12),rgba(212,160,90,0.18));border:1px solid rgba(212,160,90,0.25);border-radius:50%;color:#d4a05a;font-size:0.9rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;flex-shrink:0;}',
      '.bc-send:hover{transform:scale(1.1) rotate(15deg);box-shadow:0 0 16px rgba(212,160,90,0.2);border-color:rgba(212,160,90,0.5);}',
      // Handoff card
      '.bc-handoff{margin:0.5rem 0;padding:0.75rem;border:1px solid rgba(106,174,156,0.25);background:rgba(106,174,156,0.04);}',
      '.bc-handoff-label{font-size:0.82rem;color:#e8e6e1;margin-bottom:0.5rem;}',
      '.bc-handoff-btn{font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#d4a05a;background:conic-gradient(from 45deg,rgba(106,174,156,0.06),rgba(212,160,90,0.08),rgba(106,174,156,0.06));border:1px solid rgba(212,160,90,0.25);border-radius:20px;padding:0.55rem 1.25rem;cursor:pointer;font-family:inherit;transition:all 0.3s ease;}',
      '.bc-handoff-btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(212,160,90,0.15);border-color:rgba(212,160,90,0.5);}',
      '.bc-handoff-sent{font-size:0.82rem;color:rgba(106,174,156,0.9);}',
      // Estimate card
      '.bc-estimate{margin:0.5rem 0;padding:0.75rem;border:1px solid rgba(212,160,90,0.15);background:rgba(212,160,90,0.03);}',
      '.bc-est-label{font-size:0.8rem;color:#e8e6e1;margin-bottom:0.4rem;font-weight:600;}',
      '.bc-est-row{display:flex;justify-content:space-between;font-size:0.8rem;color:#a8a598;padding:0.15rem 0;}',
      '.bc-est-cost{color:#d4a05a;}',
      // Page card
      '.bc-page{display:block;margin:0.5rem 0;padding:0.75rem;border:1px solid rgba(90,157,172,0.2);background:rgba(90,157,172,0.04);text-decoration:none;transition:all 0.2s;}',
      '.bc-page:hover{border-color:rgba(90,157,172,0.4);background:rgba(90,157,172,0.08);}',
      '.bc-page-title{font-size:0.82rem;color:#e8e6e1;font-weight:600;margin-bottom:0.2rem;}',
      '.bc-page-desc{font-size:0.75rem;color:#a8a598;}',
      // Progress bar
      '.bc-progress{margin:0.5rem 0;padding:0.5rem 0.75rem;}',
      '.bc-progress-label{font-size:0.72rem;color:#a8a598;margin-bottom:0.3rem;}',
      '.bc-progress-bar{height:3px;background:rgba(255,255,255,0.06);overflow:hidden;}',
      '.bc-progress-fill{height:100%;background:linear-gradient(90deg,#d4a05a,#e07b5f,#5a9dac);transition:width 0.6s ease;}',
      // Focus styles
      '.bc-reply-btn:focus-visible,.bc-send:focus-visible,.bc-handoff-btn:focus-visible{outline:2px solid rgba(212,160,90,0.6);outline-offset:2px;}',
      // Chart
      '.bc-chart{margin:0.5rem 0;padding:0.75rem;border:1px solid rgba(212,160,90,0.15);background:rgba(212,160,90,0.03);animation:convFade 0.3s ease;}',
      '.bc-chart-title{font-size:0.8rem;color:#e8e6e1;margin-bottom:0.6rem;font-weight:600;}',
      '.bc-chart-row{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem;font-size:0.75rem;}',
      '.bc-chart-label{min-width:70px;color:#a8a598;text-align:right;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.bc-chart-track{flex:1;height:18px;background:rgba(255,255,255,0.03);overflow:hidden;position:relative;}',
      '.bc-chart-fill{height:100%;background:linear-gradient(90deg,rgba(212,160,90,0.7),rgba(212,160,90,0.35));transition:width 0.8s ease;min-width:2px;}',
      '.bc-chart-value{min-width:45px;color:#d4a05a;font-weight:600;font-size:0.78rem;}',
      '.bc-chart-total{border-top:1px solid rgba(255,255,255,0.08);margin-top:0.4rem;padding-top:0.4rem;}',
      '.bc-chart-total .bc-chart-value{color:#e8e6e1;}',
      '.bc-chart-comparison .bc-chart-fill{background:linear-gradient(90deg,rgba(224,123,95,0.7),rgba(224,123,95,0.35));}',
      '.bc-chart-comparison .bc-chart-value{color:#e07b5f;}',
      '.bc-chart-savings{font-size:0.72rem;color:rgba(106,174,156,0.9);text-align:right;margin-top:0.3rem;font-weight:600;}',
      // Email gate
      '.bc-email-gate{padding:1.5rem 1rem;text-align:center;animation:convFade 0.3s ease;}',
      '.bc-gate-icon{width:48px;height:48px;margin:0 auto 1rem;position:relative;}',
      '.bc-gate-title{font-size:0.92rem;color:#e8e6e1;font-weight:600;margin-bottom:0.4rem;}',
      '.bc-gate-sub{font-size:0.78rem;color:#a8a598;margin-bottom:1.25rem;line-height:1.5;}',
      '.bc-gate-row{display:flex;gap:0.5rem;margin-bottom:0.75rem;}',
      '.bc-gate-skip{font-size:0.72rem;color:#555;cursor:pointer;background:none;border:none;font-family:inherit;text-decoration:underline;transition:color 0.2s;}',
      '.bc-gate-skip:hover{color:#a8a598;}',
      // Reset confirmation
      '.bc-confirm{padding:1.25rem;text-align:center;animation:convFade 0.3s ease;}',
      '.bc-confirm-text{font-size:0.85rem;color:#e8e6e1;margin-bottom:1rem;}',
      '.bc-confirm-btns{display:flex;gap:0.5rem;justify-content:center;}',
      '.bc-confirm-btn{font-size:0.78rem;padding:0.5rem 1rem;border-radius:16px;cursor:pointer;font-family:inherit;transition:all 0.2s;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);color:#a8a598;}',
      '.bc-confirm-btn:hover{color:#d4a05a;border-color:rgba(212,160,90,0.3);}',
      '.bc-confirm-btn:focus-visible{outline:2px solid rgba(212,160,90,0.6);outline-offset:2px;}',
      // Mobile
      '@media(max-width:480px){.briu-chat-panel{right:0;left:0;bottom:0;width:100%;max-height:100vh;max-height:100dvh;border-radius:0;}.briu-chat-bubble{bottom:16px;right:16px;}}',
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
    bubble.addEventListener('click', window.briuToggleChatPanel);

    // Panel
    var panel = document.createElement('div');
    panel.className = 'briu-chat-panel';
    panel.id = 'briuChatPanel';

    panel.innerHTML =
      '<div class="briu-chat-header">' +
      '<div class="briu-chat-title">Briu</div>' +
      '<div class="briu-chat-header-actions">' +
      '<button class="briu-chat-reset" onclick="window.briuChatReset()">New chat</button>' +
      '<button class="briu-chat-close" onclick="window.briuToggleChatPanel()">&times;</button>' +
      '</div></div>' +
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
        if (p && p.classList.contains('open')) {
          p.classList.remove('open');
          isOpen = false;
          document.body.style.overflow = '';
        }
      }
    });
  }

  window.briuToggleChatPanel = function(opts) {
    var panel = document.getElementById('briuChatPanel');
    if (!panel) return;
    isOpen = !panel.classList.contains('open');
    panel.classList.toggle('open');
    // Mobile scroll lock
    if (window.innerWidth <= 480) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    if (isOpen) {
      var badge = document.querySelector('.bubble-badge');
      if (badge) badge.remove();
      // Email gate: if no email, show gate first
      if (!userEmail) {
        renderEmailGate(opts && opts.prefill ? opts.prefill : '');
        return;
      }
      // Refresh thread from conversation array on open
      refreshThread();
      var input = document.getElementById('bcInput');
      if (input) setTimeout(function() { input.focus(); }, 100);
    }
  };

  // ─── Refresh thread from current conversation array ───
  function refreshThread() {
    var thread = document.getElementById('bcThread');
    if (!thread) return;
    thread.innerHTML = '';
    restoreThread();
    scrollThread();
  }

  // ─── Email gate ───
  var FREE_PROVIDERS = ['gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','aol.com','protonmail.com','mail.com','ymail.com','live.com'];

  function renderEmailGate(prefill) {
    var thread = document.getElementById('bcThread');
    var replies = document.getElementById('bcReplies');
    var inputRow = document.querySelector('.bc-input-row');
    if (thread) thread.innerHTML =
      '<div class="bc-email-gate">' +
      '<div class="bc-gate-icon"><div class="fractal-mini">' +
      '<div class="fr fr-1"></div><div class="fr fr-2"></div><div class="fr fr-3"></div><div class="fr-dot"></div>' +
      '</div></div>' +
      '<div class="bc-gate-title">Before we chat</div>' +
      '<div class="bc-gate-sub">Drop your email so we can personalize the conversation' + (prefill ? ' and answer your question' : '') + '.</div>' +
      '<div class="bc-gate-row">' +
      '<input type="email" class="bc-input" id="bcGateEmail" placeholder="you@company.com" autocomplete="email">' +
      '<button class="bc-send" id="bcGateSubmit">&#8593;</button>' +
      '</div>' +
      '<button class="bc-gate-skip" id="bcGateSkip">Skip — just chat</button>' +
      '</div>';
    if (replies) replies.innerHTML = '';
    if (inputRow) inputRow.style.display = 'none';

    // Bind email gate events
    var emailInput = document.getElementById('bcGateEmail');
    var submitBtn = document.getElementById('bcGateSubmit');
    var skipBtn = document.getElementById('bcGateSkip');

    if (emailInput) {
      emailInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); submitGateEmail(prefill); }
      });
      setTimeout(function() { emailInput.focus(); }, 100);
    }
    if (submitBtn) submitBtn.addEventListener('click', function() { submitGateEmail(prefill); });
    if (skipBtn) skipBtn.addEventListener('click', function() { exitGate(prefill); });
  }

  function submitGateEmail(prefill) {
    var input = document.getElementById('bcGateEmail');
    if (!input) return;
    var email = input.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.style.borderColor = 'rgba(220,80,80,0.5)';
      return;
    }
    userEmail = email;
    try { localStorage.setItem('briu_email', email); } catch(e) {}

    var domain = email.split('@')[1].toLowerCase();
    if (FREE_PROVIDERS.indexOf(domain) === -1) {
      // Work email — do company lookup
      var thread = document.getElementById('bcThread');
      if (thread) thread.innerHTML =
        '<div class="bc-email-gate" style="padding:2rem 1rem;">' +
        '<div class="bc-gate-icon"><div class="fractal-mini">' +
        '<div class="fr fr-1"></div><div class="fr fr-2"></div><div class="fr fr-3"></div><div class="fr-dot"></div>' +
        '</div></div>' +
        '<div class="bc-gate-sub">Looking up ' + escapeHtml(domain) + '...</div>' +
        '</div>';

      fetch(API_BASE + '/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.found) {
          companyData = data;
          try { localStorage.setItem('briu_company', JSON.stringify(data)); } catch(e) {}
        }
        exitGate(prefill);
      })
      .catch(function() { exitGate(prefill); });
    } else {
      exitGate(prefill);
    }
  }

  function exitGate(prefill) {
    var inputRow = document.querySelector('.bc-input-row');
    if (inputRow) inputRow.style.display = '';
    refreshThread();
    var input = document.getElementById('bcInput');
    if (input) setTimeout(function() { input.focus(); }, 100);
    // If there was a prefilled question (e.g. from FAQ), send it
    if (prefill) {
      setTimeout(function() { sendMessage(prefill); }, 300);
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
      if (a.type === 'page' && a.path) {
        var pcard = document.createElement('a');
        pcard.className = 'bc-page';
        pcard.href = safeHref(a.path);
        pcard.innerHTML = '<div class="bc-page-title">' + escapeHtml(a.title || '') + '</div>' +
          (a.desc ? '<div class="bc-page-desc">' + escapeHtml(a.desc) + '</div>' : '');
        thread.appendChild(pcard);
      }
      if (a.type === 'progress' && a.value != null) {
        var pbar = document.createElement('div');
        pbar.className = 'bc-progress';
        pbar.innerHTML = '<div class="bc-progress-label">' + escapeHtml(a.label || 'Understanding your needs') + '</div>' +
          '<div class="bc-progress-bar"><div class="bc-progress-fill" style="width:' + Math.min(100, Math.max(0, a.value)) + '%"></div></div>';
        thread.appendChild(pbar);
      }
      if (a.type === 'handoff') {
        var hcard = document.createElement('div');
        hcard.className = 'bc-handoff';
        hcard.innerHTML = '<div class="bc-handoff-label">' + escapeHtml(a.message || 'Ready to connect you with the Briu team') + '</div>' +
          '<button class="bc-handoff-btn" onclick="window.briuChatHandoff(this)">Hand off to Briu team</button>';
        thread.appendChild(hcard);
      }
      if (a.type === 'chart' && a.data) {
        thread.appendChild(renderChart(a));
      }
    }
  }

  // ─── Chart rendering ───
  function renderChart(action) {
    var card = document.createElement('div');
    card.className = 'bc-chart';
    var maxVal = 0;
    for (var i = 0; i < action.data.length; i++) {
      if (action.data[i].value > maxVal) maxVal = action.data[i].value;
    }
    if (action.comparison && action.comparison.value > maxVal) maxVal = action.comparison.value;
    if (action.total && action.total.value > maxVal) maxVal = action.total.value;

    var h = '<div class="bc-chart-title">' + escapeHtml(action.title || 'Cost Breakdown') + '</div>';
    for (var j = 0; j < action.data.length; j++) {
      var d = action.data[j];
      var pct = maxVal > 0 ? Math.round((d.value / maxVal) * 100) : 0;
      h += '<div class="bc-chart-row">' +
        '<div class="bc-chart-label">' + escapeHtml(d.label) + '</div>' +
        '<div class="bc-chart-track"><div class="bc-chart-fill" style="width:0%" data-width="' + pct + '%"></div></div>' +
        '<div class="bc-chart-value">$' + d.value.toLocaleString() + '</div></div>';
    }
    if (action.total) {
      var tpct = maxVal > 0 ? Math.round((action.total.value / maxVal) * 100) : 0;
      h += '<div class="bc-chart-row bc-chart-total">' +
        '<div class="bc-chart-label" style="font-weight:600">' + escapeHtml(action.total.label || 'Total') + '</div>' +
        '<div class="bc-chart-track"><div class="bc-chart-fill" style="width:0%" data-width="' + tpct + '%"></div></div>' +
        '<div class="bc-chart-value" style="font-weight:700">$' + action.total.value.toLocaleString() + '</div></div>';
    }
    if (action.comparison) {
      var cpct = maxVal > 0 ? Math.round((action.comparison.value / maxVal) * 100) : 0;
      h += '<div class="bc-chart-row bc-chart-comparison">' +
        '<div class="bc-chart-label">' + escapeHtml(action.comparison.label || 'Traditional') + '</div>' +
        '<div class="bc-chart-track"><div class="bc-chart-fill" style="width:0%" data-width="' + cpct + '%"></div></div>' +
        '<div class="bc-chart-value">$' + action.comparison.value.toLocaleString() + '</div></div>';
      var savings = action.comparison.value - (action.total ? action.total.value : 0);
      if (savings > 0) {
        var savPct = Math.round((savings / action.comparison.value) * 100);
        h += '<div class="bc-chart-savings">Save $' + savings.toLocaleString() + '/mo (' + savPct + '% less)</div>';
      }
    }
    card.innerHTML = h;
    // Animate bars after a tick
    setTimeout(function() {
      var fills = card.querySelectorAll('.bc-chart-fill');
      for (var f = 0; f < fills.length; f++) {
        fills[f].style.width = fills[f].getAttribute('data-width');
      }
    }, 50);
    return card;
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
    // If inline chat is active on homepage, route through it instead
    if (isInlineChatActive() && window.expandInlineChat) {
      window.expandInlineChat();
      var inlineInput = document.getElementById('convInput');
      if (inlineInput && text) { inlineInput.value = text; }
      // Close bubble panel
      var panel = document.getElementById('briuChatPanel');
      if (panel) { panel.classList.remove('open'); isOpen = false; }
      if (window.innerWidth <= 480) document.body.style.overflow = '';
      return;
    }
    var input = document.getElementById('bcInput');
    if (!text && input) { text = input.value.trim(); if (input) input.value = ''; }
    if (!text) return;

    conversation.push({ role: 'user', content: text });
    saveConversation();

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
      if (r.status === 429) throw { rateLimit: true };
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
    .catch(function(err) {
      if (timedOut) return;
      clearTimeout(timer);
      isWaiting = false;
      if (err && err.rateLimit) {
        callback({ text: 'You\'ve reached the message limit for now. Reach us directly at hi@briu.ai or try again in an hour.', actions: [{ type: 'handoff', message: 'Or send your details to the Briu team' }] });
      } else {
        callback(null);
      }
    });
  }

  // ─── Handoff to Discord ───
  window.briuChatHandoff = function(btn) {
    if (!btn) return;

    // If no email, prompt for it first
    if (!userEmail) {
      var parent = btn.parentElement;
      if (parent) {
        parent.innerHTML =
          '<div class="bc-handoff-label">Share your email so Lucas can follow up</div>' +
          '<div style="display:flex;gap:0.5rem;margin-top:0.5rem;">' +
          '<input type="email" class="bc-input" id="bcHandoffEmail" placeholder="you@company.com" style="flex:1;">' +
          '<button class="bc-send" onclick="window.briuSubmitHandoff()">&#8593;</button>' +
          '</div>';
        var emailInput = document.getElementById('bcHandoffEmail');
        if (emailInput) {
          emailInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); window.briuSubmitHandoff(); }
          });
          emailInput.focus();
        }
      }
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending...';
    sendBubbleHandoff(btn);
  };

  window.briuSubmitHandoff = function() {
    var input = document.getElementById('bcHandoffEmail');
    if (!input) return;
    var email = input.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.style.borderColor = 'rgba(220,80,80,0.5)';
      return;
    }
    userEmail = email;
    try { localStorage.setItem('briu_email', email); } catch(e) {}
    var card = input.closest('.bc-handoff');
    if (card) {
      card.innerHTML = '<div class="bc-handoff-label">Sending...</div>';
      sendBubbleHandoff(card);
    }
  };

  function sendBubbleHandoff(container) {
    var summary = 'Chat handoff from ' + userEmail;
    if (companyData && companyData.name) summary += ' at ' + companyData.name;
    if (answers.q1) summary += ' | Role: ' + answers.q1;
    if (answers.q4) summary += ' | Focus: ' + answers.q4;

    fetch(API_BASE + '/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userEmail.split('@')[0],
        email: userEmail,
        summary: summary,
        messages: conversation,
        company: companyData || undefined,
        quiz: answers || undefined
      })
    })
    .then(function() {
      if (window.briuSetStage) window.briuSetStage('contacted');
      var el = container.parentElement || container;
      if (el.classList && el.classList.contains('bc-handoff')) el = container;
      else el = container.parentElement || container;
      el.innerHTML = '<div class="bc-handoff-sent">Sent to the Briu team. Lucas will follow up within 24 hours.</div>';
    })
    .catch(function() {
      var el = container.parentElement || container;
      el.innerHTML = '<div class="bc-handoff-label">Could not send — reach us at <a href="mailto:hi@briu.ai" style="color:#d4a05a;">hi@briu.ai</a></div>';
    });
  }

  // ─── Reset conversation ───
  window.briuChatReset = function() {
    // Show confirmation if there's context to preserve
    if (userEmail || companyData) {
      var thread = document.getElementById('bcThread');
      var replies = document.getElementById('bcReplies');
      if (thread) thread.innerHTML =
        '<div class="bc-confirm">' +
        '<div class="bc-confirm-text">Start a new conversation?</div>' +
        '<div class="bc-confirm-btns">' +
        '<button class="bc-confirm-btn" id="bcResetKeep">Keep my info</button>' +
        '<button class="bc-confirm-btn" id="bcResetFull">Start completely fresh</button>' +
        '</div></div>';
      if (replies) replies.innerHTML = '';
      var keepBtn = document.getElementById('bcResetKeep');
      var fullBtn = document.getElementById('bcResetFull');
      if (keepBtn) keepBtn.addEventListener('click', function() { performReset(true); });
      if (fullBtn) fullBtn.addEventListener('click', function() { performReset(false); });
      return;
    }
    performReset(false);
  };

  function performReset(keepContext) {
    conversation = [];
    sessionId = null;
    try {
      localStorage.removeItem(CONV_KEY);
      localStorage.removeItem('briu_session');
      if (!keepContext) {
        localStorage.removeItem('briu_email');
        localStorage.removeItem('briu_company');
        localStorage.removeItem('briu_assess');
      }
    } catch(e) {}
    if (!keepContext) {
      userEmail = '';
      companyData = null;
      answers = {};
    }
    // Bridge reset to inline chat if it exists
    if (window.briuResetInlineChat) window.briuResetInlineChat();
    // Clear and re-render thread
    var thread = document.getElementById('bcThread');
    if (thread) {
      thread.innerHTML = '';
      if (!keepContext && !userEmail) {
        // Show email gate for fresh start
        renderEmailGate('');
        return;
      }
      restoreThread();
    }
    var replies = document.getElementById('bcReplies');
    if (replies) replies.innerHTML = '';
    showReplies(getDefaultReplies());
  }

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
    // Auto-link bare paths FIRST (before markdown links consume them)
    safe = safe.replace(/(^|\s)(\/[a-z][a-z0-9\-\/]*\/?)(\s|[.,;!?]|$)/gi, function(m, pre, path, post) {
      return pre + '<a href="' + path + '">' + path + '</a>' + post;
    });
    // Convert [text](url) markdown links
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(m, linkText, url) {
      return '<a href="' + safeHref(url) + '">' + linkText + '</a>';
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

  // Open bubble with a prefilled question (e.g. from FAQ)
  window.briuAskQuestion = function(question) {
    if (!document.getElementById('briuChatBubble')) {
      injectStyles();
      injectBubble();
    }
    var panel = document.getElementById('briuChatPanel');
    if (panel && !panel.classList.contains('open')) {
      window.briuToggleChatPanel({ prefill: question });
    } else if (panel && panel.classList.contains('open')) {
      // Already open, just send the message
      if (userEmail) {
        sendMessage(question);
      } else {
        renderEmailGate(question);
      }
    }
  };

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
