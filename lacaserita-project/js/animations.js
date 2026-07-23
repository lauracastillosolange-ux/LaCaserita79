/**
 * animations.js
 * Sistema de "scroll reveal" (elementos que aparecen al hacer scroll) y
 * el contador animado de la sección de estadísticas.
 * Los estilos de estas animaciones viven en css/animations.css.
 */

/**
 * Activa la clase .show en cada elemento .reveal cuando entra en pantalla.
 * Se puede llamar varias veces de forma segura: solo observa los elementos
 * que todavía no tienen la marca .observed (por ejemplo, después de que el
 * panel admin agrega una tarjeta nueva).
 */
export function initScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.observed)');
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('show');
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el) => {
    el.classList.add('observed');
    io.observe(el);
  });
}

/** Anima los números de la sección de estadísticas (contadores) desde 0 hasta su valor final. */
function animateCounters(scope = document) {
  scope.querySelectorAll('.cont-num').forEach((el) => {
    const target = Number(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = Math.max(1, Math.round(target / 60));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current.toLocaleString('es-PE') + suffix;
    }, 22);
  });
}

/** Dispara animateCounters() la primera vez que la sección de contadores entra en pantalla. */
export function initCounterAnimation(sectionEl) {
  if (!sectionEl) return;
  let done = false;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !done) {
          done = true;
          animateCounters();
        }
      });
    },
    { threshold: 0.4 }
  );
  io.observe(sectionEl);
}
