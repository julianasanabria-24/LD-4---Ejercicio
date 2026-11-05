# Explicación de error — 2026-11-05

**Mensaje en consola:** `No se modificó nada: revisa el id o la política RLS de update` (prueba2.js:135)
**En pantalla:** `Error al modificar producto (mira la consola con F12)`
**Cuándo:** al cambiar la imagen de un producto (en realidad pasa con cualquier edición).

## Tipo de error
**Permisos (RLS) — error "silencioso".** El código JS es correcto y Supabase no devuelve `error`.
El servidor simplemente no deja tocar ninguna fila, y responde un array vacío `[]`.

## Causa
- `sql/productos_practica.sql` activa RLS y solo crea una política `for select` (lectura).
- Con RLS, **cada operación necesita su propia política**: select, insert, update, delete.
- Sin la política de `update`, `.update(...).eq('id', id).select()` no encuentra filas permitidas → `data = []`.
- `modificarProducto()` detecta `data.length === 0` y por eso muestra el aviso.

## Solución
Ejecutar `sql/politicas_update_delete.sql` en el SQL Editor de Supabase:

```sql
create policy "Modificar productos_practica"
  on public.products_practice
  for update
  using (true)
  with check (true);
```

- `using` → qué filas se pueden elegir para cambiar.
- `with check` → cómo pueden quedar después del cambio.

## Concepto para recordar
`error === null` **no** significa "se hizo". Con RLS, un permiso que falta no da error: da `[]`.
Por eso es importante usar `.select()` y revisar `data.length`, como ya hace tu código.
