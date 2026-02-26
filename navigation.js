/* Lillico Art — Navigation */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const links = document.querySelectorAll('.nav-link');

  if (!toggle || !menu) return;

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
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
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
})();
