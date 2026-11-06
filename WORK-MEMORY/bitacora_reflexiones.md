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


## 2026-10-30

> 🔐 **HITO — Hasta aquí fue el proceso de login del proyecto.**
> Registro e inicio de sesión con Supabase Auth funcionando en `cliente.html`. Lo que sigue (sección 5) es mostrar el estado de la sesión y cerrar sesión.

**Cambios**
- Creé `cliente.html` y `js/cliente.js` con dos formularios: Registrarme y Iniciar sesión.
- `registrarCliente()` crea el usuario con `db.auth.signUp()` y después inserta su perfil en `clientes_practica`, con el mismo `id` (`data.user.id`) que le asignó Auth y `rol: 'cliente'`.
- `iniciarSesion()` verifica correo y contraseña con `db.auth.signInWithPassword()`; el login con el usuario de Mariana funciona.
- Estilos en un archivo aparte, `css/cuenta.css`, con la misma estética de `prueba2.html` (vidrio, degradados, manchas animadas, granulado, Plus Jakarta Sans). Las dos tarjetas van lado a lado y en celular una debajo de la otra.
- Saqué el modo claro / oscuro a `js/tema.js`; usa la misma clave `"tema"` de `localStorage`, así que el tema se comparte con `prueba2.html`.

**Hallazgos**
- `signUp()` no toca mis tablas: crea el usuario en `auth.users`, que maneja Supabase. El perfil en mi tabla es un segundo paso.
- Después de `signInWithPassword()`, `db` guarda la sesión y la manda sola en cada petición; ese id es el que ve `auth.uid()` en las políticas RLS.
- Un status `400` quiere decir que el servidor rechazó la petición: el problema no está en la sintaxis de mi JS.
- Que no salga error no quiere decir que funcione: al comentar `mostrarEstadoSesion()` se fue el `ReferenceError`, pero también el mensaje de sesión iniciada (error de lógica).

**Errores**
- `AuthApiError: Email address "sofia@gmail.com" is invalid` (400): Supabase rechaza correos inventados. Se resuelve con un correo real y alias `+` (`tucorreo+sofia@gmail.com`).
- `ReferenceError: mostrarEstadoSesion is not defined`: llamaba una función que todavía no había escrito. Es el 3er `ReferenceError` del registro → repasar declaración vs. uso y scope.

> ✏️ **Después del login: perfil del cliente (SELECT + UPDATE)**

**Cambios**
- Escribí `mostrarEstadoSesion()` con `db.auth.getUser()` y el botón de cerrar sesión con `db.auth.signOut()`. La función revisa la sesión al abrir la página, al iniciar sesión y al cerrarla.
- Creé `sql/clientes_practica_perfil.sql`: columnas nuevas `telefono`, `direccion` y `ciudad`; políticas RLS para que cada cliente solo lea y edite su propia fila (`auth.uid() = id`); y permiso de update solo para `nombre`, `telefono`, `direccion` y `ciudad`, para que `correo` y `rol` no se puedan cambiar.
- `leerCliente()` trae la fila con `.select('*').eq('id', id).maybeSingle()` y `cargarPerfil()` pone los datos en los campos del formulario.
- `actualizarCliente()` hace `.update(cambios).eq('id', id).select()` y revisa `data.length === 0`, igual que en el CRUD de productos. El correo se ve pero es `readonly`.
- Diseño: tarjeta **Mi perfil** fija como columna a la izquierda (`position: fixed`), con Cerrar sesión al fondo. **✎ Editar perfil** abre un sidebar desde la derecha con el formulario de update, que se cierra con ✕, clic en el fondo o Esc. Centré el encabezado y el mensaje de sesión (`width: fit-content` + `margin: auto`).

**Hallazgos**
- Una función declarada dentro de un `addEventListener` solo existe ahí adentro: mi `mostrarEstadoSesion()` estaba dentro del listener del login y el botón de cerrar sesión no la habría encontrado.
- Un `.sql` en mi carpeta es solo texto: la tabla de Supabase no cambia hasta que lo ejecuto en el SQL Editor.
- `.maybeSingle()` devuelve un objeto (o `null`) en vez de un array.
- `update().select()` devuelve la fila ya actualizada, así que no hace falta volver a leer la tabla.
- El sidebar se mueve con CSS (`transform: translateX(100%)` + `transition`); el JS solo pone o quita una clase. `inert` evita llegar con Tab a campos que no se ven.
- Un elemento `position: fixed` sale del flujo: hay que dejarle espacio a mano (`body.con-sesion { padding-left }`).
- `text-align: center` centra elementos `inline-flex` (como la pastilla), no solo texto.

