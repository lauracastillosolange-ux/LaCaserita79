# Guía de fotos — La Caserita

Este proyecto **no incluye fotografías reales del negocio** (no fue posible
descargarlas ni generarlas en el entorno donde se construyó el proyecto).
Mientras tanto, el sitio muestra fotos de stock temporales automáticamente
(ver `js/utils.js`, función `initImageFallbacks`).

Para que el sitio se vea 100% con tus fotos reales, solo debes **subir cada
archivo con el nombre exacto indicado abajo**, dentro de la carpeta que
corresponde. No hace falta tocar el HTML, el CSS ni el JavaScript — los
archivos de datos (`data/*.json`) ya apuntan a estas rutas.

## assets/images/hero/
- `portada.jpg` — foto grande de fondo de la primera sección (también editable
  desde el panel administrativo, pestaña "Portada").

## assets/images/gallery/
- `fundadoras.jpg` — foto de Techi y Celia en la sección "Nosotros" (también
  editable desde el panel administrativo, pestaña "Nosotros").

## assets/images/products/
- `lomo-fino.jpg`
- `asado-de-tira.jpg`
- `bistec-de-res.jpg`
- `carne-molida.jpg`
- `chuleta-de-cerdo.jpg`
- `pechuga-de-pollo.jpg`
- `pierna-de-pollo.jpg`
- `costilla-de-cerdo.jpg`
- `pollo-entero.jpg`
- `chorizo-parrillero.jpg`
- `jamon-artesanal.jpg`
- `tocino-ahumado.jpg`
- `salchicha-huachana.jpg`
- `categoria-res.jpg`, `categoria-pollo.jpg`, `categoria-cerdo.jpg`,
  `categoria-embutidos.jpg`, `categoria-parrillas.jpg` — fotos de las 5
  tarjetas grandes de la sección "Nuestro catálogo".

Recomendado: 800×600px, formato JPG, menos de 300KB cada una.

## assets/images/promotions/
- `combo-parrillero.jpg`
- `combo-familiar.jpg`
- `pack-economico.jpg`

Recomendado: 900×600px.

## assets/images/recipes/
- `lomo-saltado.jpg`
- `arroz-con-pollo.jpg`
- `seco-de-carne.jpg`
- `estofado.jpg`
- `parrilla-mixta.jpg`
- `adobo.jpg`

Recomendado: 600×500px.

## assets/images/logo/
- `logo.png` y `og-image.jpg` ya existen (generados automáticamente como
  marcador temporal). Reemplázalos cuando tengas tu logo definitivo.

## assets/images/testimonials/
Vacía por ahora — los testimonios actuales solo muestran la inicial del
nombre del cliente. Si más adelante quieres mostrar fotos reales de
clientes, esta es la carpeta indicada.

---

**Nota sobre el panel administrativo:** las fotos de Productos, Promociones
y Recetas también se pueden reemplazar directamente desde el panel admin
(subiendo una foto desde tu equipo). Esas fotos se guardan codificadas
dentro del navegador (no como archivos en esta carpeta), así que son
prácticas para pruebas rápidas, pero **para el catálogo definitivo es mejor
subir los archivos aquí** — así el sitio carga más rápido y las fotos no
dependen del navegador de un usuario. Más detalle en el README.md principal.
