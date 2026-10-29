# Explicación de error — 2026-10-22

**Archivo:** `INPUT/supabase1/js/prueba2.js` (objeto `productoPrueba`, líneas 64-73)
**Error:** `Uncaught SyntaxError: Unexpected identifier 'image'`
**Tipo:** sintaxis — el navegador no puede ni leer el archivo, así que no se ejecuta NADA de él (ni el botón).

## Causas (línea 71-72)
1. Falta la coma `,` después de `categoria : [...]` — en un objeto, cada par `key: value` se separa con coma.
2. `image url` tiene un espacio — una key sin comillas no puede tener espacios. Además la columna en Supabase se llama `imagen_url`.
3. `;` al final del valor — dentro de `{ }` de un objeto no van `;`, solo `,`.

## Errores que no rompen la sintaxis pero sí el resultado
- `precio: 90.000` → en JS el punto es decimal: vale `90`. Escribir `90000`.
- Keys que no coinciden con las columnas (`descripción`, `categoria`) → deben ser `descripcion`, `categorias`.
- Líneas 45 y 53: `producto.descripciones` y `producto.precios` → no existen, dan `undefined`. Las columnas son `descripcion` y `precio`.

## Corrección
```js
const productoPrueba = {
  nombre: "Televisor",
  descripcion: "Este es el producto de prueba",
  precio: 90000,
  unidades: 10,
  descuento: 0.1,
  disponible: true,
  categorias: ["tecnologia", "accesorios"],
  imagen_url: "https://..."
};
```
