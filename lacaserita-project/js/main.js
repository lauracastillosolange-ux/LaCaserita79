/**
 * main.js
 * Punto de entrada de la aplicación. Carga los datos (JSON + lo editado desde
 * el panel admin), dibuja cada sección del sitio, y conecta toda la interacción
 * del usuario mediante delegación de eventos (data-action), sin JavaScript
 * inline en el HTML.
 *
 * Módulos que usa:
 *   utils.js      -> helpers de DOM, fetch de JSON, almacenamiento, imágenes de respaldo
 *   whatsapp.js   -> construcción de enlaces/mensajes de WhatsApp
 *   animations.js -> scroll-reveal y contadores animados
 *   menu.js       -> header + menú móvil
 *   slider.js     -> carruseles de promociones y testimonios
 */
import { qs, qsa, fetchJSON, storageGet, storageSet, initImageFallbacks, readFileAsDataURL, generateId } from './utils.js';
import { buildWaLink, buildCartMessage, buildCalcMessage, buildContactFormMessage, buildPromoMessage } from './whatsapp.js';
import { initScrollReveal, initCounterAnimation } from './animations.js';
import { initHeaderScroll, initMobileNav } from './menu.js';
import { createPromoSlider, createTestimonialSlider } from './slider.js';

/* =====================================================================
   CONFIGURACIÓN Y DATOS DE CONTACTO
   Los datos de contacto son editables desde el panel admin y persisten
   en este navegador (window.storage).
===================================================================== */
let CONTACT = {
  phone: '970810924', // sin el +51, solo dígitos
  email: 'lacaserita79@gmail.com',
  address: 'La Ribera, Jr. Los Cardos y Cuzco, Huancayo',
  schedule1: 'Lun – Sáb: 7:00 am – 8:00 pm',
  schedule2: 'Domingo: 7:00 am – 2:00 pm',
};

/* Credenciales del panel administrativo.
   ADVERTENCIA: este login es solo una barrera básica en el navegador, NO es
   seguridad real — cualquier persona que revise el código fuente puede verlas.
   Para protección real se necesita un backend con autenticación de verdad
   (ver README.md, sección "Próximos pasos"). */
const ADMIN_USER = 'SLAURA';
const ADMIN_PASS = '10C5DAFD';

/* =====================================================================
   CONTENIDO ESTÁTICO (rara vez cambia, por eso vive en código y no en JSON)
===================================================================== */
const CATEGORIES = [
  { key: 'res', label: 'Res', image: 'assets/images/products/categoria-res.jpg', imageFallback: 'https://loremflickr.com/600/800/beef,meat?lock=21' },
  { key: 'pollo', label: 'Pollo', image: 'assets/images/products/categoria-pollo.jpg', imageFallback: 'https://loremflickr.com/600/800/chicken,raw?lock=22' },
  { key: 'cerdo', label: 'Cerdo', image: 'assets/images/products/categoria-cerdo.jpg', imageFallback: 'https://loremflickr.com/600/800/pork,meat?lock=23' },
  { key: 'embutidos', label: 'Embutidos', image: 'assets/images/products/categoria-embutidos.jpg', imageFallback: 'https://loremflickr.com/600/800/sausage,charcuterie?lock=24' },
  { key: 'parrillas', label: 'Parrillas', image: 'assets/images/products/categoria-parrillas.jpg', imageFallback: 'https://loremflickr.com/600/800/bbq,grill?lock=25' },
  { key: 'cordero', label: 'Cordero', image: 'assets/images/products/categoria-cordero.jpg', imageFallback: 'https://loremflickr.com/600/800/bbq,grill?lock=25' },
];

