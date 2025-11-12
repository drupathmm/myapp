/* Minimal, robust JS — updated for About and spacing improvements */

(function () {
  'use strict';

  const $ = (s, ctx = document) => (ctx || document).querySelector(s);
  const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));

  // placeholder svg helper
  window.inlinePlaceholderSVG = function (w = 160, h = 160) {
    const bg = '#07101a';
    const fg = '#4ade80';
    const txt = 'Image';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' fill='${fg}' font-family='Arial' font-size='18' dominant-baseline='middle' text-anchor='middle'>${txt}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };

  // nodes
  const topNav = $('#top-nav');
  const revealEls = $$('.scroll-reveal');
  const lazyImgs = $$('img[loading="lazy"]');
  const backToTop = document.getElementById('back-to-top');
  const subtitle = document.getElementById('animated-subtitle');
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  // small console hint
  console.info('Portfolio loaded — About restored and Resume spacing adjusted.');

  // set year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // anchor smooth scroll with safe offset
  const offset = () => (topNav ? topNav.offsetHeight + 12 : 28);
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const rect = target.getBoundingClientRect();
      const topY = window.scrollY + rect.top - offset();
      window.scrollTo({ top: topY, behavior: 'smooth' });
    });
  });

  // IntersectionObserver for reveal + nav highlight
  if ('IntersectionObserver' in window) {
    try {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            const id = entry.target.id;
            if (id) {
              $$('.nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
            }
          }
        });
      }, { threshold: 0.22 });
      revealEls.forEach(el => io.observe(el));
    } catch (e) {
      revealEls.forEach(el => el.classList.add('visible'));
    }
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // lazy images
  if ('IntersectionObserver' in window) {
    const imgIo = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const ds = img.dataset && img.dataset.src;
        if (ds) img.src = ds;
        img.removeAttribute('data-src');
        obs.unobserve(img);
      });
    }, { rootMargin: '200px 0px' });
    lazyImgs.forEach(img => imgIo.observe(img));
  }

  // back-to-top and nav shadow
  window.addEventListener('scroll', () => {
    const y = window.scrollY || window.pageYOffset;
    if (topNav) {
      if (y > 60) topNav.classList.add('scrolled'); else topNav.classList.remove('scrolled');
    }
    if (backToTop) {
      if (y > 600) backToTop.classList.add('show'); else backToTop.classList.remove('show');
    }
  }, { passive: true });

  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // subtitle small typewriter
  (function typeSubtitle() {
    const el = subtitle;
    if (!el) return;
    const phrases = [
      'I craft clean UI with meaningful UX.',
      'Performance and accessibility first.',
      'I build maintainable frontend code.'
    ];
    let i = 0, ch = 0, deleting = false;
    const speed = 40;
    (function step() {
      const cur = phrases[i];
      if (!deleting) {
        el.textContent = cur.slice(0, ch + 1);
        ch++;
        if (ch >= cur.length) { deleting = true; setTimeout(step, 900); return; }
        setTimeout(step, speed + Math.random() * 30);
      } else {
        el.textContent = cur.slice(0, ch - 1);
        ch--;
        if (ch <= 0) { deleting = false; i = (i + 1) % phrases.length; }
        setTimeout(step, speed / 1.5);
      }
    })();
  })();

  // simple cursor spotlight (respects reduced motion)
  (function cursorSpot() {
    const spot = document.getElementById('cursor-spot');
    if (!spot) return;
    const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq && mq.matches) { spot.style.display = 'none'; return; }
    let mx = innerWidth / 2, my = innerHeight / 2, sx = mx, sy = my;
    const lerp = (a, b, n) => (1 - n) * a + n * b;
    document.addEventListener('mousemove', (ev) => { mx = ev.clientX; my = ev.clientY; }, { passive: true });
    (function frame() {
      sx = lerp(sx, mx, 0.16);
      sy = lerp(sy, my, 0.16);
      spot.style.transform = `translate3d(${sx - (spot.offsetWidth / 2)}px, ${sy - (spot.offsetHeight / 2)}px, 0)`;
      requestAnimationFrame(frame);
    })();
  })();

  // contact form mailto fallback + small validation
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (contactForm.name && contactForm.name.value || '').trim();
      const email = (contactForm.email && contactForm.email.value || '').trim();
      const msg = (contactForm.message && contactForm.message.value || '').trim();
      if (!name || !email || !msg) return showStatus('Please complete all fields', true);
      const re = /\S+@\S+\.\S+/;
      if (!re.test(email)) return showStatus('Please enter a valid email', true);
      const subject = encodeURIComponent(`Contact from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
      window.location.href = `mailto:youremail@example.com?subject=${subject}&body=${body}`;
      showStatus('Opening your email client...', false);
    });
  }

  function showStatus(text, isError) {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.style.color = isError ? '#f97373' : 'var(--accent)';
    setTimeout(() => { formStatus.textContent = ''; }, 4000);
  }

})();
