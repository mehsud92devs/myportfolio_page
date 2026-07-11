/* =========================================================
   MAIN.JS — Global Scripts
   Abdul Majeed SEO Services
   ========================================================= */

// ---- Sticky Header ----
(function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  function onScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ---- Mobile Navigation ----
(function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    setTimeout(() => {
      if (!mobileNav.classList.contains('open')) {
        mobileNav.style.display = 'none';
      }
    }, 300);
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close on nav link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
})();

// ---- Active Nav Link ----
(function setActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkFile = href.split('/').pop();
    if (linkFile === path || (path === '' && linkFile === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ---- Fade-in on Scroll (IntersectionObserver) ----
(function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
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

// ---- Skill Bars Animation ----
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const pct = bar.getAttribute('data-width') || '0';
        bar.style.width = pct + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
})();

// ---- Stat Counter Animation ----
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      const displayVal = Number.isInteger(target) ? Math.floor(current) : current.toFixed(1);
      el.textContent = prefix + displayVal + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

// ---- Contact Form Handling ----
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successMsg = document.getElementById('form-success');

  function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(inputId + '-error');
    if (input) input.classList.add('error');
    if (error) {
      error.textContent = message;
      error.classList.add('visible');
    }
  }

  function clearError(inputId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(inputId + '-error');
    if (input) input.classList.remove('error');
    if (error) error.classList.remove('visible');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Live validation
  form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(field => {
    field.addEventListener('input', () => {
      clearError(field.id);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    if (name && !name.value.trim()) {
      showError('name', 'Please enter your full name.');
      valid = false;
    } else if (name) clearError('name');

    if (email && !email.value.trim()) {
      showError('email', 'Please enter your email address.');
      valid = false;
    } else if (email && !validateEmail(email.value)) {
      showError('email', 'Please enter a valid email address.');
      valid = false;
    } else if (email) clearError('email');

    if (message && !message.value.trim()) {
      showError('message', 'Please enter your message.');
      valid = false;
    } else if (message) clearError('message');

    if (valid && successMsg) {
      // <!-- To enable real form submission, integrate with
      //      Formspree: https://formspree.io or EmailJS -->
      form.style.display = 'none';
      successMsg.classList.add('visible');
    }
  });
})();

// ---- Page fade-in on load ----
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.2s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});
