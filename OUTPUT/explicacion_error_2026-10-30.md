# Explicación de error — 2026-10-30

## Error
```
POST .../auth/v1/signup 400 (Bad Request)
AuthApiError: Email address "sofia@gmail.com" is invalid
  at registrarCliente (js/cliente.js:19)
```

## Tipo de error
**Error de validación del servidor (API, HTTP 400).** No es de sintaxis ni de lógica: el código JS corrió bien, envió la petición, y fue **Supabase** quien la rechazó. Un `400` significa "lo que me mandaste no lo acepto".

## Dónde ocurre
`js/cliente.js:19` → `db.auth.signUp({ email: correo, ... })`. El código está bien (incluso hace `.trim()` al correo).

## Por qué
Supabase Auth no solo revisa el *formato* del correo: también rechaza direcciones que considera falsas o que no puede usar para enviar el correo de confirmación (por ejemplo, correos inventados tipo `sofia@gmail.com` que no son tuyos o que ya rebotaron). Su servidor de correo de prueba protege su reputación rechazándolos.

## Cómo resolverlo
- **Opción recomendada:** usar un correo real tuyo con alias `+`: `tucorreo+sofia@gmail.com`. Gmail lo entrega a tu bandeja y Supabase lo ve como correo distinto, así puedes crear varios usuarios de prueba.
- Alternativa: en Supabase → Authentication → Sign In / Providers → Email, desactivar **Confirm email** mientras practicas.

## Concepto clave
`data / error` no solo atrapa errores de *tu* código: también trae las respuestas negativas del servidor. Leer el status (400, 401, 404, 500) te dice de qué lado está el problema.

---

# Error 2 — Iniciar sesión

## Error
```
Uncaught (in promise) ReferenceError: mostrarEstadoSesion is not defined
  at HTMLFormElement.<anonymous> (cliente.js:130:5)
```

## Tipo de error
**ReferenceError:** se llama a un nombre (variable o función) que JavaScript no encuentra en ningún lado.

## Dónde ocurre
`js/cliente.js:130` → `mostrarEstadoSesion();`. La función se *llama*, pero no está *definida* en ningún archivo del proyecto. El comentario dice "definida en la sección 5": es un paso de la guía que todavía no se ha hecho.

## Dato útil
El login **sí funcionó**: la línea 130 solo corre dentro de `if (usuario)`. El error pasa después de iniciar sesión.

## Cómo resolverlo
Escribir la función (sección 5 de la guía) en `cliente.js`, antes de usarla o en cualquier parte del archivo (las `function` declaradas se "elevan" / hoisting).

## Concepto clave
Llamar ≠ definir. `nombre()` ejecuta; `function nombre() { ... }` crea. Si solo existe la llamada, JS no tiene qué ejecutar.

## Patrón detectado
Es el **3er ReferenceError** del registro (`mouseXPos`, `circleSize`, `mostrarEstadoSesion`). Tema a repasar: **declaración vs uso, y alcance (scope)** de variables y funciones.

---

# Error 3 — Guardar "Mis datos"

## Error
```
Error al actualizar el perfil:
{ code: 'PGRST204', message: "Could not find the 'ciudad' column of 'clientes_practica' in the schema cache" }
```

## Tipo de error
**Error de esquema de la base de datos (servidor).** El JS está bien; el `update()` pide escribir en una columna que la tabla todavía no tiene.

## Por qué
Las columnas `telefono`, `direccion` y `ciudad` se crean con `sql/clientes_practica_perfil.sql`, pero ese archivo vive en el proyecto local: hasta que se ejecuta en el SQL Editor de Supabase, la tabla real no cambia. "Schema cache" es la copia que guarda la API de Supabase de las columnas de cada tabla.

## Cómo resolverlo
Ejecutar `clientes_practica_perfil.sql` en Supabase → SQL Editor → Run. La última línea (`notify pgrst, 'reload schema';`) refresca el schema cache.

## Concepto clave
Un archivo `.sql` en tu carpeta es solo texto, igual que una receta: no cambia la base de datos hasta que se ejecuta allá. Mismo patrón que el 29-10 con `agregar_imagen.sql`.
