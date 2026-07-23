document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navCta = document.querySelector('.nav-cta');

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Theme toggle */
  const themeBtn = document.querySelector('.theme-toggle');
  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem('loops-theme', theme);
    } catch (e) {}
    if (themeBtn) {
      themeBtn.setAttribute(
        'aria-label',
        theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
      );
    }
  };

  applyTheme(
    document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
  );

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next =
        document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  }

  const searchInput = document.querySelector('#site-search');
  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) searchInput.value = q;
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      if (navCta) navCta.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
        if (navCta) navCta.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const words = document.querySelectorAll('.hero-title .word');
  const animItems = document.querySelectorAll('.anim-item');

  if (!prefersReduced) {
    words.forEach((word, i) => {
      window.setTimeout(() => word.classList.add('is-in'), 120 + i * 110);
    });

    animItems.forEach((el) => {
      const delay = Number(el.dataset.delay || 0);
      window.setTimeout(() => {
        el.classList.add('is-in');
        if (el.hasAttribute('data-float')) {
          el.classList.add('is-floating');
        }
      }, delay);
    });
  } else {
    words.forEach((word) => word.classList.add('is-in'));
    animItems.forEach((el) => el.classList.add('is-in'));
  }

  const floatEl = document.querySelector('[data-float]');
  if (floatEl && !prefersReduced) {
    window.addEventListener(
      'mousemove',
      (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 12;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;
        floatEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      },
      { passive: true }
    );
  }

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  /* Who We Are — sequential scroll reveal & spotlight */
  const introSection = document.querySelector('.home-intro');
  if (introSection) {
    const steps = introSection.querySelectorAll('.reveal-step');

    if ('IntersectionObserver' in window && !prefersReduced) {
      const introIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              introSection.classList.add('is-visible');
              // Fire each step one-by-one with real delays
              steps.forEach((step, i) => {
                const delay = i === 0 ? 100 : 100 + i * 420;
                window.setTimeout(() => {
                  step.classList.add('is-in');
                }, delay);
              });
              introIo.disconnect();
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
      );
      introIo.observe(introSection);
    } else {
      introSection.classList.add('is-visible');
      steps.forEach((s) => s.classList.add('is-in'));
    }

    const spotlightCard = introSection.querySelector('[data-spotlight]');
    if (spotlightCard && !prefersReduced) {
      spotlightCard.addEventListener('mousemove', (e) => {
        const rect = spotlightCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        spotlightCard.style.setProperty('--mouse-x', `${x}px`);
        spotlightCard.style.setProperty('--mouse-y', `${y}px`);
      });
    }
  }

  const counters = document.querySelectorAll('.count-up');
  const animateCount = (el) => {
    const target = Number(el.dataset.target || 0);
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (counters.length) {
    if ('IntersectionObserver' in window && !prefersReduced) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach((el) => cio.observe(el));
    } else {
      counters.forEach((el) => {
        el.textContent = el.dataset.target || '0';
      });
    }
  }

  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.textContent : '';
      if (btn) {
        btn.textContent = 'Message Sent';
        btn.disabled = true;
      }
      form.reset();
      setTimeout(() => {
        if (btn) {
          btn.textContent = original;
          btn.disabled = false;
        }
      }, 2200);
    });
  }
});