const BENEFITS = [
  { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6M12 22v-6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2"/></svg>', title: 'Productos frescos diariamente', text: 'Seleccionamos y despachamos cada corte el mismo día para garantizar frescura real.' },
  { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="7" width="15" height="13" rx="2"/><path d="M16 11h3l3 3v6h-6"/><circle cx="6" cy="20" r="1.5"/><circle cx="17.5" cy="20" r="1.5"/></svg>', title: 'Delivery rápido', text: 'Recibe tu pedido en tu hogar el mismo día, dentro de Huancayo.' },
  { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z"/></svg>', title: 'Calidad garantizada', text: 'Cada corte pasa por una selección cuidadosa antes de llegar a tu mesa.' },
  { icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>', title: 'Atención personalizada', text: 'Te asesoramos en el corte ideal según tu receta y número de comensales.' },
];

/* =====================================================================
   ESTADO DE LA APLICACIÓN
===================================================================== */
let PRODUCTS = [];
let PROMOS = [];
let RECETAS = [];
let TESTIMONIALS = [];
let HERO_IMG = '';
let NOSOTROS_IMG = '';

let cart = [];
let favorites = new Set();
let activeCat = 'all';
let calcPeople = 4;
let editingProductId = null;
let editingPromoId = null;
let editingRecetaId = null;
let uploadedImageData = {}; // guarda temporalmente las fotos subidas desde el equipo, por campo

let promoSlider = null;
let testimonialSlider = null;

/** Genera una imagen temporal de relleno para productos/promos/recetas nuevas sin foto todavía. */
function placeholderImage(keyword, w, h) {
  return `https://loremflickr.com/${w}/${h}/${keyword}?lock=${Date.now() % 1000}`;
}

/* =====================================================================
   RENDER — CATEGORÍAS
===================================================================== */
function renderCategories() {
  const grid = qs('#cat-grid');
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map(
    (c) => `
    <div class="cat-card" data-action="filter-category" data-cat="${c.key}">
      <img src="${c.image}" data-fallback="${c.imageFallback}" alt="${c.label}" loading="lazy">
      <div class="overlay"></div>
      <div class="label">${c.label}</div>
    </div>`
  ).join('');
  initImageFallbacks(grid);
}

/* =====================================================================
   RENDER — BENEFICIOS
===================================================================== */
function renderBenefits() {
  const grid = qs('#benef-grid');
  if (!grid) return;
  grid.innerHTML = BENEFITS.map(
    (b, i) => `
    <div class="benef-card reveal reveal-delay-${i + 1}">
      <div class="benef-icon">${b.icon}</div>
      <h3>${b.title}</h3>
      <p>${b.text}</p>
    </div>`
  ).join('');
  initScrollReveal();
}

/* =====================================================================
   RENDER — PRODUCTOS Y FILTROS
===================================================================== */
function renderCatChips() {
  const chipsEl = qs('#cat-chips');
  if (!chipsEl) return;
  const cats = ['all', ...new Set(PRODUCTS.map((p) => p.category))];
  const labels = { all: 'Todos', res: 'Res', pollo: 'Pollo', cerdo: 'Cerdo', embutidos: 'Embutidos' };
  chipsEl.innerHTML = cats
    .map((c) => `<button class="chip ${activeCat === c ? 'active' : ''}" data-action="set-chip" data-cat="${c}">${labels[c] || c}</button>`)
    .join('');
}

function renderProducts() {
  const grid = qs('#prod-grid');
  if (!grid) return;
  renderCatChips();
  const search = qs('#search-input') ? qs('#search-input').value.toLowerCase() : '';
  const priceRange = qs('#price-filter') ? qs('#price-filter').value : 'all';

  const list = PRODUCTS.filter((p) => {
    const matchCat = activeCat === 'all' || p.category === activeCat;
    const matchSearch = p.name.toLowerCase().includes(search);
    let matchPrice = true;
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      matchPrice = p.price >= min && p.price <= max;
    }
    return matchCat && matchSearch && matchPrice;
  });

  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state">No encontramos productos con esos filtros. Prueba con otra búsqueda.</div>`;
    return;
  }

  grid.innerHTML = list
    .map(
      (p) => `
    <div class="prod-card">
      <div class="prod-img">
        <img src="${p.image}" data-fallback="${p.imageFallback}" alt="${p.name}" loading="lazy">
        ${p.tag ? `<span class="prod-tag">${p.tag}</span>` : ''}
        <button class="prod-fav ${favorites.has(p.id) ? 'active' : ''}" data-action="toggle-fav" data-id="${p.id}" aria-label="Favorito">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B71C1C" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        </button>
      </div>
      <div class="prod-body">
        <h3>${p.name}</h3>
        <p class="desc">${p.description}</p>
        <div class="prod-meta">
          <span class="prod-price">S/ ${p.price.toFixed(2)}</span>
          <span class="prod-weight">${p.unit}</span>
        </div>
        <div class="prod-actions">
          <button class="btn btn-cart btn-cart--full" data-action="add-to-cart" data-id="${p.id}">Agregar al carrito</button>
        </div>
      </div>
    </div>`
    )
    .join('');
  initImageFallbacks(grid);
}

function toggleFavorite(id) {
  favorites.has(id) ? favorites.delete(id) : favorites.add(id);
  renderProducts();
}

function filterByCategory(key) {
  activeCat = key;
  qs('#productos').scrollIntoView({ behavior: 'smooth' });
  renderProducts();
}

/* =====================================================================
   CARRITO DE COMPRAS
===================================================================== */
function addToCart(id) {
  const item = cart.find((c) => c.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  updateCartUI();
  openCartDrawer();
}

function changeCartQty(id, delta) {
  const item = cart.find((c) => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((c) => c.id !== id);
  updateCartUI();
}

function updateCartUI() {
  if (!qs('#cart-count')) return;
  const count = cart.reduce((a, c) => a + c.qty, 0);
  qs('#cart-count').textContent = count;

  const body = qs('#cart-body');
  if (cart.length === 0) {
    body.innerHTML = `<div class="empty-state">Tu carrito está vacío. Explora nuestros productos frescos.</div>`;
  } else {
    body.innerHTML = cart
      .map((c) => {
        const p = PRODUCTS.find((x) => x.id === c.id);
        return `<div class="cart-item">
          <img src="${p.image}" data-fallback="${p.imageFallback}" alt="${p.name}">
          <div class="cart-item-info">
            <h4>${p.name}</h4>
            <span class="cart-item-price">S/ ${p.price.toFixed(2)} · ${p.unit}</span>
            <div class="qty-row">
              <button data-action="qty-decrease" data-id="${p.id}">−</button>
              <span>${c.qty}</span>
              <button data-action="qty-increase" data-id="${p.id}">+</button>
            </div>
          </div>
        </div>`;
      })
      .join('');
    initImageFallbacks(body);
  }

  const total = cart.reduce((a, c) => {
    const p = PRODUCTS.find((x) => x.id === c.id);
    return a + p.price * c.qty;
  }, 0);
  qs('#cart-total').textContent = `S/ ${total.toFixed(2)}`;

  const message = buildCartMessage(cart, PRODUCTS, total);
  qs('#cart-wa-btn').href = buildWaLink(CONTACT.phone, message);
}

function openCartDrawer() {
  qs('#cart-drawer').classList.add('open');
  qs('#overlay-bg').classList.add('open');
}
function closeCartDrawer() {
  qs('#cart-drawer').classList.remove('open');
  qs('#overlay-bg').classList.remove('open');
}

/* =====================================================================
   RENDER — PROMOCIONES Y RECETAS
===================================================================== */
function promoSlideHTML(p) {
  return `
    <div class="promo-slide">
      <img src="${p.image}" data-fallback="${p.imageFallback}" alt="${p.title}" loading="lazy">
      <div class="promo-info">
        <span class="tag">${p.tag}</span>
        <h3>${p.title}</h3>
        <div class="promo-price"><span class="old">S/ ${p.oldPrice.toFixed(2)}</span><span class="new">S/ ${p.price.toFixed(2)}</span></div>
        <a class="btn btn-primary" target="_blank" href="${buildWaLink(CONTACT.phone, buildPromoMessage(p.title))}">Pedir esta promoción</a>
      </div>
    </div>`;
}

function renderRecetas() {
  const grid = qs('#recetas-grid');
  if (!grid) return;
  grid.innerHTML = RECETAS.map(
    (r) => `
    <div class="receta-card">
      <img src="${r.image}" data-fallback="${r.imageFallback}" alt="${r.title}" loading="lazy">
      <div class="receta-overlay">
        <span class="time">⏱ ${r.time}</span>
        <h3>${r.title}</h3>
      </div>
    </div>`
  ).join('');
  initImageFallbacks(grid);
}

function testimonialSlideHTML(t, isActive) {
  return `
    <div class="testi-slide ${isActive ? 'active' : ''}">
      <div class="stars">★★★★★</div>
      <p>"${t.text}"</p>
      <div class="testi-person">
        <div class="testi-avatar">${t.name.charAt(0)}</div>
        <div class="testi-person-info">
          <div class="testi-name">${t.name}</div>
          <div class="testi-role">${t.role}</div>
        </div>
      </div>
    </div>`;
}

/* =====================================================================
   CALCULADORA DE PORCIONES
===================================================================== */
function calcStep(delta) {
  if (!qs('#calc-people')) return;
  calcPeople = Math.max(1, calcPeople + delta);
  qs('#calc-people').textContent = calcPeople;
  calcUpdate();
}

function calcUpdate() {
  const cutSelect = qs('#calc-cut');
  if (!cutSelect) return;
  const perKg = Number(cutSelect.value);
  const kg = (perKg * calcPeople).toFixed(2);
  qs('#calc-kg').textContent = `${kg} kg`;
  const cutLabel = cutSelect.selectedOptions[0].text;
  qs('#calc-wa').href = buildWaLink(CONTACT.phone, buildCalcMessage(kg, cutLabel, calcPeople));
}

/* =====================================================================
   FORMULARIO DE CONTACTO
===================================================================== */
function handleContactSubmit(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input, textarea');
  const [name, phone, , message] = inputs;
  window.open(buildWaLink(CONTACT.phone, buildContactFormMessage(name.value, phone.value, message.value)), '_blank');
}

/* =====================================================================
   INFORMACIÓN DE CONTACTO (footer + botones de WhatsApp del sitio)
===================================================================== */
function renderContactInfo() {
  if (qs('#footer-contact-list')) qs('#footer-contact-list').innerHTML = `<li>${CONTACT.address}</li><li>+51 ${CONTACT.phone}</li><li>${CONTACT.email}</li>`;
  if (qs('#btn-wa-header')) qs('#btn-wa-header').href = buildWaLink(CONTACT.phone);
  if (qs('#fab-wa')) qs('#fab-wa').href = buildWaLink(CONTACT.phone);
  if (qs('#contacto-wa')) qs('#contacto-wa').href = buildWaLink(CONTACT.phone);
}

/* =====================================================================
   PANEL ADMINISTRATIVO
===================================================================== */
function openAdmin() {
  if (sessionStorage.getItem('lc-admin-ok') === '1') {
    showAdminView();
  } else {
    qs('#admin-login').classList.remove('hidden');
    qs('#admin-login-error').textContent = '';
  }
}

function checkAdminLogin() {
  const user = qs('#admin-user').value.trim();
  const pass = qs('#admin-pass').value;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem('lc-admin-ok', '1');
    qs('#admin-login').classList.add('hidden');
    showAdminView();
  } else {
    qs('#admin-login-error').textContent = 'Usuario o contraseña incorrectos.';
  }
}

function showAdminView() {
  qs('#admin-view').classList.add('open');
  renderAdminProductsTable();
  renderAdminPromosTable();
  renderAdminRecetasTable();
  fillHeroForm();
  fillNosotrosForm();
  fillContactForm();
  window.scrollTo(0, 0);
}
function closeAdmin() {
  qs('#admin-view').classList.remove('open');
}

function setAdminTab(tab, tabButton) {
  ['productos', 'promociones', 'recetas', 'portada', 'nosotros', 'contacto'].forEach((t) => {
    qs('#admin-tab-' + t).classList.toggle('hidden', t !== tab);
  });
  qsa('.admin-tab').forEach((b) => b.classList.remove('active'));
  if (tabButton) tabButton.classList.add('active');
}

function showPreview(imgEl, src) {
  imgEl.src = src;
  imgEl.classList.add('is-visible');
}
function hidePreview(imgEl) {
  imgEl.classList.remove('is-visible');
  imgEl.src = '';
}

/** Convierte una foto subida desde el equipo en una imagen usable (base64) y muestra su vista previa. */
async function handleImageUpload(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  const dataUrl = await readFileAsDataURL(file);
  uploadedImageData[fileInput.dataset.storeKey] = dataUrl;
  showPreview(qs('#' + fileInput.dataset.previewTarget), dataUrl);
}

/* ---- Productos ---- */
function toggleProductForm() {
  editingProductId = null;
  qs('#admin-form').classList.toggle('open');
  ['af-name', 'af-price', 'af-weight', 'af-img', 'af-desc'].forEach((id) => (qs('#' + id).value = ''));
  hidePreview(qs('#af-img-preview'));
  uploadedImageData['af-img-data'] = null;
}

function renderAdminProductsTable() {
  qs('#admin-tbody').innerHTML = PRODUCTS.map(
    (p) => `
    <tr>
      <td><img src="${p.image}" data-fallback="${p.imageFallback}" alt="${p.name}"></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>S/ ${p.price.toFixed(2)}</td>
      <td>${p.unit}</td>
      <td class="admin-actions">
        <button data-action="edit-product" data-id="${p.id}" title="Editar">✎</button>
        <button data-action="delete-product" data-id="${p.id}" title="Eliminar">🗑</button>
      </td>
    </tr>`
  ).join('');
  initImageFallbacks(qs('#admin-tbody'));
}

function editProduct(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  editingProductId = id;
  qs('#admin-form').classList.add('open');
  qs('#af-name').value = p.name;
  qs('#af-cat').value = p.category;
  qs('#af-price').value = p.price;
  qs('#af-weight').value = p.unit;
  qs('#af-img').value = p.image;
  qs('#af-desc').value = p.description;
  showPreview(qs('#af-img-preview'), p.image);
  uploadedImageData['af-img-data'] = null;
}

function deleteProduct(id) {
  PRODUCTS = PRODUCTS.filter((p) => p.id !== id);
  renderAdminProductsTable();
  renderProducts();
  storageSet('la-caserita-products', JSON.stringify(PRODUCTS));
}

function saveAdminProduct() {
  const name = qs('#af-name').value.trim();
  if (!name) return;
  const uploaded = uploadedImageData['af-img-data'];
  const data = {
    name,
    category: qs('#af-cat').value,
    price: parseFloat(qs('#af-price').value) || 0,
    unit: qs('#af-weight').value || 'por kg',
    image: uploaded || qs('#af-img').value || placeholderImage('meat', 800, 600),
    imageFallback: uploaded || qs('#af-img').value || placeholderImage('meat', 800, 600),
    description: qs('#af-desc').value || '',
    tag: null,
  };
  if (editingProductId) {
    const idx = PRODUCTS.findIndex((p) => p.id === editingProductId);
    PRODUCTS[idx] = { ...PRODUCTS[idx], ...data };
  } else {
    PRODUCTS.push({ id: generateId(), ...data });
  }
  toggleProductForm();
  renderAdminProductsTable();
  renderProducts();
  storageSet('la-caserita-products', JSON.stringify(PRODUCTS));
}

/* ---- Promociones ---- */
function renderAdminPromosTable() {
  qs('#admin-promos-tbody').innerHTML = PROMOS.map(
    (p) => `
    <tr>
      <td><img src="${p.image}" data-fallback="${p.imageFallback}" alt="${p.title}"></td>
      <td>${p.title}</td>
      <td>S/ ${p.oldPrice.toFixed(2)}</td>
      <td>S/ ${p.price.toFixed(2)}</td>
      <td class="admin-actions">
        <button data-action="edit-promo" data-id="${p.id}" title="Editar">✎</button>
        <button data-action="delete-promo" data-id="${p.id}" title="Eliminar">🗑</button>
      </td>
    </tr>`
  ).join('');
  initImageFallbacks(qs('#admin-promos-tbody'));
}

function editPromo(id) {
  const p = PROMOS.find((x) => x.id === id);
  editingPromoId = id;
  qs('#ap-title').value = p.title;
  qs('#ap-tag').value = p.tag;
  qs('#ap-old').value = p.oldPrice;
  qs('#ap-price').value = p.price;
  qs('#ap-img').value = p.image;
  showPreview(qs('#ap-img-preview'), p.image);
  uploadedImageData['ap-img-data'] = null;
}

function deletePromo(id) {
  PROMOS = PROMOS.filter((p) => p.id !== id);
  renderAdminPromosTable();
  promoSlider.update(PROMOS);
  storageSet('la-caserita-promos', JSON.stringify(PROMOS));
}

function saveAdminPromo() {
  const title = qs('#ap-title').value.trim();
  if (!title) return;
  const uploaded = uploadedImageData['ap-img-data'];
  const image = uploaded || qs('#ap-img').value || placeholderImage('meat', 900, 600);
  const data = {
    title,
    tag: qs('#ap-tag').value || 'Oferta',
    oldPrice: parseFloat(qs('#ap-old').value) || 0,
    price: parseFloat(qs('#ap-price').value) || 0,
    image,
    imageFallback: image,
  };
  if (editingPromoId) {
    const idx = PROMOS.findIndex((p) => p.id === editingPromoId);
    PROMOS[idx] = { ...PROMOS[idx], ...data };
  } else {
    PROMOS.push({ id: generateId(), ...data });
  }
  editingPromoId = null;
  ['ap-title', 'ap-tag', 'ap-old', 'ap-price', 'ap-img'].forEach((id) => (qs('#' + id).value = ''));
  hidePreview(qs('#ap-img-preview'));
  renderAdminPromosTable();
  promoSlider.update(PROMOS);
  storageSet('la-caserita-promos', JSON.stringify(PROMOS));
}

/* ---- Recetas ---- */
function renderAdminRecetasTable() {
  qs('#admin-recetas-tbody').innerHTML = RECETAS.map(
    (r) => `
    <tr>
      <td><img src="${r.image}" data-fallback="${r.imageFallback}" alt="${r.title}"></td>
      <td>${r.title}</td>
      <td>${r.time}</td>
      <td class="admin-actions">
        <button data-action="edit-receta" data-id="${r.id}" title="Editar">✎</button>
        <button data-action="delete-receta" data-id="${r.id}" title="Eliminar">🗑</button>
      </td>
    </tr>`
  ).join('');
  initImageFallbacks(qs('#admin-recetas-tbody'));
}

function editReceta(id) {
  const r = RECETAS.find((x) => x.id === id);
  editingRecetaId = id;
  qs('#ar-title').value = r.title;
  qs('#ar-time').value = r.time;
  qs('#ar-img').value = r.image;
  showPreview(qs('#ar-img-preview'), r.image);
  uploadedImageData['ar-img-data'] = null;
}

function deleteReceta(id) {
  RECETAS = RECETAS.filter((r) => r.id !== id);
  renderAdminRecetasTable();
  renderRecetas();
  storageSet('la-caserita-recetas', JSON.stringify(RECETAS));
}

function saveAdminReceta() {
  const title = qs('#ar-title').value.trim();
  if (!title) return;
  const uploaded = uploadedImageData['ar-img-data'];
  const image = uploaded || qs('#ar-img').value || placeholderImage('food', 600, 500);
  const data = { title, time: qs('#ar-time').value || '30 min', image, imageFallback: image };
  if (editingRecetaId) {
    const idx = RECETAS.findIndex((r) => r.id === editingRecetaId);
    RECETAS[idx] = { ...RECETAS[idx], ...data };
  } else {
    RECETAS.push({ id: generateId(), ...data });
  }
  editingRecetaId = null;
  ['ar-title', 'ar-time', 'ar-img'].forEach((id) => (qs('#' + id).value = ''));
  hidePreview(qs('#ar-img-preview'));
  renderAdminRecetasTable();
  renderRecetas();
  storageSet('la-caserita-recetas', JSON.stringify(RECETAS));
}

/* ---- Portada (foto del Hero) ---- */
function applyHeroImage(url) {
  qs('#inicio').style.backgroundImage =
    `linear-gradient(180deg, rgba(20,12,10,.35) 0%, rgba(15,9,8,.55) 55%, rgba(10,6,5,.88) 100%), url('${url}')`;
}
function fillHeroForm() {
  qs('#ah-img').value = HERO_IMG;
  showPreview(qs('#ah-img-preview'), HERO_IMG);
  uploadedImageData['ah-img-data'] = null;
}
function saveAdminHero() {
  const uploaded = uploadedImageData['ah-img-data'];
  HERO_IMG = uploaded || qs('#ah-img').value || HERO_IMG;
  applyHeroImage(HERO_IMG);
  storageSet('la-caserita-hero-img', HERO_IMG);
}

/* ---- Nosotros (foto) ---- */
function fillNosotrosForm() {
  qs('#an-img').value = NOSOTROS_IMG;
  showPreview(qs('#an-img-preview'), NOSOTROS_IMG);
  uploadedImageData['an-img-data'] = null;
}
function saveAdminNosotros() {
  const uploaded = uploadedImageData['an-img-data'];
  NOSOTROS_IMG = uploaded || qs('#an-img').value || NOSOTROS_IMG;
  qs('#nosotros-img').src = NOSOTROS_IMG;
  storageSet('la-caserita-nosotros-img', NOSOTROS_IMG);
}

/* ---- Datos de contacto ---- */
function fillContactForm() {
  qs('#ac-phone').value = CONTACT.phone;
  qs('#ac-email').value = CONTACT.email;
  qs('#ac-address').value = CONTACT.address;
  qs('#ac-schedule1').value = CONTACT.schedule1;
  qs('#ac-schedule2').value = CONTACT.schedule2;
}
function saveAdminContact() {
  CONTACT = {
    phone: qs('#ac-phone').value.replace(/\D/g, '') || CONTACT.phone,
    email: qs('#ac-email').value || CONTACT.email,
    address: qs('#ac-address').value || CONTACT.address,
    schedule1: qs('#ac-schedule1').value || CONTACT.schedule1,
    schedule2: qs('#ac-schedule2').value || CONTACT.schedule2,
  };
  renderContactInfo();
  updateCartUI();
  storageSet('la-caserita-contact', JSON.stringify(CONTACT));
}

/* =====================================================================
   CARGA DE DATOS (JSON + lo editado previamente desde el panel admin)
===================================================================== */
async function loadData() {
  const [products, promos, recetas, testimonials] = await Promise.all([
    fetchJSON('data/products.json'),
    fetchJSON('data/promotions.json'),
    fetchJSON('data/recipes.json'),
    fetchJSON('data/testimonials.json'),
  ]);
  PRODUCTS = products || [];
  PROMOS = promos || [];
  RECETAS = recetas || [];
  TESTIMONIALS = testimonials || [];
  HERO_IMG = 'assets/images/hero/portada.jpg';
  NOSOTROS_IMG = 'assets/images/gallery/fundadoras.jpg';

  // Aplica cambios guardados previamente desde el panel admin (si existen)
  const savedProducts = await storageGet('la-caserita-products');
  if (savedProducts) PRODUCTS = JSON.parse(savedProducts);

  const savedPromos = await storageGet('la-caserita-promos');
  if (savedPromos) PROMOS = JSON.parse(savedPromos);

  const savedRecetas = await storageGet('la-caserita-recetas');
  if (savedRecetas) RECETAS = JSON.parse(savedRecetas);

  const savedHero = await storageGet('la-caserita-hero-img');
  if (savedHero) HERO_IMG = savedHero;

  const savedNosotros = await storageGet('la-caserita-nosotros-img');
  if (savedNosotros) NOSOTROS_IMG = savedNosotros;

  const savedContact = await storageGet('la-caserita-contact');
  if (savedContact) CONTACT = { ...CONTACT, ...JSON.parse(savedContact) };
}

/* =====================================================================
   DELEGACIÓN DE EVENTOS
   Toda la interacción del sitio pasa por aquí: un único listener de clic
   que revisa el atributo data-action del elemento presionado. Así evitamos
   JavaScript inline (onclick="...") en el HTML.
===================================================================== */
function setupEventDelegation() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const id = el.dataset.id ? Number(el.dataset.id) : null;

    switch (action) {
      case 'open-cart':
        openCartDrawer();
        break;
      case 'close-cart':
        closeCartDrawer();
        break;
      case 'toggle-nav':
        break; // manejado en menu.js
      case 'scroll-top':
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'filter-category':
        filterByCategory(el.dataset.cat);
        break;
      case 'set-chip':
        activeCat = el.dataset.cat;
        renderProducts();
        break;
      case 'toggle-fav':
        toggleFavorite(id);
        break;
      case 'add-to-cart':
        addToCart(id);
        break;
      case 'qty-decrease':
        changeCartQty(id, -1);
        break;
      case 'qty-increase':
        changeCartQty(id, 1);
        break;
      case 'calc-decrease':
        calcStep(-1);
        break;
      case 'calc-increase':
        calcStep(1);
        break;
      case 'open-admin':
        e.preventDefault();
        openAdmin();
        break;
      case 'close-admin':
        closeAdmin();
        break;
      case 'admin-tab':
        setAdminTab(el.dataset.tab, el);
        break;
      case 'admin-login-submit':
        checkAdminLogin();
        break;
      case 'admin-login-cancel':
        qs('#admin-login').classList.add('hidden');
        break;
      case 'toggle-product-form':
        toggleProductForm();
        break;
      case 'save-product':
        saveAdminProduct();
        break;
      case 'edit-product':
        editProduct(id);
        break;
      case 'delete-product':
        deleteProduct(id);
        break;
      case 'save-promo':
        saveAdminPromo();
        break;
      case 'edit-promo':
        editPromo(id);
        break;
      case 'delete-promo':
        deletePromo(id);
        break;
      case 'save-receta':
        saveAdminReceta();
        break;
      case 'edit-receta':
        editReceta(id);
        break;
      case 'delete-receta':
        deleteReceta(id);
        break;
      case 'save-hero':
        saveAdminHero();
        break;
      case 'save-nosotros':
        saveAdminNosotros();
        break;
      case 'save-contact':
        saveAdminContact();
        break;
      default:
        break;
    }
  });

  // Cerrar el carrito al hacer clic en el fondo oscuro
  if (qs('#overlay-bg')) qs('#overlay-bg').addEventListener('click', closeCartDrawer);

  // Buscador y filtro de precio
  qsa('[data-action="filter-input"]').forEach((el) => {
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', renderProducts);
  });

  // Selector de corte de la calculadora
  if (qs('#calc-cut')) qs('#calc-cut').addEventListener('change', calcUpdate);

  // Formulario de contacto
  if (qs('[data-form="contact"]')) qs('[data-form="contact"]').addEventListener('submit', handleContactSubmit);

  // Subida de fotos (panel admin)
  qsa('input[type="file"][data-preview-target]').forEach((input) => {
    input.addEventListener('change', () => handleImageUpload(input));
  });
}

