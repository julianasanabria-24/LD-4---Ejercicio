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