**Errores**
- `PGRST204: Could not find the 'ciudad' column ... in the schema cache`: no había ejecutado el SQL de las columnas nuevas. Se resuelve ejecutándolo; `notify pgrst, 'reload schema';` refresca la lista de columnas de la API.

**Reflexión**
- _(pendiente: la escribe el estudiante)_


## 2026-11-05

> _Entrada redactada por el agente a pedido del estudiante, a partir de lo trabajado en la sesión. Pendiente de revisión del estudiante para que quede en sus propias palabras._

**Cambios**
- En `prueba2.html` + `prueba2.js` agregué una vista en tarjetas para el recuadro "Productos", con un botón que alterna entre tabla y tarjetas; la elección se guarda en `localStorage`, igual que el tema. Saqué el HTML de la foto a una función `fotoProducto()` que usan las dos vistas.
- Ajusté el ancho de las dos columnas del layout (formulario más angosto, panel de productos más ancho) y arreglé que los campos del formulario se salieran y se recortaran.
- Creé `sql/politicas_update_delete.sql` con las políticas RLS de `update` y `delete` para `products_practice`.
- Revisé la seguridad de `clientes_practica`: comprobé desde `curl`, con la anon key pública, que la tabla aceptaba escrituras anónimas (RLS sin activar).

**Hallazgos**
- Para que algo no se salga de una grid/flex aunque uses `fr` o `flex:1`, casi siempre falta `minmax(0, …)` o `min-width: 0`: un `1fr` es en realidad `minmax(auto, 1fr)`, y ese `auto` no deja que la columna sea más angosta que su contenido.
- La delegación de eventos hizo que Editar/Eliminar/foto funcionaran en las tarjetas sin tocar el listener; solo cambié `closest("tr")` por `closest("[data-producto]")` para que sirva en las dos vistas.
- La **anon key es pública por diseño**: viaja en el navegador y se ve en el inspector (`supabaseClient.js`, cabecera `apikey` en Network). Esconderla no protege nada; lo único que protege es RLS.
- `error === null` **no** significa "se hizo" ni "estoy protegido". En el `curl` de prueba la respuesta no fue un `401/403` de permisos sino un error de constraint (`id` not-null): eso probó que RLS **no** estaba frenando la escritura, solo faltaba el `id`.

**Errores**
- `No se modificó nada: revisa el id o la política RLS de update` (RLS sin política de `update`): el update devolvía `[]` sin error. Se resuelve ejecutando `politicas_update_delete.sql`. Es el 3er caso Supabase con la misma raíz (`.sql` local ≠ base de datos real) → repasar RLS y políticas por operación.


## 2026-11-06

> _Entrada redactada por el agente a pedido del estudiante. Pendiente de revisión del estudiante para que quede en sus propias palabras._

**Cambios**
- Renombré `prueba2.html` → `admin.html` y `js/prueba2.js` → `js/admin.js` con `git mv` (git lo registra como renombre y conserva el historial).
- Actualicé `<script src="js/admin.js">` en `admin.html` y los comentarios que nombraban `prueba2` en `admin.html`, `cliente.html`, `css/cuenta.css` y `js/tema.js`. Corregí también los comentarios del final de `admin.html` que aún decían `prueba.js`.
- Agregué `<title>Panel de productos</title>` a `admin.html`, que no tenía título.
- Las entradas anteriores de esta bitácora y de `OUTPUT/` siguen diciendo `prueba2`: son registros de su fecha y no se reescriben.
- Agregué en `admin.html` los formularios para registrar administrador e iniciar sesión (`#zona-acceso-admin`), con su lógica en `admin.js` (`signUp` + insert en `admins_practica`, `signInWithPassword`, `signOut`).
- El panel CRUD (encabezado + formulario + productos) quedó dentro de `<main id="panel-admin" hidden>`. `mostrarEstadoSesionAdmin()` lo muestra solo si hay sesión **y** fila en `admins_practica`; además oculta los formularios de acceso, muestra "Cerrar sesión" y recién ahí carga los productos (antes se cargaban al abrir la página, aunque nadie hubiera entrado).
- Cambié `.single()` por `.maybeSingle()` al leer `admins_practica` y borré una `eliminarProducto` duplicada que estaba metida dentro del listener del tema (usaba la tabla `productos_practica`, que no existe).
- Estilos del acceso de admin con la misma estética de `cliente.html`: encabezado centrado ("Panel de *administración*" con degradado y pastilla "Acceso restringido"), registro y login como tarjetas de vidrio lado a lado (`.tarjetas-acceso`, una debajo de la otra en celular), campos con halo al escribir. El CSS quedó en el `<style>` de `admin.html` y no en `cuenta.css`, porque ese archivo redefine `body`, `button` y `#btn-tema`.
- Saqué `#estado-sesion-admin` de `#zona-acceso-admin`: al ocultar la zona también se ocultaba el mensaje "Sesión iniciada como…". "Cerrar sesión" quedó como botón de contorno fijo arriba a la izquierda, espejo del botón de tema.
- Quité la tarjeta de registro siempre visible: ahora solo se ve "Iniciar sesión" (centrada, 440px) con un botón de contorno "Registrar cuenta de administrador" que la cambia por el formulario de registro (`hidden`), y este trae "← Volver a iniciar sesión". La función `mostrarFormularioAcceso("login" | "registro")` en `admin.js` alterna las dos; tras un registro exitoso vuelve sola al login.

