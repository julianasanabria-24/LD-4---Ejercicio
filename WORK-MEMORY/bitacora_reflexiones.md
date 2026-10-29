# Bitácora de reflexiones — Agente de Talleres

Una entrada breve por sesión de clase: qué se aprendió o qué costó más, escrita al cierre de cada
sesión. **No es la bitácora del curso** (esa la lleva el profesor, en `bitacora_sesiones_curso.csv`,
fuera de esta carpeta) — esta es la reflexión personal del estudiante sobre su propio proceso.

## 2026-08-20

Hoy entendí la diferencia entre declarar una variable con `let` y usarla sin declararla — el
`ReferenceError` dejó de sentirse aleatorio en cuanto vi que siempre es la misma causa: un nombre
que nunca definí.

## 2026-08-22

Me costó organizar las referencias visuales por tema en vez de por sitio de origen. Al principio
quería agruparlas por dónde las encontré, pero agruparlas por lo que inspiran (color, tipografía,
layout) tiene más sentido para el proyecto.


## 2026-09-18

**Cambios**
- Separé los objetos de `index.js` a `data.js` y ajusté los enlaces: `index.html` ahora carga `data.js` antes de `index.js`.
- Creé `gestion.html` y `gestion.js` con un sidebar a la izquierda y las operaciones CRUD: mostrar todos, crear, consultar, actualizar y eliminar.
- Desactivé (comenté) el enlace "Ir a gestión" en `index.html`.

**Hallazgos**
- Los archivos aparecieron vacíos al principio porque no estaban guardados en disco; hay que guardar con Ctrl+S antes de pedir cambios.
- Un array modificado en memoria en `gestion.html` no se ve en `index.html`, porque cada página carga `data.js` por separado. Se resolvió guardando los álbumes en `localStorage`.
- Con `let albums`, la variable no queda como propiedad de `window`; importa al probar desde fuera del script.

**Errores**
- Un comando con heredoc falló por comillas mal cerradas y no aplicó ningún cambio; lo rehíce con otra herramienta de escritura.
- Se intentó usar Python para editar archivos, pero no está instalado; se usó Node.


## 2026-09-24

**Cambios**
- Agregué un `id` propio a cada álbum de `data.js` y una variable `siguienteId` para los álbumes nuevos; al actualizar, el álbum conserva su `id`.
- Creé una ventana de login en `gestion.html`, con la validación en una función `verificarLogin()` dentro de `login.js` y los datos en `credenciales.js`.
- Encapsulé `data.js` y `gestion.js` en una IIFE para que el CRUD no se pueda usar desde la consola sin login; `index.js` lee los datos con `obtenerAlbums()`.
- Refactoricé el renderizado de `index.js` en `renderizarHeroes(listaObjetos)`, que limpia la galería antes de pintar.
- Agregué la propiedad `estilo` a los álbumes y filtros combinables por año y estilo encima de las tarjetas.

**Hallazgos**
- Un login hecho solo en el navegador oculta la interfaz, pero no protege los datos: desde la consola pude crear y borrar álbumes con `albums.push()`, `albums.pop()` y `guardarAlbums()`.
- Las variables declaradas dentro de una función (closure) no se alcanzan desde la consola; `const` impide reemplazar funciones como `verificarLogin`.
- Si `siguienteId` se escribe fijo (por ejemplo `11`), al recargar la página se repiten ids; por eso se calcula con el id más alto + 1.
- Al volver a pintar las tarjetas se pierden sus eventos de clic; la delegación de eventos (`e.target.closest(".card")` en la galería) lo resuelve.
- `hidden` deja de funcionar si el CSS le pone `display: flex` al mismo elemento; hace falta una regla `[hidden] { display: none; }`.
- La seguridad real necesita un servidor: `localStorage.setItem()` desde la consola y la lectura de `credenciales.js` no se pueden bloquear en el navegador.

**Errores**
- `SyntaxError` en `albums.pop({}`: faltaban el `)` y la `}` del `for`, y `pop()` no recibe argumentos (queda en `registro_errores.csv`).
- Chrome bloquea pegar código en la consola la primera vez; hay que escribir `allow pasting`.


## 2026-09-25

