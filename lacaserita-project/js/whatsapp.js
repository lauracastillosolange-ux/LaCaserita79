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

  let message = "*Hola, La Caserita!*\n\n";
  message += "Quiero realizar el siguiente pedido:\n\n";

  let hasPedido = false;

  cartItems.forEach((c) => {
    const p = products.find((x) => x.id === c.id);

    const subtotal = (p.price * c.qty).toFixed(2);
    const disponibilidad = p.tag || "Disponible hoy";

    if (disponibilidad === "Pedido") {
      hasPedido = true;
    }

    message += `• ${c.qty.toFixed(1)} kg ${p.name} — S/ ${subtotal} - ${disponibilidad}\n`;
  });

  message += `\n *Total*: S/ ${total.toFixed(2)}\n\n`;

  // Leer la selección actual del usuario
  const modalidadEntrega = document.querySelector('input[name="delivery"]:checked')?.value || "Recojo en tienda";

  message += "*Modalidad de entrega*:\n";
  message += `• ${modalidadEntrega}\n\n`;

  if (hasPedido) {
    message += "Los productos marcados como *'Pedido'* se entregan con un mínimo de 24 horas de anticipación.\n\n";
  }

  message += "*Muchas gracias.*";

  return message;
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
