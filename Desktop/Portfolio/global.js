/* ── global.js — Performance-Optimized Animations (v3.1) ── */

(function () {

  /* ══════════════════════════════════════════════════
     1. Scroll Progress Bar (passive, rAF-throttled)
  ══════════════════════════════════════════════════ */
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;z-index:10000;transition:width 0.1s ease;border-radius:0 2px 2px 0;';
  document.body.prepend(bar);
  let rafScroll = null;
  window.addEventListener('scroll', () => {
    if (rafScroll) return;
    rafScroll = requestAnimationFrame(() => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
      rafScroll = null;
    });
  }, { passive: true });

  /* ══════════════════════════════════════════════════
     2. Cursor Glow (low-perf, CSS-transitioned only)
  ══════════════════════════════════════════════════ */
  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  glow.style.cssText = 'position:fixed;pointer-events:none;z-index:1;border-radius:50%;transform:translate(-50%,-50%);transition:left 0.15s ease,top 0.15s ease;';
  document.body.appendChild(glow);
  let glowRaf = null;
  window.addEventListener('mousemove', e => {
    if (glowRaf) return;
    glowRaf = requestAnimationFrame(() => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
      glowRaf = null;
    });
  }, { passive: true });

  /* ══════════════════════════════════════════════════
     3. Cursor Trail — reduced to 6 dots, proper rAF
     Uses transform3d only → compositor thread, no repaint
  ══════════════════════════════════════════════════ */
  const TRAIL_COUNT = 6;
  const trailDots = [];
  const trailPos = [];
  const TRAIL_COLORS = ['rgba(168,85,247,0.7)','rgba(149,75,230,0.6)','rgba(130,65,210,0.5)','rgba(80,160,240,0.4)','rgba(34,211,238,0.3)','rgba(34,211,238,0.2)'];

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const d = document.createElement('div');
    const size = 7 - i * 0.8;
    d.style.cssText = `
      position:fixed;top:0;left:0;pointer-events:none;z-index:9997;
      width:${size}px;height:${size}px;border-radius:50%;
      background:${TRAIL_COLORS[i]};
      transform:translate3d(0,0,0) translate(-50%,-50%);
      will-change:transform;
    `;
    document.body.appendChild(d);
    trailDots.push(d);
    trailPos.push({ x: -100, y: -100 });
  }

  let mouseX = -100, mouseY = -100;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  let trailRunning = false;
  function animateTrail() {
    trailPos[0].x += (mouseX - trailPos[0].x) * 0.4;
    trailPos[0].y += (mouseY - trailPos[0].y) * 0.4;
    for (let i = 1; i < TRAIL_COUNT; i++) {
      trailPos[i].x += (trailPos[i-1].x - trailPos[i].x) * 0.45;
      trailPos[i].y += (trailPos[i-1].y - trailPos[i].y) * 0.45;
    }
    for (let i = 0; i < TRAIL_COUNT; i++) {
      trailDots[i].style.transform = `translate3d(${trailPos[i].x}px,${trailPos[i].y}px,0) translate(-50%,-50%)`;
    }
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  /* ══════════════════════════════════════════════════
     4. Ripple Click Effect
  ══════════════════════════════════════════════════ */
  document.addEventListener('click', e => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.cssText = `
      position:fixed;top:${e.clientY}px;left:${e.clientX}px;
      width:0;height:0;border-radius:50%;
      border:1.5px solid rgba(168,85,247,0.6);
      pointer-events:none;z-index:9996;
      transform:translate(-50%,-50%);
      animation:ripple-expand 0.65s ease-out forwards;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });

  /* ══════════════════════════════════════════════════
     5. Particle Burst on Button Click (reduced to 12)
  ══════════════════════════════════════════════════ */
  const BURST_COLORS = ['#a855f7','#22d3ee','#f472b6','#fbbf24','#34d399'];
  document.querySelectorAll('.btn-resume,.btn-primary,.btn-outline').forEach(btn => {
    btn.addEventListener('click', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 12;
        const dist = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        const col = BURST_COLORS[i % BURST_COLORS.length];
        const size = 4 + Math.random() * 4;
        p.style.cssText = `
          position:fixed;left:${cx}px;top:${cy}px;
          width:${size}px;height:${size}px;border-radius:50%;
          background:${col};pointer-events:none;z-index:9990;
          will-change:transform,opacity;
          animation:burst-particle 0.6s ease-out forwards;
          --tx:${tx}px;--ty:${ty}px;
          transform:translate(-50%,-50%);
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    });
  });

  /* ══════════════════════════════════════════════════
     6. Scroll-Reveal (IntersectionObserver — no scroll cost)
  ══════════════════════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObs.observe(el));

  /* ══════════════════════════════════════════════════
     7. Text Scramble on Section Titles (deferred)
  ══════════════════════════════════════════════════ */
  const CHARS = '!<>-_\\/[]{}—=+*^?#';
  class TextScramble {
    constructor(el) { this.el = el; this.update = this.update.bind(this); }
    setText(newText) {
      const old = this.el.innerText;
      const len = Math.max(old.length, newText.length);
      const p = new Promise(res => { this.resolve = res; });
      this.queue = [];
      for (let i = 0; i < len; i++) {
        const from = old[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 12);
        const end = start + Math.floor(Math.random() * 12);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return p;
    }
    update() {
      let output = '', complete = 0;
      for (let i = 0; i < this.queue.length; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) { complete++; output += to; }
        else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) { char = CHARS[Math.floor(Math.random() * CHARS.length)]; this.queue[i].char = char; }
          output += `<span class="scramble-char">${char}</span>`;
        } else { output += from; }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) { this.resolve(); }
      else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
    }
  }
  document.querySelectorAll('.section-title').forEach(el => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const firstChild = el.firstChild;
          if (firstChild && firstChild.nodeType === Node.TEXT_NODE && firstChild.textContent.trim()) {
            const original = firstChild.textContent;
            const span = document.createElement('span');
            span.textContent = original;
            firstChild.replaceWith(span);
            const fx = new TextScramble(span);
            setTimeout(() => fx.setText(original), 100);
          }
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });



  /* ══════════════════════════════════════════════════
     8. Magnetic Buttons (rAF-throttled)
  ══════════════════════════════════════════════════ */
  function initMagnetic() {
    document.querySelectorAll('.btn-resume, .btn-outline, .btn-primary, .nav-logo').forEach(btn => {
      let rafMag = null;
      btn.addEventListener('mousemove', e => {
        if (rafMag) return;
        rafMag = requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
          const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
          btn.style.transform = `translate(${x}px, ${y}px)`;
          rafMag = null;
        });
      }, { passive: true });
      btn.addEventListener('mouseleave', () => {
        if (rafMag) { cancelAnimationFrame(rafMag); rafMag = null; }
        btn.style.transform = '';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      });
      btn.addEventListener('mouseenter', () => { btn.style.transition = 'none'; });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initMagnetic(); });
  } else { initMagnetic(); }


  /* ══════════════════════════════════════════════════
     9. Count-Up Numbers (IntersectionObserver)
  ══════════════════════════════════════════════════ */
  function initCountUp() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const target = +el.getAttribute('data-count');
            const suffix = el.getAttribute('data-suffix') || '';
            let current = 0;
            const step = target / 45;
            const timer = setInterval(() => {
              current += step;
              if (current >= target) { current = target; clearInterval(timer); }
              el.textContent = Math.round(current) + suffix;
            }, 30);
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initCountUp); } else { initCountUp(); }

  /* ══════════════════════════════════════════════════
     10. Floating Emoji (reduced frequency, CSS anim)
  ══════════════════════════════════════════════════ */
  const EMOJIS = ['⚡','🚀','💻','☁️','🌟','⚛️','🐳'];
  function spawnEmoji() {
    const e = document.createElement('div');
    e.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const startX = 5 + Math.random() * 90;
    const dur = 14 + Math.random() * 8;
    e.style.cssText = `
      position:fixed;left:${startX}vw;bottom:-40px;
      font-size:${14 + Math.random() * 12}px;pointer-events:none;z-index:0;
      opacity:0;will-change:transform,opacity;
      animation:emoji-float ${dur}s linear forwards;
    `;
    document.body.appendChild(e);
    setTimeout(() => e.remove(), dur * 1000);
  }
  // Only spawn when tab is visible, every 5s
  let emojiInterval = null;
  function startEmoji() { emojiInterval = setInterval(spawnEmoji, 5000); }
  function stopEmoji() { clearInterval(emojiInterval); }
  document.addEventListener('visibilitychange', () => { document.hidden ? stopEmoji() : startEmoji(); });
  startEmoji();

  /* ══════════════════════════════════════════════════
     11. Radar Ping on Availability Dots
  ══════════════════════════════════════════════════ */
  function initRadarPing() {
    document.querySelectorAll('.avail-dot, .achdot, .eyebrow-dot').forEach(dot => {
      const ping = document.createElement('div');
      ping.className = 'radar-ping';
      const parent = dot.parentElement;
      if (parent) { parent.style.position = 'relative'; parent.appendChild(ping); }
    });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initRadarPing); } else { initRadarPing(); }

  /* ══════════════════════════════════════════════════
     12. Glitch on Hero Name
  ══════════════════════════════════════════════════ */
  function initGlitch() {
    const heroName = document.querySelector('.hero-name');
    if (!heroName) return;
    let glitching = false;
    heroName.addEventListener('mouseenter', () => {
      if (glitching) return; glitching = true;
      heroName.classList.add('glitch-active');
      setTimeout(() => { heroName.classList.remove('glitch-active'); glitching = false; }, 500);
    });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initGlitch); } else { initGlitch(); }

  /* ══════════════════════════════════════════════════
     13. Nav Rainbow Underline
  ══════════════════════════════════════════════════ */
  function initNavRainbow() {
    document.querySelectorAll('.nav-link, .footer-nav a').forEach(link => {
      const under = document.createElement('span');
      under.className = 'nav-rainbow-line';
      under.style.cssText = `
        position:absolute;bottom:2px;left:50%;right:50%;
        height:2px;border-radius:2px;
        background:linear-gradient(90deg,#a855f7,#22d3ee,#f472b6);
        transition:left 0.22s ease,right 0.22s ease;
        pointer-events:none;will-change:left,right;
      `;
      link.style.position = 'relative';
      link.appendChild(under);
      link.addEventListener('mouseenter', () => { under.style.left = '8px'; under.style.right = '8px'; });
      link.addEventListener('mouseleave', () => { under.style.left = '50%'; under.style.right = '50%'; });
    });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initNavRainbow); } else { initNavRainbow(); }

  /* ══════════════════════════════════════════════════
     14. Easter Egg: Click Name x3 → Lightning
  ══════════════════════════════════════════════════ */
  function initEasterEgg() {
    const name = document.querySelector('.hero-name');
    if (!name) return;
    let clicks = 0;
    name.addEventListener('click', () => {
      clicks++;
      if (clicks % 3 === 0) {
        const rect = name.getBoundingClientRect();
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        for (let i = 0; i < 6; i++) {
          const bolt = document.createElement('div');
          const angle = (Math.PI * 2 * i) / 6;
          bolt.textContent = '⚡';
          bolt.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:24px;pointer-events:none;z-index:9995;transform:translate(-50%,-50%);animation:bolt-fly 0.7s ease-out forwards;--tx:${Math.cos(angle)*100}px;--ty:${Math.sin(angle)*100}px;`;
          document.body.appendChild(bolt);
          setTimeout(() => bolt.remove(), 700);
        }
      }
    });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initEasterEgg); } else { initEasterEgg(); }

  /* ══════════════════════════════════════════════════
     15. Inject Keyframes (once, not in hot path)
  ══════════════════════════════════════════════════ */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes ripple-expand { 0%{width:0;height:0;opacity:0.8} 100%{width:260px;height:260px;opacity:0} }
    @keyframes burst-particle { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0.2);opacity:0} }
    @keyframes emoji-float { 0%{transform:translateY(0) rotate(0deg);opacity:0} 8%{opacity:0.35} 92%{opacity:0.25} 100%{transform:translateY(-105vh) rotate(360deg);opacity:0} }
    @keyframes radar-expand { 0%{width:100%;height:100%;opacity:0.5} 100%{width:340%;height:340%;opacity:0} }
    @keyframes glitch-1 { 0%,100%{clip-path:inset(0 0 100% 0)} 20%{clip-path:inset(20% 0 60% 0);transform:translate(-2px,0)} 50%{clip-path:inset(50% 0 20% 0);transform:translate(2px,0)} 80%{clip-path:inset(80% 0 5% 0);transform:translate(-1px,0)} }
    @keyframes glitch-2 { 0%,100%{clip-path:inset(0 0 100% 0)} 15%{clip-path:inset(10% 0 70% 0);transform:translate(2px,0)} 45%{clip-path:inset(60% 0 10% 0);transform:translate(-2px,0)} 75%{clip-path:inset(90% 0 2% 0);transform:translate(1px,0)} }
    .glitch-active { position:relative; }
    .glitch-active::before,.glitch-active::after { content:attr(data-text);position:absolute;top:0;left:0;width:100%;pointer-events:none;background:inherit;-webkit-background-clip:text;background-clip:text; }
    .glitch-active::before { color:#22d3ee;animation:glitch-1 0.22s steps(2) 2; }
    .glitch-active::after { color:#f472b6;animation:glitch-2 0.22s steps(2) 2; }
    @keyframes bolt-fly { 0%{transform:translate(-50%,-50%) scale(1.5);opacity:1} 100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(0.4);opacity:0} }
    .scramble-char { color:var(--accent-cyan);opacity:0.7;font-family:var(--font-mono); }
    .radar-ping { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:50%;border:1.5px solid currentColor;width:12px;height:12px;animation:radar-expand 2s ease-out infinite;pointer-events:none; }
  `;
  document.head.appendChild(styleEl);

})();