**Cambios**
- Cambié el filtro de año de `index.html` por un slider vertical (`writing-mode: vertical-lr`) que filtra en vivo con cada movimiento, en vez de botones por año; después lo volví flotante (`position: fixed`) y centrado en la ventana.
- Centré el filtro de estilo con `justify-content: center`.
- Armé el esqueleto de una página nueva en `filter-map/` (`filter-map.html` + `index.js`).
- Creé `game.html` y `game.js`: un login con Nombre, Alias, Email y Contraseña.
  - La contraseña se valida con una regex (mínimo 6 caracteres, 6 números, 1 mayúscula, 1 especial) y un checklist debajo del campo se va marcando en vivo mientras escribo.
  - El email se valida con otra regex, también en vivo.
  - Los usuarios quedan guardados en `localStorage` (`usuariosGame`): si el email ya existe y la contraseña coincide, entro; si no coincide, error; si el email no existe, un `confirm()` pregunta si quiero registrarme.
  - Agregué una pestaña "Usuarios registrados" en el sidebar de `gestion.html` que lista esos usuarios (con la contraseña visible, a propósito, para este ejercicio).
- Analicé el ejemplo `cardgame` (juego de memoria con flip cards) y lo adapté dentro de `game.html`: al loguearme se oculta el login y arranca una partida de memoria con 6 álbumes al azar de `obtenerAlbums()`, reskineada con los colores morados del sitio en vez del tema original.
- Hice que cada usuario tenga un `id` autogenerado y un array `intentos`; cada partida ganada le agrega un intento con su propio id, fecha, número de intentos y tiempo.

**Hallazgos**
- Los lookaheads `(?=...)` en una regex permiten pedir varias condiciones independientes (largo, cantidad de mayúsculas, cantidad de caracteres especiales) sin importar el orden en que se escriban.
- `position: fixed` saca un elemento del flujo del documento; el contenedor que lo envolvía ya no necesita reglas flex para "hacerle espacio".
- `writing-mode: vertical-lr` + `direction: rtl` es la forma moderna de poner un `<input type="range">` en vertical, sin depender de `-webkit-appearance` distinto por navegador.
- Como `obtenerAlbums()` ya lee de `localStorage` si hay álbumes editados desde `gestion.html`, el juego de memoria queda sincronizado automáticamente con esos cambios, sin tocar nada extra.
- El mismo patrón de "si falta el id, se lo asigno al leer" que usé para los álbumes sirve para cualquier dato en `localStorage` que cambia de forma con el tiempo (usuarios, intentos): los registros viejos no se rompen.


## 2026-10-15

**Cambios**
- Empecé `supabase1/`, mi primer proyecto conectado a una base de datos real en Supabase, en vez de `localStorage`.
- Armé la estructura en 4 scripts que se cargan en orden: la librería de Supabase (CDN) → `supabaseClient.js` (crea el cliente) → `datos.js` (todas las consultas CRUD en un objeto `Datos`) → `gestion.js` (formulario, tabla y eventos).
- Conecté `supabaseClient.js` a mi proyecto de Supabase con la URL y la anon key, y agregué el alias `db` para los ejercicios.
- Creé `prueba.html` y `prueba.js`: un botón "Traer productos" y un `div` de resultado, para practicar los Pasos 2–4 de la guía.

**Hallazgos**
- El orden de los `<script>` importa: si `supabaseClient.js` se carga antes que el CDN, `supabase.createClient` todavía no existe.
- Separar "hablar con la base de datos" (`datos.js`) de "pintar la página" (`gestion.js`) deja cambiar uno sin tocar el otro.
- La anon key está pensada para ir en el navegador; lo que protege los datos son las políticas RLS de cada tabla, no esconder la clave. Igual, en el repo público la subí con un placeholder.

**Errores**
- Pegué la URL con `/rest/v1/` al final; la librería agrega esa ruta sola, así que quedaba duplicada. La URL correcta es solo `https://<proyecto>.supabase.co`.
- La guía usa `db` y mi archivo creaba `supabaseClient`; se resolvió con `const db = supabaseClient;`.


## 2026-10-23

**Cambios**
- En `prueba2.js` agregué listas para descripción, precio, disponible, categorías, unidades e imagen de cada producto.
- Creé en `prueba2.html` un formulario para agregar productos con los mismos campos que el objeto `productoPrueba`; al enviarlo se arma el objeto con `FormData` y se inserta en Supabase con `agregarProducto()`.
- Después de agregar, el formulario se limpia y las listas se recargan solas con `document.getElementById("btn-traer").click()`.
- Le di estilos al formulario en tonos rosados, con los colores guardados en variables CSS (`:root`).
- Agregué un buscador de un solo campo: si escribo un número busca por ID (`buscarProductoPorId`); si escribo texto busca por nombre (`buscarProductosPorNombre`) y por categoría a la vez, y muestra los resultados como tarjetas.

