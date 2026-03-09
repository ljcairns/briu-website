/* ========================================
   Briu Interactive Features
   Assessment · Conversation · Calculator
   ======================================== */

/* AI Readiness Assessment + Conversational Agent */
(function() {
  'use strict';
  var KEY = 'briu_assess';
  var CONV_KEY = 'briu_conv';
  var API_BASE = 'https://assess.briu.ai';
  var STEPS = 4;
  var answers = {};
  var conversation = []; // { role, content }
  var sessionId = null;
  var isWaiting = false;

  // Restore saved conversation
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) {
      answers = JSON.parse(saved);
      var savedConv = localStorage.getItem(CONV_KEY);
      if (savedConv) conversation = JSON.parse(savedConv);
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
    } catch(e) {}
    answers = {};
    conversation = [];
    sessionId = null;
    var r = document.getElementById('assessResult');
    if (r) { r.classList.remove('active'); r.innerHTML = ''; }
    var s1 = document.getElementById('assess-1');
    if (s1) s1.classList.add('active');
    var bar = document.getElementById('assessProgress');
    if (bar) bar.style.width = '0%';
    var opts = document.querySelectorAll('.assess-opt');
    for (var i = 0; i < opts.length; i++) opts[i].classList.remove('selected');
    removePersonalization();
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

  function showResults(instant) {
    var el = document.getElementById('assessResult');
    if (!el) return;
    var s = score();

    // Hide quiz steps
    for (var j = 1; j <= STEPS; j++) {
      var step = document.getElementById('assess-' + j);
      if (step) step.classList.remove('active');
    }
    var bar = document.getElementById('assessProgress');
    if (bar) bar.style.width = '100%';

    // If we have a saved conversation, restore it
    if (instant && conversation.length > 0) {
      renderConversation(el, s, true);
      personalizePageSections();
      return;
    }

    // Fresh quiz completion — fetch first AI response
    if (!instant) {
      renderConversation(el, s, false);
      appendLoading(el);
      fetchChat(null, function(text) {
        removeLoading(el);
        if (text) {
          conversation.push({ role: 'assistant', content: text });
          saveConversation();
          appendMessage(el, 'assistant', text);
        } else {
          // Fallback to static
          var p = persona(s);
          appendMessage(el, 'assistant', p.desc);
        }
        personalizePageSections();
      });
    } else {
      renderConversation(el, s, true);
      personalizePageSections();
    }
  }

  function renderConversation(el, s, showHistory) {
    var angle = (s / 100) * 360;
    var h = '<div class="conv-gauge-row">' +
      '<div class="assess-gauge assess-gauge-sm" style="background:conic-gradient(var(--gold) 0deg,var(--gold) ' + angle + 'deg,rgba(255,255,255,0.06) ' + angle + 'deg)">' +
      '<div class="assess-gauge-inner"><div class="assess-gauge-score">' + s + '</div><div class="assess-gauge-label">Readiness</div></div></div>' +
      '<div class="conv-gauge-text"><span class="conv-gauge-persona">' + persona(s).label + '</span></div></div>' +
      '<div class="conv-thread" id="convThread"></div>' +
      '<div class="conv-input-row" id="convInputRow">' +
      '<input type="text" class="conv-input" id="convInput" placeholder="Ask about agents, pricing, or your specific workflow..." autocomplete="off">' +
      '<button class="conv-send" id="convSend" aria-label="Send">&#8593;</button>' +
      '</div>' +
      '<div class="conv-actions">' +
      '<button class="conv-action-btn" onclick="sendConversation()">Send this to Briu</button>' +
      '<button class="assess-retake" onclick="resetAssess()">Start over</button>' +
      '</div>';

    el.innerHTML = h;
    el.classList.add('active');

    // Show history
    if (showHistory && conversation.length > 0) {
      var thread = document.getElementById('convThread');
      for (var i = 0; i < conversation.length; i++) {
        appendMessageToThread(thread, conversation[i].role, conversation[i].content);
      }
    }

    // Bind input events
    var input = document.getElementById('convInput');
    var sendBtn = document.getElementById('convSend');
    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          submitMessage();
        }
      });
    }
    if (sendBtn) {
      sendBtn.addEventListener('click', submitMessage);
    }
  }

  function submitMessage() {
    if (isWaiting) return;
    var input = document.getElementById('convInput');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;

    input.value = '';
    conversation.push({ role: 'user', content: text });
    saveConversation();

    var el = document.getElementById('assessResult');
    var thread = document.getElementById('convThread');
    appendMessageToThread(thread, 'user', text);
    appendLoading(el);
    scrollThread();

    fetchChat(text, function(response) {
      removeLoading(el);
      if (response) {
        conversation.push({ role: 'assistant', content: response });
        saveConversation();
        appendMessageToThread(thread, 'assistant', response);
      } else {
        appendMessageToThread(thread, 'assistant', 'Sorry, I had trouble connecting. You can reach the team directly at hi@briu.ai.');
      }
      scrollThread();
    });
  }

  function fetchChat(userMessage, callback) {
    isWaiting = true;
    var payload = {
      quiz: answers,
      page: window.location.pathname,
      sessionId: sessionId,
      messages: []
    };

    // Send full conversation history for context
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
      isWaiting = false;
      sessionId = data.sessionId || sessionId;
      callback(data.response || null);
    })
    .catch(function() {
      isWaiting = false;
      callback(null);
    });
  }

  function appendMessageToThread(thread, role, text) {
    if (!thread) return;
    var div = document.createElement('div');
    div.className = 'conv-msg conv-msg-' + role;
    div.innerHTML = formatMessage(text);
    thread.appendChild(div);
  }

  function appendMessage(el, role, text) {
    var thread = el.querySelector('#convThread') || el.querySelector('.conv-thread');
    appendMessageToThread(thread, role, text);
  }

  function appendLoading(el) {
    var thread = el.querySelector('#convThread') || el.querySelector('.conv-thread');
    if (!thread) return;
    var div = document.createElement('div');
    div.className = 'conv-msg conv-msg-assistant conv-loading';
    div.id = 'convLoadingMsg';
    div.innerHTML = '<div class="assess-loading-dots"><span></span><span></span><span></span></div>';
    thread.appendChild(div);
    scrollThread();
  }

  function removeLoading(el) {
    var ld = document.getElementById('convLoadingMsg');
    if (ld) ld.remove();
  }

  function scrollThread() {
    var thread = document.getElementById('convThread');
    if (thread) thread.scrollTop = thread.scrollHeight;
  }

  function formatMessage(text) {
    // Escape HTML
    var div = document.createElement('div');
    div.textContent = text;
    var safe = div.innerHTML;

    // Convert [link text](/path/) to clickable links
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--gold)">$1</a>');

    // Convert plain /path/ references to links
    safe = safe.replace(/(^|\s)(\/[a-z][a-z0-9\-\/]*\/?)(\s|[.,;!?]|$)/gi, function(m, pre, path, post) {
      return pre + '<a href="' + path + '" style="color:var(--gold)">' + path + '</a>' + post;
    });

    // Paragraphs
    safe = safe.replace(/\n\n/g, '</p><p>');
    return '<p>' + safe + '</p>';
  }

  function saveConversation() {
    try { localStorage.setItem(CONV_KEY, JSON.stringify(conversation)); } catch(e) {}
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
