/**
 * menu.js
 * Comportamiento del header: encogerse al hacer scroll, mostrar/ocultar el
 * botón "volver arriba", y el menú hamburguesa en móvil.
 */

/** Encoge el header y muestra el botón "volver arriba" según la posición del scroll. */
export function initHeaderScroll() {
  const header = document.getElementById('site-header');
  const fabTop = document.getElementById('fab-top');
  if (!header) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 40;
    header.classList.toggle('scrolled', scrolled);
    document.body.classList.toggle('top-hero-active', window.scrollY < 80);
    if (fabTop) fabTop.classList.toggle('show', window.scrollY > 500);
  });
}

/** Abre/cierra el menú de navegación en móvil y lo cierra al elegir una sección. */
export function initMobileNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  document.querySelectorAll('[data-action="toggle-nav"]').forEach((btn) => {
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}
