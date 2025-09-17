/* js/main.js
   Modern UI interactions: nav toggle, theme, reveal, lightbox, form validation
*/

/* ---------- Utilities ---------- */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ---------- Setup ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // theme (persist user choice)
  const themeToggle = $('#theme-toggle');
  const root = document.documentElement;
  const stored = localStorage.getItem('acme-theme') || null;
  if (stored) root.setAttribute('data-theme', stored);
  else {
    // prefer dark by default — choose based on system
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    if (prefersLight) root.setAttribute('data-theme', 'light');
  }
  on(themeToggle, 'click', () => {
    const cur = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', cur === 'light' ? 'light' : 'dark');
    localStorage.setItem('acme-theme', cur === 'light' ? 'light' : 'dark');
  });

  // mobile nav
  const navToggle = $('#nav-toggle');
  const nav = $('#primary-nav');
  if (navToggle && nav){
    on(navToggle, 'click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close on outside click
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 900 && !nav.contains(e.target) && !navToggle.contains(e.target)){
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Smooth anchor scroll (native where possible) ---------- */
  document.documentElement.style.scrollBehavior = 'smooth';

  /* ---------- Reveal on scroll using IntersectionObserver ---------- */
  const revealables = $$('.reveal, .card, .gallery-item, .hero-card');
  if ('IntersectionObserver' in window){
    const obs = new IntersectionObserver((entries, io) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealables.forEach(el => obs.observe(el));
  } else {
    // fallback
    revealables.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Gallery Lightbox (accessible) ---------- */
  (function galleryLightbox(){
    const gallery = $('#gallery');
    const lightbox = $('#lightbox');
    if (!gallery || !lightbox) return;
    const items = $$('.gallery-item', gallery);
    const img = $('#lightbox-img');
    const closeBtn = $('#lb-close');
    const prevBtn = $('#lb-prev');
    const nextBtn = $('#lb-next');
    let idx = -1;

    function open(i){
      idx = i;
      const src = items[i].dataset.src;
      const alt = items[i].dataset.alt || '';
      img.src = src;
      img.alt = alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close(){
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      img.src = '';
      img.alt = '';
      // return focus to the originating element
      if (idx >= 0) items[idx].focus();
      idx = -1;
    }
    function show(n){
      if (n < 0) n = items.length - 1;
      if (n >= items.length) n = 0;
      open(n);
    }

    items.forEach((btn, i) => {
      on(btn, 'click', () => open(i));
      btn.setAttribute('aria-label', btn.querySelector('img')?.alt || `Open image ${i+1}`);
    });

    on(closeBtn, 'click', close);
    on(prevBtn, 'click', () => show(idx - 1));
    on(nextBtn, 'click', () => show(idx + 1));
    on(lightbox, 'click', (e) => { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });

    // touch swipe (simple)
    let startX = 0;
    on(img, 'touchstart', (e) => { startX = e.touches[0].clientX; });
    on(img, 'touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (dx > 50) show(idx - 1);
      if (dx < -50) show(idx + 1);
    });
  })();

  /* ---------- Contact form validation (client) ---------- */
  const form = $('#contact-form');
  if (form){
    on(form, 'submit', (ev) => {
      ev.preventDefault();
      const name = $('#name', form);
      const email = $('#email', form);
      const message = $('#message', form);
      const status = $('#form-status');
      let valid = true;
      // reset
      $$('.error', form).forEach(el => el.textContent = '');

      if (!name.value.trim() || name.value.trim().length < 2){
        $('#name-error', form).textContent = 'Please enter your name (min 2 chars).';
        valid = false;
      }
      if (!/^\S+@\S+\.\S+$/.test(email.value.trim())){
        $('#email-error', form).textContent = 'Please enter a valid email.';
        valid = false;
      }
      if (!message.value.trim() || message.value.trim().length < 10){
        $('#message-error', form).textContent = 'Message must be at least 10 characters.';
        valid = false;
      }
      if (!valid){
        status.textContent = 'Please fix the errors above.';
        status.style.color = '#ffb4b4';
        return;
      }

      // simulate send
      status.textContent = 'Sending…';
      status.style.color = '';
      setTimeout(() => {
        status.textContent = 'Thanks — message sent (simulated).';
        status.style.color = '#b7f5d6';
        form.reset();
      }, 800);
    });
  }

  // set years
  $$('.year').forEach(el => el.textContent = new Date().getFullYear());
});
// Navbar background on scroll
const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 80) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});
