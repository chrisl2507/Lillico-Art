/* Lillico Art — Navigation, Scroll, Reveal, Page Transitions & Gallery */
(function () {
  /* ---- Mobile Navigation ---- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-menu');
  var links = document.querySelectorAll('.nav-link');

  if (toggle && menu) {
    function openNav() {
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');
      document.body.classList.add('nav-open');
    }

    function closeNav() {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeNav();
      }
    });

    links.forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 768) {
          closeNav();
        }
      });
    });
  }

  /* ---- Nav scroll behaviour ---- */
  var nav = document.querySelector('nav');
  var hero = document.querySelector('.hero') || document.querySelector('.gallery-statement');

  if (nav && hero && !document.body.classList.contains('page-interior')) {
    var scrollThreshold = 80;

    function onScroll() {
      if (window.scrollY > scrollThreshold) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Intersection Observer for reveal animations ---- */
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

  /* ---- Page Transitions — fade to black ---- */
  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    link.addEventListener('click', function (e) {
      e.preventDefault();
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.4s ease';
      setTimeout(function () { window.location.href = href; }, 400);
    });
  });

  /* ---- Gallery Lightbox ---- */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lightboxImg = lightbox.querySelector('.lightbox-image-container img');
    var lightboxTitle = lightbox.querySelector('.lightbox-title');
    var lightboxMeta = lightbox.querySelector('.lightbox-meta');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    var galleryItems = document.querySelectorAll('.gallery-item');
    var currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      var item = galleryItems[index];
      if (!item) return;
      var img = item.querySelector('img');
      var title = item.querySelector('.gallery-item-title');
      var category = item.querySelector('.gallery-item-category');

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      if (lightboxTitle && title) lightboxTitle.textContent = title.textContent;
      if (lightboxMeta && category) lightboxMeta.textContent = category.textContent;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function getVisibleItems() {
      var visible = [];
      galleryItems.forEach(function (item, i) {
        if (item.style.display !== 'none') visible.push(i);
      });
      return visible;
    }

    function showPrev() {
      var visible = getVisibleItems();
      if (visible.length === 0) return;
      var pos = visible.indexOf(currentIndex);
      var prevPos = (pos - 1 + visible.length) % visible.length;
      openLightbox(visible[prevPos]);
    }

    function showNext() {
      var visible = getVisibleItems();
      if (visible.length === 0) return;
      var pos = visible.indexOf(currentIndex);
      var nextPos = (pos + 1) % visible.length;
      openLightbox(visible[nextPos]);
    }

    galleryItems.forEach(function (item, index) {
      item.addEventListener('click', function () {
        openLightbox(index);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }

  /* ---- Gallery Filters — cross-dissolve transition ---- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length > 0) {
    var galleryGrid = document.querySelector('.gallery-grid');
    var items = galleryGrid ? galleryGrid.querySelectorAll('.gallery-item') : [];

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.getAttribute('data-filter');

        // Fade everything out first
        items.forEach(function (item) {
          item.style.opacity = '0';
          item.style.transition = 'opacity 0.3s ease';
        });

        // After fade-out, hide/show and fade back in
        setTimeout(function () {
          items.forEach(function (item) {
            var show = filter === 'all' || item.getAttribute('data-category') === filter;
            item.style.display = show ? '' : 'none';
            if (show) {
              item.style.opacity = '0';
              setTimeout(function () {
                item.style.opacity = '1';
              }, 20);
            }
          });
        }, 300);
      });
    });
  }
})();
