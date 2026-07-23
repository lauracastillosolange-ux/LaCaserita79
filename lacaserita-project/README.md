# La Caserita — Sitio Web

Sitio web de La Caserita, carnicería familiar en Huancayo, Perú.
Construido en **HTML, CSS y JavaScript puro** (sin frameworks), organizado
en una arquitectura profesional y lista para crecer durante varios años.

---

## 1. Estructura del proyecto

```
/
├── index.html              → página principal (todas las secciones)
├── favicon.ico
├── robots.txt
├── sitemap.xml
│
├── css/
│   ├── styles.css          → estilos base de todos los componentes
│   ├── responsive.css      → media queries (tablet y móvil)
│   └── animations.css      → @keyframes + sistema de scroll-reveal
│
├── js/                      (módulos ES6, import/export)
│   ├── main.js              → orquestador: carga datos, dibuja todo, conecta eventos
│   ├── menu.js               → header + menú móvil
│   ├── slider.js              → carruseles de promociones y testimonios
│   ├── whatsapp.js             → construcción de enlaces/mensajes de WhatsApp
│   ├── animations.js            → scroll-reveal + contadores animados
│   └── utils.js                  → helpers de DOM, fetch de JSON, almacenamiento
│
├── data/
│   ├── products.json        → catálogo de productos
│   ├── promotions.json      → promociones activas ("Infaltables")
│   ├── recipes.json         → recetas
│   └── testimonials.json    → testimonios de clientes
│
├── pages/                   → páginas independientes (SEO / enlaces directos)
│   ├── nosotros.html
│   ├── productos.html
│   ├── promociones.html
│   ├── recetas.html
│   └── contacto.html
│
└── assets/
    ├── images/{hero,products,promotions,recipes,gallery,testimonials,logo}/
    ├── icons/                → favicon.svg, apple-touch-icon.png, etc.
    ├── fonts/                → vacía (las tipografías se cargan de Google Fonts)
    └── videos/               → vacía, lista para usarse a futuro
```

---

## 2. Cómo editar el contenido

**No necesitas tocar el HTML para cambiar productos, promociones, recetas o
testimonios.** Edita directamente:

- `data/products.json` → nombre, categoría, precio, unidad, descripción, foto, etiqueta
- `data/promotions.json` → título, etiqueta, precio anterior/actual, foto
- `data/recipes.json` → título, tiempo, foto
- `data/testimonials.json` → nombre, rol, testimonio

Cada campo `image` apunta a una ruta dentro de `assets/images/...`. Mientras
esas fotos no existan, el sitio muestra automáticamente una foto de stock
temporal (ver punto 4). En `assets/images/README.md` tienes la lista exacta
de qué nombre de archivo va en qué carpeta.

**Alternativa más rápida (sin tocar archivos):** el sitio incluye un panel
administrativo (ver punto 5) donde puedes editar precios, títulos y fotos
directamente desde el navegador.

---

## 3. Cómo probarlo en tu computadora

Como el sitio usa módulos de JavaScript (`type="module"`) y `fetch()` para
leer los JSON, **no puedes abrir `index.html` haciendo doble clic** (los
navegadores bloquean estas funciones bajo el protocolo `file://`). Necesitas
un servidor local, por ejemplo:

```bash
# Con Python (ya viene instalado en Mac/Linux)
python3 -m http.server 8000

# Con Node.js
npx serve .
```

Luego abre `http://localhost:8000/` en tu navegador.

---

## 4. Fotos del negocio (importante)

Este proyecto se generó sin acceso a las fotografías reales de La Caserita.
Todas las rutas de imágenes ya están preparadas (`assets/images/...`), pero
mientras esos archivos no existan, el sitio usa fotos de stock temporales
como respaldo automático (ver `js/utils.js`, función `initImageFallbacks`,
y el campo `imageFallback` en cada JSON).

**Para terminar de personalizar el sitio:** solo sube tus fotos reales con
el nombre exacto indicado en `assets/images/README.md`. No hace falta tocar
ni una línea de código — en cuanto el archivo exista con ese nombre, el
sitio lo usará automáticamente en vez de la foto temporal.

---

## 5. Panel administrativo

Accesible desde el enlace "Panel administrativo" al pie de la página
principal (`index.html`).

- **Usuario:** `SLAURA`
- **Contraseña:** `10C5DAFD`

Permite editar precio/foto/título de productos, promociones y recetas, la
foto de portada, la foto de "Nosotros" y los datos de contacto — todo sin
tocar código.