**Hallazgos**
- Si la propiedad no coincide exactamente con el nombre de la columna, JavaScript devuelve `undefined`, sin error. Mis columnas eran `description` (en inglés) y `categorias` (en plural); `console.log(data)` muestra los nombres reales.
- En JavaScript `90.000` vale `90`: el punto es decimal.
- Todo lo que viene de un input llega como texto; hay que convertirlo con `Number()`. Un checkbox sin marcar no aparece en `FormData` (da `null`).
- Si sale "agregado con ID", la fila sí se creó; la página no la mostraba porque las listas no se recargan solas.
- Supabase no puede filtrar dentro de una columna tipo `json` (ni `ilike` ni `contains`), así que la búsqueda por categoría se hace en JavaScript con `filter` + `some`. Con `normalize("NFD")` se quitan las tildes para que "tecnologia" encuentre "tecnología".

**Errores**
- `undefined` en las listas por usar `producto.descripciones` y `producto.precios` en vez de los nombres reales de las columnas.
- El botón de agregar buscaba el id `btn-agregar-obj`, pero en el HTML era `btn2`, y le pasaba `producto`, una variable que no existía.
- El listener del botón de agregar y las funciones de búsqueda quedaron pegados dentro de otro `addEventListener`; las saqué afuera.
- Las funciones de búsqueda consultaban la tabla `productos_practica`, que no existe; la mía es `products_practice`.


## 2026-10-29

**Cambios**
- Creé `modificarProducto(id, cambios)` con `.update().eq('id', id).select()` y reutilicé el mismo formulario para editar: un `<input type="hidden" name="id">` decide si el submit agrega o modifica, y un botón "Cancelar" vuelve al modo agregar.
- Agregué `eliminarProducto(id)` con `.delete().eq('id', id)`, con un `confirm()` antes de borrar.
- Pasé los resultados de la búsqueda a un recuadro "Productos" al lado del formulario, primero como tarjetas y después como tabla, con los botones Editar y Eliminar en cada fila. Al abrir la página muestra todos los productos; con el buscador vacío vuelven a salir todos.
- Moví "Traer productos" a una sección "Catálogo" dentro del formulario.
- Organicé el formulario en 3 columnas con `grid-template-areas` y en 3 grupos numerados (Información básica, Precio e inventario, Detalles).
- Agregué modo claro / oscuro: las variables de color cambian con `<html data-tema="oscuro">` y la elección se guarda en `localStorage`.
- Rediseño visual: granulado de fondo (SVG con `feTurbulence`), manchas de color animadas, tarjetas de vidrio (`backdrop-filter`), botones con degradado, fuente Plus Jakarta Sans y un encabezado con estadísticas en vivo (total, disponibles, agotados, unidades).
- Vista previa de la imagen al escribir la URL, y la foto de cada fila de la tabla es clicable para cambiar la imagen.

**Hallazgos**
- Sin `.eq()`, `update()` y `delete()` afectan TODAS las filas de la tabla.
- Con RLS, si no hay política para `update` o `delete`, Supabase no da error: solo devuelve un array vacío. Por eso reviso `data.length === 0`.
- Un `<button>` dentro de un `<form>` sin `type` es `submit` por defecto: el de "Traer productos" necesitaba `type="button"`.
- `form.reset()` no limpia un `input hidden` al que le cambié `.value` por código; hay que vaciarlo a mano.
- Los botones que se crean con `innerHTML` pierden sus eventos al redibujar; la delegación de eventos (`evento.target.closest(".btn-editar")` en el contenedor) lo resuelve. El evento `error` de un `<img>` no sube al contenedor, así que se escucha en fase de captura (tercer parámetro `true`).
- Un `</style>` escrito dentro de un comentario CSS cierra la etiqueta `<style>` antes de tiempo.

**Errores**
- Las imágenes no se veían: los productos 1–3 tenían `imagen_url = null` (nunca ejecuté `agregar_imagen.sql`) y el televisor tenía la URL de la página de Éxito, no la de la foto. Para la foto hay que usar clic derecho → "Copiar dirección de imagen".
- Una copia de `modificarProducto` quedó pegada dentro del listener del buscador y consultaba `productos_practica` en vez de `products_practice`; la borré.

**Reflexión**
- Lo que más me sirvió fue ver que editar y eliminar son casi iguales a agregar: cambia `insert` por `update` o `delete`, pero siempre con `.eq('id', id)`, porque sin eso se afecta toda la tabla. Me quedó claro que el filtro es lo más importante de esas dos operaciones.
- Me costó entender por qué no salían las imágenes: pensé que era un error del código, y en realidad eran los datos (URLs vacías y una URL de página en vez de la foto). Aprendí a revisar primero qué hay guardado en la base de datos antes de cambiar el código.
- Del diseño, me gustó que con variables CSS se pueda cambiar todo el tema (claro/oscuro) tocando solo unos colores; quiero repasar `grid-template-areas` porque todavía me cuesta imaginar cómo se acomodan las áreas.
