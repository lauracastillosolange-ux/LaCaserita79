/**
 * slider.js
 * Carruseles reutilizables del sitio:
 *   - createPromoSlider(): franja horizontal con flechas (sección Promociones)
 *   - createTestimonialSlider(): tarjetas con fundido automático (sección Testimonios)
 *
 * Ambos reciben sus datos mediante update(items) en lugar de leerlos directamente,
 * para poder redibujarse cuando el panel administrativo edita las promociones.
 */
import { initImageFallbacks } from './utils.js';

function renderDots(dotsEl, count, activeIndex, action) {
  dotsEl.innerHTML = Array.from(
    { length: count },
    (_, i) => `<button data-action="${action}" data-index="${i}" class="${i === activeIndex ? 'active' : ''}"></button>`
  ).join('');
}

/**
 * @param {Object} options
 * @param {HTMLElement} options.trackEl - contenedor que se desplaza horizontalmente
 * @param {HTMLElement} options.dotsEl - contenedor de los puntos indicadores
 * @param {Function} options.renderSlide - (item) => stringHTML de una diapositiva
 * @param {number} [options.intervalMs] - tiempo entre rotaciones automáticas
 */
export function createPromoSlider({ trackEl, dotsEl, renderSlide, intervalMs = 6000 }) {
  let items = [];
  let index = 0;
  let timer = null;

  function paint() {
    trackEl.innerHTML = items.map(renderSlide).join('');
    initImageFallbacks(trackEl);
    renderDots(dotsEl, items.length, index, 'promo-goto');
    trackEl.style.transform = `translateX(-${index * 100}%)`;
  }

  function goTo(i) {
    if (!items.length) return;
    index = ((i % items.length) + items.length) % items.length;
    trackEl.style.transform = `translateX(-${index * 100}%)`;
    Array.from(dotsEl.children).forEach((dot, idx) => dot.classList.toggle('active', idx === index));
  }

  function move(direction) {
    goTo(index + direction);
  }

  function restartAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => move(1), intervalMs);
  }

  /** Reemplaza los datos mostrados (llamado al cargar la página y tras editar promociones en el admin). */
  function update(newItems) {
    items = newItems;
    index = 0;
    paint();
    restartAutoplay();
  }

  document.querySelectorAll('[data-action="promo-prev"]').forEach((btn) => btn.addEventListener('click', () => move(-1)));
  document.querySelectorAll('[data-action="promo-next"]').forEach((btn) => btn.addEventListener('click', () => move(1)));
  dotsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="promo-goto"]');
    if (btn) goTo(Number(btn.dataset.index));
  });

  return { update };
}

/**
 * @param {Object} options
 * @param {HTMLElement} options.slidesEl - contenedor de las diapositivas
 * @param {HTMLElement} options.dotsEl - contenedor de los puntos indicadores
 * @param {Function} options.renderSlide - (item, isActive) => stringHTML de una diapositiva
 * @param {number} [options.intervalMs]
 */
export function createTestimonialSlider({ slidesEl, dotsEl, renderSlide, intervalMs = 5500 }) {
  let items = [];
  let index = 0;
  let timer = null;

  function paint() {
    slidesEl.innerHTML = items.map((item, i) => renderSlide(item, i === index)).join('');
    renderDots(dotsEl, items.length, index, 'testi-goto');
  }

  function goTo(i) {
    if (!items.length) return;
    index = ((i % items.length) + items.length) % items.length;
    paint();
  }

  function restartAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), intervalMs);
  }

  function update(newItems) {
    items = newItems;
    index = 0;
    paint();
    restartAutoplay();
  }

  dotsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="testi-goto"]');
    if (btn) goTo(Number(btn.dataset.index));
  });

  return { update };
}
