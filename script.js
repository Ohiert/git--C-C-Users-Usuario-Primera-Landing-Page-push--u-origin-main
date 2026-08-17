/* Ecomoney — interacciones mínimas */
(function () {
  'use strict';

  /* ── Menú móvil ── */
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');

  function closeMenu() {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── Sombra del nav al hacer scroll ── */
  var nav = document.getElementById('nav');

  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Aparición progresiva de secciones ── */
  var revealables = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    revealables.forEach(function (el, i) {
      // Escalonado suave entre elementos consecutivos
      el.style.transitionDelay = (Math.min(i % 6, 5) * 60) + 'ms';
      observer.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Formulario de suscripción ── */
  var form  = document.getElementById('form');
  var input = document.getElementById('email');
  var btn   = document.getElementById('formBtn');
  var msg   = document.getElementById('formMsg');
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Mientras el action siga con el marcador, el formulario responde en local
  // sin enviar nada: así la web nunca muestra un error al visitante.
  var endpoint = form.getAttribute('action') || '';
  var isLive   = endpoint.indexOf('formspree.io/f/') !== -1 &&
                 endpoint.indexOf('TU-ID-DE-FORMSPREE') === -1;

  function setBusy(busy) {
    btn.disabled = busy;
    btn.textContent = busy ? 'Enviando…' : 'Enviar';
  }

  function succeed(value) {
    msg.dataset.state = 'ok';
    msg.textContent = '¡Listo! Te escribimos a ' + value + '.';
    form.reset();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var value = input.value.trim();

    if (!EMAIL.test(value)) {
      msg.textContent = 'Introduce un correo válido.';
      msg.dataset.state = 'error';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    input.removeAttribute('aria-invalid');

    if (!isLive) {
      succeed(value);
      return;
    }

    // Navegadores sin fetch: envío clásico, sale de la página.
    if (!window.fetch) {
      form.submit();
      return;
    }

    setBusy(true);
    msg.dataset.state = 'ok';
    msg.textContent = 'Enviando…';

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      succeed(value);
    }).catch(function () {
      msg.dataset.state = 'error';
      msg.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.';
    }).then(function () {
      setBusy(false);
    });
  });

  input.addEventListener('input', function () {
    if (!msg.textContent) return;
    msg.textContent = '';
    input.removeAttribute('aria-invalid');
  });

  /* ── Año del footer ── */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
