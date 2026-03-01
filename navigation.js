/* ============================================
   Lillico Art — Navigation, Lenis, GSAP,
   Opening Sequence, Gallery, Page Transitions
   ============================================ */
(function () {
  'use strict';

  var isMobile = window.innerWidth <= 768;

  /* ============================================
     FAILSAFE — If GSAP didn't load, show the page
     ============================================ */
  if (typeof gsap === 'undefined') {
    document.body.style.opacity = '1';
    document.body.style.animation = 'none';
  }

  /* ============================================
     LENIS — Smooth scroll (desktop only)
     ============================================ */
  var lenis = null;

  if (!isMobile && typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({
        duration: 1.4,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true
      });

      // Connect Lenis to GSAP ticker
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);

      // Sync Lenis scroll position with ScrollTrigger
      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
      }
    } catch (e) {
      lenis = null;
    }
  } else {
    // No Lenis — just keep ScrollTrigger updated
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.ticker.add(function () { ScrollTrigger.update(); });
    }
  }


  /* ============================================
     MOBILE NAVIGATION
     ============================================ */
  /* ============================================
     ACTIVE NAV LINK — highlight current page
     ============================================ */
  var currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href.indexOf('#') !== -1) return;
    if (href === currentPath) {
      link.classList.add('active');
    }
  });


  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-menu');
  var navLinks = document.querySelectorAll('.nav-link');

  if (toggle && menu) {
    function openNav() {
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');
      document.body.classList.add('nav-open');
      if (lenis) lenis.stop();
    }

    function closeNav() {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      if (lenis) lenis.start();
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 768) closeNav();
      });
    });
  }


  /* ============================================
     PAGE TRANSITIONS — GSAP fade
     ============================================ */

  // Fade in on every page (except home — has its own opening sequence)
  if (typeof gsap !== 'undefined' && !document.body.classList.contains('home')) {
    document.body.style.animation = 'none';
    gsap.fromTo(document.body,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }

  // Fade out on link click
  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    link.addEventListener('click', function (e) {
      // Same-page anchor — smooth scroll instead of reloading
      if (href.indexOf('#') !== -1) {
        var parts = href.split('#');
        var linkPage = parts[0];
        if (linkPage === currentPath || linkPage === '') {
          e.preventDefault();
          var target = document.getElementById(parts[1]);
          if (target) {
            if (lenis) {
              lenis.scrollTo(target);
            } else {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
          // Close mobile nav if open
          if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
            toggle.setAttribute('aria-expanded', 'false');
            menu.classList.remove('is-open');
            document.body.classList.remove('nav-open');
            if (lenis) lenis.start();
          }
          return;
        }
      }

      e.preventDefault();
      if (typeof gsap !== 'undefined') {
        gsap.to(document.body, {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: function () { window.location.href = href; }
        });
      } else {
        window.location.href = href;
      }
    });
  });


  /* ============================================
     HOMEPAGE OPENING SEQUENCE (GSAP)
     ============================================ */
  if (document.body.classList.contains('home') && typeof gsap !== 'undefined') {
    var heroImg = document.querySelector('.hero-image');
    var heroGradient = document.querySelector('.hero-gradient');
    var navBrand = document.querySelector('.nav-brand');
    var heroEyebrow = document.querySelector('.hero-eyebrow');
    var heroTitle = document.querySelector('.hero-title');
    var navMenu = document.querySelector('.nav-menu');

    // Cancel CSS failsafe animation — GSAP is in control now
    document.body.style.animation = 'none';
    // Set initial hidden states
    gsap.set(document.body, { opacity: 1 });
    gsap.set([heroImg, heroGradient, navBrand, heroEyebrow, heroTitle, navMenu], { opacity: 0 });
    gsap.set([navBrand, heroEyebrow, heroTitle], { y: 14 });

    var runOpeningSequence = function () {
      var tl = gsap.timeline();

      tl.to(heroImg, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
        .to(heroGradient, { opacity: 1, duration: 1, ease: 'power2.out' }, 0.6)
        .to(navBrand, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.0)
        .to(heroEyebrow, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.4)
        .to(heroTitle, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 1.7)
        .to(navMenu, { opacity: 1, duration: 0.6, ease: 'power3.out' }, 2.0);
    };

    // Preload hero image, then run sequence
    var preloader = new Image();
    preloader.onload = runOpeningSequence;
    preloader.onerror = runOpeningSequence;
    preloader.src = heroImg.src;
  }


  /* ============================================
     SCROLL-LINKED ANIMATIONS (GSAP + ScrollTrigger)
     ============================================ */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

    // --- Hero parallax (homepage) ---
    if (document.querySelector('.hero') && document.body.classList.contains('home')) {
      gsap.to('.hero-image', {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: isMobile ? false : true
        }
      });
    }

    // --- Nav background on scroll ---
    if (!document.body.classList.contains('page-interior')) {
      ScrollTrigger.create({
        start: 'top -80',
        onUpdate: function (self) {
          var navEl = document.querySelector('nav');
          if (!navEl) return;
          if (self.progress > 0) {
            navEl.classList.add('scrolled');
          } else {
            navEl.classList.remove('scrolled');
          }
        }
      });
    }

    // --- Composition split animations ---
    if (document.querySelector('.composition-split')) {
      gsap.from('.composition-split__image img', {
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.composition-split',
          start: 'top bottom',
          end: 'bottom top',
          scrub: isMobile ? false : 1.5
        }
      });

      gsap.from('.composition-heading', {
        x: -40,
        opacity: 0,
        ease: 'power3.out',
        duration: 1,
        scrollTrigger: {
          trigger: '.composition-split',
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      });

    }

    // --- Portrait statement — clip-path wipe reveal ---
    gsap.utils.toArray('.portrait-statement__inner').forEach(function (el) {
      gsap.from(el, {
        clipPath: 'inset(100% 0% 0% 0%)',
        ease: 'power4.inOut',
        duration: 1.4,
        scrollTrigger: {
          trigger: el,
          start: 'top 65%',
          toggleActions: 'play none none none'
        }
      });
    });

    // --- Portrait captions fade in ---
    gsap.utils.toArray('.portrait-statement__caption').forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 15,
        ease: 'power3.out',
        duration: 0.8,
        delay: 0.6,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });

    // --- Text interruption reveal ---
    if (document.querySelector('.text-interruption')) {
      gsap.from('.text-interruption__inner > div:first-child', {
        opacity: 0,
        y: 30,
        ease: 'power3.out',
        duration: 1,
        scrollTrigger: {
          trigger: '.text-interruption',
          start: 'top 70%',
          toggleActions: 'play none none none'
        }
      });
    }

    // --- Process numbers — stagger on enter ---
    gsap.utils.toArray('.process-number').forEach(function (num, i) {
      gsap.from(num, {
        opacity: 0,
        y: 30,
        delay: i * 0.12,
        ease: 'power3.out',
        duration: 0.8,
        scrollTrigger: {
          trigger: '.process-steps',
          start: 'top 70%',
          toggleActions: 'play none none none'
        }
      });
    });

    gsap.utils.toArray('.process-step h3, .process-step p').forEach(function (el, i) {
      gsap.from(el, {
        opacity: 0,
        y: 15,
        delay: i * 0.06,
        ease: 'power3.out',
        duration: 0.7,
        scrollTrigger: {
          trigger: '.process-steps',
          start: 'top 65%',
          toggleActions: 'play none none none'
        }
      });
    });

    // --- Section titles — horizontal slide in ---
    gsap.utils.toArray('.section-title').forEach(function (title) {
      gsap.from(title, {
        x: -60,
        opacity: 0,
        ease: 'power3.out',
        duration: 1,
        scrollTrigger: {
          trigger: title,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    });

    // --- Contact minimal fade ---
    if (document.querySelector('.contact-minimal')) {
      gsap.from('.contact-minimal__inner', {
        opacity: 0,
        y: 30,
        ease: 'power3.out',
        duration: 1,
        scrollTrigger: {
          trigger: '.contact-minimal',
          start: 'top 70%',
          toggleActions: 'play none none none'
        }
      });
    }
  }


  /* ============================================
     REVEAL ANIMATIONS (Intersection Observer fallback)
     ============================================ */
  var revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }


  /* ============================================
     GALLERY — Immersive viewer (Mode 1)
     ============================================ */
  var immersive = document.querySelector('#gallery-immersive');
  var gridView = document.querySelector('#gallery-grid-view');

  if (immersive && typeof gsap !== 'undefined') {
    var pieces = immersive.querySelectorAll('.gallery-piece');
    var counter = immersive.querySelector('.gallery-current');
    var totalEl = immersive.querySelector('.gallery-total');
    var titleEl = immersive.querySelector('.gallery-piece-title');
    var metaEl = immersive.querySelector('.gallery-piece-meta');
    var currentPiece = 0;
    var isAnimating = false;

    if (totalEl) totalEl.textContent = String(pieces.length).padStart(2, '0');

    var updateInfo = function (index) {
      var piece = pieces[index];
      if (counter) counter.textContent = String(index + 1).padStart(2, '0');
      if (titleEl) titleEl.textContent = piece.dataset.title || '';
      if (metaEl) metaEl.textContent = piece.dataset.meta || '';
    };

    var goTo = function (index) {
      if (index === currentPiece || isAnimating) return;
      isAnimating = true;

      var outgoing = pieces[currentPiece];
      var incoming = pieces[index];

      gsap.set(incoming, { opacity: 0 });
      gsap.set(incoming.querySelector('img'), { scale: 0.97 });
      incoming.classList.add('active');

      var tl = gsap.timeline({
        onComplete: function () {
          outgoing.classList.remove('active');
          gsap.set(outgoing, { opacity: 0 });
          isAnimating = false;
        }
      });

      tl.to(outgoing, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0)
        .to(incoming, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.15)
        .to(incoming.querySelector('img'), { scale: 1, duration: 0.4, ease: 'power3.out' }, 0.15);

      currentPiece = index;
      updateInfo(index);
    };

    var next = function () { goTo((currentPiece + 1) % pieces.length); };
    var prev = function () { goTo((currentPiece - 1 + pieces.length) % pieces.length); };

    var prevBtn = immersive.querySelector('.gallery-prev');
    var nextBtn = immersive.querySelector('.gallery-next');
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // Keyboard nav
    document.addEventListener('keydown', function (e) {
      if (!immersive || immersive.style.display === 'none') return;
      if (gridView && gridView.classList.contains('active')) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Scroll wheel navigation in immersive mode
    var wheelDebounce = null;
    immersive.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (wheelDebounce) return;
      wheelDebounce = setTimeout(function () { wheelDebounce = null; }, 400);
      if (e.deltaY > 0) { next(); } else { prev(); }
    }, { passive: false });

    // Touch swipe
    var touchStartX = 0;
    immersive.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    immersive.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        dx < 0 ? next() : prev();
      }
    }, { passive: true });

    // --- Thumbnail filmstrip ---
    var thumbs = immersive.querySelectorAll('.gallery-thumb');
    var thumbstrip = immersive.querySelector('.gallery-thumbstrip');

    var updateThumbs = function (index) {
      thumbs.forEach(function (t, i) {
        if (i === index) {
          t.classList.add('active');
          // Scroll active thumb into view within the strip
          if (thumbstrip) {
            var scrollLeft = t.offsetLeft - thumbstrip.offsetWidth / 2 + t.offsetWidth / 2;
            thumbstrip.scrollTo({ left: scrollLeft, behavior: 'smooth' });
          }
        } else {
          t.classList.remove('active');
        }
      });
    };

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var idx = parseInt(thumb.getAttribute('data-index'), 10);
        if (!isNaN(idx)) goTo(idx);
      });
    });

    // Patch goTo to also sync thumbstrip
    var _originalGoTo = goTo;
    goTo = function (index) {
      _originalGoTo(index);
      updateThumbs(index);
    };

    // Initialise
    updateInfo(0);
    updateThumbs(0);

    // Stop Lenis on gallery immersive mode — wheel is handled above
    if (lenis) lenis.stop();

    // Fade in the gallery page
    document.body.style.animation = 'none';
    gsap.fromTo(document.body,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }


  /* ============================================
     GALLERY — Mode toggle (Immersive ↔ Grid)
     ============================================ */
  var modeToggle = immersive ? immersive.querySelector('.gallery-mode-toggle') : null;
  var backBtn = gridView ? gridView.querySelector('.gallery-back-btn') : null;

  function switchToGrid() {
    if (!immersive || !gridView) return;
    gsap.to(immersive, {
      opacity: 0, y: -20, duration: 0.25, ease: 'power2.in',
      onComplete: function () { immersive.style.display = 'none'; }
    });
    gridView.style.display = 'block';
    gsap.fromTo(gridView,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', delay: 0.15 }
    );
    gridView.classList.add('active');
    if (lenis) lenis.start();
  }

  function switchToImmersive() {
    if (!immersive || !gridView) return;
    gsap.to(gridView, {
      opacity: 0, y: 20, duration: 0.25, ease: 'power2.in',
      onComplete: function () {
        gridView.style.display = 'none';
        gridView.classList.remove('active');
      }
    });
    immersive.style.display = '';
    gsap.fromTo(immersive,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', delay: 0.15 }
    );
    if (lenis) lenis.stop();
  }

  if (modeToggle) modeToggle.addEventListener('click', switchToGrid);
  if (backBtn) backBtn.addEventListener('click', switchToImmersive);


  /* ============================================
     GALLERY — Grid item click → immersive viewer
     ============================================ */
  if (immersive && gridView && typeof gsap !== 'undefined') {
    var gridItems = document.querySelectorAll('.gallery-grid .gallery-item');
    gridItems.forEach(function (item, index) {
      item.addEventListener('click', function () {
        // Set the correct piece before switching view
        pieces.forEach(function (p, i) {
          if (i === index) {
            p.classList.add('active');
            gsap.set(p, { opacity: 1 });
          } else {
            p.classList.remove('active');
            gsap.set(p, { opacity: 0 });
          }
        });
        currentPiece = index;
        updateInfo(index);
        updateThumbs(index);
        switchToImmersive();
      });
    });
  }


  /* ============================================
     GALLERY — Grid filters (cross-dissolve)
     ============================================ */
  var filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length > 0) {
    var galleryGrid = document.querySelector('.gallery-grid');
    var items = galleryGrid ? galleryGrid.querySelectorAll('.gallery-item') : [];

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.getAttribute('data-filter');

        items.forEach(function (item) {
          item.style.opacity = '0';
          item.style.transition = 'opacity 0.3s ease';
        });

        setTimeout(function () {
          items.forEach(function (item) {
            var show = filter === 'all' || item.getAttribute('data-category') === filter;
            item.style.display = show ? '' : 'none';
            if (show) {
              item.style.opacity = '0';
              setTimeout(function () { item.style.opacity = '1'; }, 20);
            }
          });
        }, 300);
      });
    });
  }


  /* ============================================
     BFCACHE — Restore visibility on back/forward
     ============================================ */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      // Page was restored from bfcache — body may be at opacity 0
      document.body.style.opacity = '1';
      document.body.style.animation = 'none';
      // Reveal any still-hidden elements in the viewport
      document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('visible');
        }
      });
    }
  });


  /* ============================================
     REVEAL SAFETY NET — Catch any elements the
     IntersectionObserver missed after 2.5 s
     ============================================ */
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }, 2500);

})();