- Empecé la **galería de productos** para clientes (`galeria.html` + `css/galeria.css` + `js/galeria.js`), sin Supabase por ahora. Tomé como referencia un CodePen de tienda (header con carrito y contador, grilla de tarjetas con foto, nombre, descripción, precio y selector de cantidad), pero con la estética de vidrio rosa del proyecto:
  - Barra pegada arriba (`sticky`) con logo, tema y botón de carrito con contador que "rebota" al agregar.
  - Buscador + chips de categoría generados a partir de los productos (`flatMap` + `new Set`).
  - Grilla `repeat(auto-fill, minmax(240px, 1fr))`: se adapta sola sin `@media`.
  - Tarjeta: foto `aspect-ratio: 4/3` con zoom al pasar el mouse, etiquetas de descuento y "Agotado", precio tachado si hay descuento, aviso "¡Quedan solo N!" con stock bajo.
  - "Agregar al carrito" se convierte en el selector `− n +` (no pasa del stock). Solo se redibuja el pie de esa tarjeta, no toda la grilla.
  - Carrito como panel lateral (mismo patrón que `#sidebar-perfil`), con subtotal, ahorro y total; se guarda en `localStorage` como `{ id: cantidad }`.
  - Datos de prueba con la misma forma que `products_practice`: para conectar Supabase solo cambia `cargarProductos()`.

- Conecté la galería a Supabase: borré los productos de prueba y `cargarProductos()` ahora trae `products_practice` (la tabla `products` no existe en el proyecto: la API responde `404 PGRST205`). Muestra "Cargando productos…" mientras llega la respuesta y un mensaje si falla.
- `limpiarCarrito()` sincroniza el carrito de `localStorage` con la base al cargar: quita productos borrados o agotados y baja la cantidad si el stock bajó.

**Hallazgos de la galería**
- En la base hay `"tecnología"` y `"tecnologia"` (escritas a mano en admin): un `Set` las toma como distintas y salían dos chips. Uso un `Map` con la clave normalizada (`normalizar()`), y el filtro también compara normalizado. Sería mejor limpiar el dato en la base, pero el código no debería depender de eso.
- En el ejemplo, al hacer clic rápido en `+` el texto del botón quedaba seleccionado (el navegador lo toma como doble clic). Se evita con `user-select: none` en los botones.
- `animation: ... both` deja aplicado el `transform` final de la animación y le gana al `transform` del `:hover` (las animaciones pesan más que las reglas normales). Por eso las tarjetas usan `backwards`.
- En el carrito guardo solo `{ id: cantidad }` y no el producto entero: el nombre y el precio se buscan cada vez, así no quedan precios viejos guardados.

**Pendiente de seguridad**
- Ocultar el registro tras un botón **no** lo hace privado: cualquiera que abra `admin.html` puede crear una cuenta y quedar en `admins_practica`. Lo seguro sería crear los admins a mano desde el dashboard de Supabase y que RLS no permita `insert` en `admins_practica` desde la página.

**Hallazgos**
- Renombrar un archivo rompe todo lo que lo carga por ruta (`src`, `href`); el navegador no avisa con error de JS, solo con un `404` en la pestaña Network.
- Ocultar el panel con `hidden` es solo **interfaz**: con F12 se puede quitar el atributo o llamar a `db.from(...).delete()` desde la consola. La protección real de `products_practice` tiene que venir de políticas RLS que revisen `admins_practica` (pendiente).
- El orden importa: `mostrarEstadoSesionAdmin()` se llama al final de `admin.js` porque usa `requestSubmit()` sobre `form-busqueda`, y el listener de ese formulario tiene que existir antes.

**Reflexión**
- _(pendiente: la escribe el estudiante)_