⚠️ **Advertencia de seguridad, léela con atención:** este login es solo una
barrera básica en el navegador (JavaScript), **no es seguridad real.**
Cualquier persona con conocimientos técnicos que revise el código fuente de
la página puede ver el usuario y la contraseña ahí escritos, y los cambios
que se guardan quedan **en el navegador de quien los hizo** (usando
`window.storage`), no en una base de datos compartida — es decir, si tú
editas un precio desde tu computadora, tus clientes no lo verán reflejado
al visitar el sitio desde la suya. Es una herramienta de demostración /
prototipo, útil para probar cómo se vería el contenido, pero **el catálogo
real y definitivo debe vivir en los archivos JSON de `data/`** (editados por
ti y subidos a GitHub) hasta que se implemente un backend real (ver
sección 7).

Por la misma razón, las fotos subidas desde el panel admin ("Subir foto
desde tu equipo") se guardan codificadas en Base64 dentro del navegador —
es la única forma de "subir una foto" sin un servidor detrás. Para el
catálogo definitivo, sube los archivos reales a `assets/images/` en su
lugar (ver punto 4).

---

## 6. Publicar en Cloudflare Pages con GitHub

1. Sube esta carpeta completa a un repositorio nuevo en GitHub (todo el
   contenido, sin modificar la estructura).
2. En Cloudflare Pages, elige **"Conectar con Git"** y selecciona ese
   repositorio.
3. Configuración de build:
   - **Comando de build:** (déjalo vacío — no hay build, es HTML/CSS/JS puro)
   - **Directorio de salida:** `/` (la raíz del repositorio)
4. Cloudflare desplegará automáticamente `index.html` como página principal,
   y cada carpeta (`css/`, `js/`, `data/`, `assets/`, `pages/`) quedará
   accesible tal como está.
5. Cada vez que hagas `git push` a la rama conectada, Cloudflare Pages
   vuelve a publicar el sitio automáticamente.

Como todas las rutas del proyecto usan `/css/...`, `js/...`, `data/...`,
`assets/...` (rutas absolutas desde la raíz), el sitio funciona igual sin
importar si se accede desde `/`, `/pages/productos.html`, etc.
**Importante:** esto asume que el sitio se sirve desde la raíz del dominio
(`tudominio.com/`). Si en algún momento lo publicas dentro de una subcarpeta
(`tudominio.com/tienda/`), estas rutas tendrían que ajustarse.

---

## 7. Próximos pasos (cuando quieras crecer)

El proyecto está organizado para poder incorporar lo siguiente **sin
rehacer la estructura actual** — pero todas requieren un backend real, que
hoy no existe (este es un sitio 100% estático):

| Necesitas agregar... | Dónde engancharía en esta arquitectura |
|---|---|
| Base de datos | Reemplaza los `fetch('data/*.json')` en `main.js` por llamadas a tu API |
| Panel admin "de verdad" (multiusuario) | Reemplaza el login de `main.js` y el guardado en `window.storage` por autenticación y guardado en tu backend |
| Login de clientes | Nuevo módulo `js/auth.js` + endpoints de tu backend |
| Carrito con checkout real | `cart` ya existe en `main.js`; conecta `buildCartMessage`/el botón "Finalizar" a tu pasarela de pago en vez de (o además de) WhatsApp |
| Pagos en línea | Se integra en el flujo del carrito de `main.js` |
| WhatsApp Business API | Reemplaza los enlaces `wa.me` de `js/whatsapp.js` por llamadas a la API oficial |
| Google Maps interactivo | Ya hay un `<iframe>` de Maps en Contacto; se puede migrar a la API de JavaScript de Google Maps |
| Google Analytics / Meta Pixel | Se agregan como `<script>` en el `<head>` de `index.html` y de cada página en `pages/` |
| Formularios inteligentes | El formulario de contacto ya existe en `index.html`/`pages/contacto.html`; se puede conectar a un servicio de formularios o a tu backend |
| Blog / noticias | Nueva carpeta `pages/blog/`, siguiendo el mismo patrón que las páginas actuales |
| Reservas / pedidos programados | Nuevo módulo JS + sección, reutilizando el patrón de `data/*.json` mientras no haya backend |
| Inventario, ERP, Power BI, API REST | Todo esto vive del lado del backend; el frontend solo necesita apuntar sus `fetch()` a los endpoints correspondientes en lugar de los JSON locales |

## 8. Limitaciones actuales (léelas antes de publicar)

- **Sin backend ni base de datos real** — es un sitio estático. El panel
  admin es una demo local por navegador (ver punto 5).
- **Fotos de stock temporales** — hasta que subas las fotos reales (punto 4).
- **El login del panel admin no es seguridad real** (punto 5).
- El buscador, filtros, calculadora, carrito y WhatsApp son 100%
  funcionales del lado del navegador — no requieren backend para funcionar
  tal como están.
