/**
 * utils.js
 * Funciones auxiliares genéricas usadas por el resto de módulos:
 * atajos de DOM, formato de moneda, carga de JSON, envoltorio seguro
 * para window.storage, y el sistema de imagen de respaldo.
 */

/** Atajo para querySelector */
export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

/** Atajo para querySelectorAll que devuelve un array real */
export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/** Formatea un número como moneda peruana, ej: formatCurrency(38.9) -> "S/ 38.90" */
export function formatCurrency(amount) {
  return `S/ ${Number(amount).toFixed(2)}`;
}

/**
 * Carga un archivo JSON (usado para leer data/products.json, promotions.json, etc.)
 * Devuelve null y registra el error en consola si algo falla, en vez de romper la página.
 */
export async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`No se pudo cargar ${path} (HTTP ${res.status})`);
    return await res.json();
  } catch (err) {
    console.error('[La Caserita] Error cargando datos:', err);
    return null;
  }
}

/**
 * Envoltorio seguro sobre window.storage (memoria persistente del panel administrativo).
 * Si el navegador no soporta esta función, la app sigue funcionando con los datos por defecto.
 */
export async function storageGet(key) {
  try {
    if (!window.storage) return null;
    const result = await window.storage.get(key, false);
    return result ? result.value : null;
  } catch {
    return null;
  }
}

export async function storageSet(key, value) {
  try {
    if (!window.storage) return false;
    await window.storage.set(key, value, false);
    return true;
  } catch (err) {
    console.warn('[La Caserita] No se pudo guardar en el almacenamiento local:', err);
    return false;
  }
}

/**
 * Sistema de imagen de respaldo.
 * Cada <img> con un atributo data-fallback apunta primero a una foto local en
 * assets/images/... Si esa foto todavía no existe (porque el negocio no ha subido
 * sus fotos reales), se reemplaza automáticamente por una foto temporal de stock.
 *
 * TEMPORAL: una vez que subas las fotos reales del negocio a assets/images/,
 * puedes quitar los atributos data-fallback del HTML y de este archivo de datos;
 * dejan de ser necesarios.
 */
export function initImageFallbacks(scope = document) {
  qsa('img[data-fallback]', scope).forEach((img) => {
    img.addEventListener(
      'error',
      () => {
        if (img.dataset.fallbackUsed) return;
        img.dataset.fallbackUsed = 'true';
        img.src = img.dataset.fallback;
      },
      { once: true }
    );
  });
}

/** Convierte un archivo (ej. una foto subida desde el equipo) en un data URL utilizable como src de imagen. */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Genera un identificador simple y único, usado al crear productos/promos/recetas nuevas desde el panel admin. */
export function generateId() {
  return Date.now();
}
