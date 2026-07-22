/**
 * whatsapp.js
 * Todo lo relacionado a construir enlaces y mensajes de WhatsApp.
 * No guarda estado propio: recibe los datos que necesita como parámetros,
 * así se puede probar y reutilizar desde cualquier otro módulo.
 */

/** Construye un enlace wa.me a partir del número de celular (sin +51) y un mensaje. */
export function buildWaLink(phoneDigits, text = '') {
  return `https://wa.me/51${phoneDigits}?text=${encodeURIComponent(text)}`;
}

/**
 * Mensaje del carrito de compras: incluye el listado de productos entre comillas
 * y el detalle de precio de cada uno, tal como lo pidió el negocio.
 */
export function buildCartMessage(cartItems, products, total) {
  if (!cartItems.length) return '';
  const itemsQtyName = cartItems
    .map((c) => {
      const p = products.find((x) => x.id === c.id);
      return `${c.qty}x ${p.name}`;
    })
    .join(', ');
  const itemsDetail = cartItems
    .map((c) => {
      const p = products.find((x) => x.id === c.id);
      return `${c.qty}x ${p.name} (S/ ${(p.price * c.qty).toFixed(2)})`;
    })
    .join(', ');
  return `Buen día! Quiero realizar un pedido de "${itemsQtyName}". Detalle de precios: ${itemsDetail}. Total: S/ ${total.toFixed(2)}`;
}

/** Mensaje para la calculadora de porciones. */
export function buildCalcMessage(kg, cutLabel, people) {
  return `Quiero pedir ${kg} kg de ${cutLabel} para ${people} personas`;
}

/** Mensaje generado a partir del formulario de contacto. */
export function buildContactFormMessage(name, phone, message) {
  return `Soy ${name} (${phone}). ${message}`;
}

/** Mensaje para pedir una promoción específica. */
export function buildPromoMessage(title) {
  return `Quiero el ${title}`;
}
