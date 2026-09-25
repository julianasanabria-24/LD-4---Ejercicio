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