/* =====================================================================
   INICIO
===================================================================== */
async function init() {
  await loadData();

  if (qs('#inicio')) applyHeroImage(HERO_IMG);
  if (qs('#nosotros-img')) qs('#nosotros-img').src = NOSOTROS_IMG;
  if (qs('#btn-wa-header')) qs('#btn-wa-header').classList.remove('hidden');

  renderCategories();
  renderBenefits();
  renderProducts();
  renderRecetas();
  renderContactInfo();
  calcUpdate();
  updateCartUI();

  if (qs('#promo-track') && qs('#promo-dots')) {
    promoSlider = createPromoSlider({ trackEl: qs('#promo-track'), dotsEl: qs('#promo-dots'), renderSlide: promoSlideHTML });
    promoSlider.update(PROMOS);
  }

  if (qs('#testi-slides') && qs('#testi-dots')) {
    testimonialSlider = createTestimonialSlider({ slidesEl: qs('#testi-slides'), dotsEl: qs('#testi-dots'), renderSlide: testimonialSlideHTML });
    testimonialSlider.update(TESTIMONIALS);
  }

  initHeaderScroll();
  initMobileNav();
  initScrollReveal();
  if (qs('#contadores')) initCounterAnimation(qs('#contadores'));
  initImageFallbacks();
  setupEventDelegation();
}

init();
