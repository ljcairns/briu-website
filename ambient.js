/**
 * Ambient Background — Gaudi-inspired flowing filaments
 * Subtle organic lines that drift, breathe, and react to scroll velocity.
 * Uses canvas for performance. Desktop only (skips on mobile/reduced-motion).
 */
(function() {
  // Skip on mobile, low-power, or reduced-motion
  if (window.innerWidth < 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.id = 'ambient-bg';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;opacity:0;transition:opacity 1.5s ease;';
  document.body.appendChild(canvas);

  // Fade in after page loads
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { canvas.style.opacity = '1'; });
  });

  var ctx = canvas.getContext('2d');
  var W, H, dpr;
  var filaments = [];
  var scrollVelocity = 0;
  var lastScrollY = window.scrollY;
  var scrollSample = 0;
  var mouseX = -1, mouseY = -1;
  var time = 0;

  // Palette at very low opacity
  var COLORS = [
    { r: 212, g: 160, b: 90 },   // gold
    { r: 224, g: 123, b: 95 },   // coral
    { r: 90, g: 157, b: 172 },   // river
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Filament: a flowing organic line that drifts slowly
  function createFilament() {
    var color = COLORS[Math.floor(Math.random() * COLORS.length)];
    var side = Math.random();
    var x, y;
    // Spawn from edges or random positions
    if (side < 0.25) { x = -20; y = Math.random() * H; }
    else if (side < 0.5) { x = W + 20; y = Math.random() * H; }
    else if (side < 0.75) { x = Math.random() * W; y = -20; }
    else { x = Math.random() * W; y = Math.random() * H; }

    return {
      // Current position
      x: x, y: y,
      // Drift velocity (very slow)
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.08 + 0.02,
      // Organic curve parameters
      amplitude: 15 + Math.random() * 40,
      frequency: 0.003 + Math.random() * 0.006,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.002 + Math.random() * 0.004,
      // Length of trail
      length: 60 + Math.random() * 120,
      // Visual
      color: color,
      baseOpacity: 0.06 + Math.random() * 0.08,
      width: 0.5 + Math.random() * 1,
      // Lifecycle
      life: 0,
      maxLife: 400 + Math.random() * 600,
      // Twinkle
      twinkleSpeed: 0.01 + Math.random() * 0.03,
      twinklePhase: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    filaments = [];
    var count = Math.floor(W * H / 80000); // ~15-25 on a typical screen
    count = Math.max(8, Math.min(count, 30));
    for (var i = 0; i < count; i++) {
      var f = createFilament();
      f.life = Math.random() * f.maxLife * 0.8; // Stagger start
      filaments.push(f);
    }
  }

  function drawFilament(f) {
    var fadeIn = Math.min(1, f.life / 60);
    var fadeOut = Math.min(1, (f.maxLife - f.life) / 80);
    var lifeFade = fadeIn * fadeOut;
    var twinkle = 0.5 + 0.5 * Math.sin(f.twinklePhase + time * f.twinkleSpeed);
    var scrollBoost = 1 + scrollVelocity * 0.3;
    var opacity = f.baseOpacity * lifeFade * twinkle * scrollBoost;

    if (opacity < 0.003) return;

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(' + f.color.r + ',' + f.color.g + ',' + f.color.b + ',' + opacity.toFixed(4) + ')';
    ctx.lineWidth = f.width;
    ctx.lineCap = 'round';

    // Draw organic curve as series of points
    var steps = Math.floor(f.length / 3);
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var age = f.life - (1 - t) * f.length * 0.3;
      var px = f.x - f.vx * (1 - t) * f.length;
      var py = f.y - f.vy * (1 - t) * f.length;
      // Organic wave
      var wave = Math.sin(f.phase + age * f.frequency + t * 4) * f.amplitude * t;
      // Scroll influence: stretch the wave
      wave *= 1 + scrollVelocity * 0.5;
      px += wave * 0.7;
      py += Math.cos(f.phase + age * f.frequency * 0.7 + t * 3) * f.amplitude * 0.3 * t;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Endpoint glow dot (very subtle)
    if (lifeFade > 0.3 && twinkle > 0.6) {
      var dotOpacity = opacity * 1.5;
      if (dotOpacity > 0.01) {
        ctx.beginPath();
        ctx.arc(f.x + Math.sin(f.phase + f.life * f.frequency) * f.amplitude * 0.7, f.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + f.color.r + ',' + f.color.g + ',' + f.color.b + ',' + dotOpacity.toFixed(4) + ')';
        ctx.fill();
      }
    }
  }

  function update() {
    time++;

    // Smooth scroll velocity
    scrollSample++;
    if (scrollSample % 3 === 0) {
      var currentY = window.scrollY;
      var rawVel = Math.abs(currentY - lastScrollY) / 16;
      scrollVelocity += (Math.min(rawVel, 8) - scrollVelocity) * 0.08;
      lastScrollY = currentY;
    }
    // Decay
    scrollVelocity *= 0.97;

    for (var i = filaments.length - 1; i >= 0; i--) {
      var f = filaments[i];
      f.life++;

      // Move
      f.x += f.vx + scrollVelocity * f.vx * 2;
      f.y += f.vy;
      f.phase += f.phaseSpeed;

      // Recycle if expired or way off screen
      if (f.life > f.maxLife || f.x < -100 || f.x > W + 100 || f.y < -100 || f.y > H + 100) {
        filaments[i] = createFilament();
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    update();
    for (var i = 0; i < filaments.length; i++) {
      drawFilament(filaments[i]);
    }
    requestAnimationFrame(render);
  }

  // Mouse influence: filaments near cursor glow slightly brighter
  // (keeping it very subtle — just tracking position for potential future use)
  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  window.addEventListener('resize', function() {
    resize();
    // Adjust count if needed
    var target = Math.floor(W * H / 80000);
    target = Math.max(8, Math.min(target, 30));
    while (filaments.length < target) filaments.push(createFilament());
    while (filaments.length > target + 5) filaments.pop();
  });

  init();
  render();
})();
