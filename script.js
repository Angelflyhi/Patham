/* =====================================================
   PATHUM YOUTH FORUM — SCRIPT
   Particle canvas, scroll reveal, slider, navbar
   ===================================================== */

'use strict';

/* ---- NAVBAR scroll behaviour ---- */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ---- HERO PARTICLE CANVAS ---- */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let particles = [];
  let animId;

  const COLORS = [
    'rgba(212,160,23,',
    'rgba(240,192,64,',
    'rgba(200,120,10,',
    'rgba(255,255,255,',
  ];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.8 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -(Math.random() * 0.5 + 0.15);
      this.alpha = Math.random() * 0.6 + 0.1;
      this.colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const fade = progress < 0.1 ? progress / 0.1 : progress > 0.8 ? 1 - (progress - 0.8) / 0.2 : 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.colorBase + (this.alpha * fade) + ')';
      ctx.fill();
    }
  }

  // Floating lines
  class Line {
    constructor() { this.reset(); }
    reset() {
      this.x1 = Math.random() * W;
      this.y1 = Math.random() * H;
      const angle = Math.random() * Math.PI * 2;
      const len = Math.random() * 80 + 30;
      this.x2 = this.x1 + Math.cos(angle) * len;
      this.y2 = this.y1 + Math.sin(angle) * len;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = -(Math.random() * 0.3 + 0.08);
      this.alpha = Math.random() * 0.12 + 0.03;
      this.life = 0;
      this.maxLife = Math.random() * 500 + 300;
    }
    update() {
      this.x1 += this.speedX; this.x2 += this.speedX;
      this.y1 += this.speedY; this.y2 += this.speedY;
      this.life++;
      if (this.life > this.maxLife || this.y1 < -100) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const fade = progress < 0.1 ? progress / 0.1 : progress > 0.8 ? 1 - (progress - 0.8) / 0.2 : 1;
      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.strokeStyle = `rgba(212,160,23,${this.alpha * fade})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;
    particles = [];
    lines = [];
    const count = Math.min(Math.floor((W * H) / 8000), 120);
    for (let i = 0; i < count; i++) particles.push(new Particle());
    const lineCount = Math.min(Math.floor((W * H) / 20000), 30);
    for (let i = 0; i < lineCount; i++) lines.push(new Line());
  }

  let lines = [];

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    lines.forEach(l => { l.update(); l.draw(); });
    animId = requestAnimationFrame(loop);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
  loop();
})();


/* ---- SCROLL REVEAL ---- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();


/* ---- TESTIMONIAL SLIDER ---- */
(function initSlider() {
  const track = document.getElementById('test-track');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  if (!track) return;

  let current = 0;
  const total = dots.length;
  let autoTimer;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.idx));
      startAuto();
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    startAuto();
  }, { passive: true });

  startAuto();
})();


/* ---- COUNTER ANIMATION ---- */
(function initCounters() {
  const statEl = document.getElementById('stat-editions');
  if (!statEl) return;

  function animateCount(el, target, duration = 1200) {
    const start = performance.now();
    const startVal = 0;
    const update = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(startVal + (target - startVal) * ease);
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(statEl, 2, 1000);
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(statEl);
})();


/* ---- SMOOTH ACTIVE NAV LINK ---- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--gold-light)'
            : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();


/* ---- VALUE CARD HOVER TILT ---- */
(function initTilt() {
  const cards = document.querySelectorAll('.value-card, .vm-card');
  if (window.matchMedia('(hover: none)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      card.style.transform = `
        translateY(-6px)
        rotateX(${-y * 4}deg)
        rotateY(${x * 4}deg)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ---- YEAR COUNTDOWN ---- */
(function initCountdown() {
  const target = new Date('2026-05-23T09:00:00');

  function update() {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) return;

    const days = Math.floor(diff / 86400000);
    const badge = document.querySelector('.hero-badge');
    if (badge && days > 0) {
      badge.innerHTML = `<span class="badge-dot"></span> Pathum MUN 2026 &mdash; ${days} days away`;
    }
  }

  update();
  setInterval(update, 60000);
})();


/* ---- PARALLAX ON HERO GLOW ---- */
(function initParallax() {
  const glow1 = document.querySelector('.hero-glow-1');
  const glow2 = document.querySelector('.hero-glow-2');
  if (!glow1 || !glow2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    glow1.style.transform = `translate(${x}px, ${y}px)`;
    glow2.style.transform = `translate(${-x * 0.6}px, ${-y * 0.6}px)`;
  }, { passive: true });
})();


/* ---- PATH SVG DRAW ANIMATION ---- */
(function initPathDraw() {
  const path = document.getElementById('journey-path');
  if (!path) return;

  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  path.style.transition = 'none';

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      path.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)';
      path.style.strokeDashoffset = '0';
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(path);
})();
