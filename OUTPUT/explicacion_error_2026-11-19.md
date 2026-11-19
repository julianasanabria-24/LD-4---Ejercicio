# Explicación de errores — 2026-11-19

Sesión: carrito de `galeria.html` guardado en Supabase (`pedidos` + `detalles_pedidos`) y confirmación con `confirmar_pedido()`.

---

## 1. `42710: policy "ver_pedidos" for table "pedidos" already exists`

**Tipo:** el objeto ya existe en la base de datos (no es un error del código JS).

**Causa:** el script de políticas ya se había ejecutado antes, completo o en parte. `create policy` no reemplaza una política con el mismo nombre: falla.

**Solución:** poner `drop policy if exists` antes de cada `create policy`. Así el script se puede ejecutar las veces que haga falta.

```sql
drop policy if exists "ver_pedidos" on pedidos;
create policy "ver_pedidos" on pedidos for select to authenticated using (...);
```

**Concepto:** primo del `42P07` del 2026-11-13 (`create table` sobre una tabla que ya existe). Un script de base de datos tiene que poder repetirse sin romperse: `if exists` / `if not exists` / `create or replace`.

---

## 2. `42501: new row violates row-level security policy for table "detalles_pedidos"` (403)

**Tipo:** permisos (RLS). La petición **sí** llegó a Supabase con la sesión del cliente, pero ninguna política la dejó pasar.

**Causa:** `detalles_pedidos` solo tenía la política `ver_detalles` (SELECT). Faltaban `agregar_detalle` (INSERT), `cambiar_cantidad` (UPDATE) y `quitar_detalle` (DELETE): el script anterior se detuvo antes de crearlas. Con RLS activado, **sin política de INSERT se rechaza todo insert**.

**Cómo se encontró:** un diagnóstico en el SQL Editor que simula ser el cliente (`set_config('request.jwt.claims', ...)` + `set_config('role', 'authenticated', ...)`) y prueba el insert con y sin `returning`. Salió:
- `default de pedidos.estado: 'carrito'` → bien
- `el cliente ve el pedido 1: SI` → bien
- `insert SIN select: 42501` y `insert CON select: 42501` → falta la política de INSERT
- en las políticas de `detalles_pedidos` solo aparecía `ver_detalles`

**Solución:** crear las 3 políticas que faltaban.

```sql
create policy "agregar_detalle" on detalles_pedidos
for insert to authenticated
with check (
  exists (select 1 from pedidos p
           where p.id = detalles_pedidos.pedido_id
             and p.cliente_id = (select auth.uid())
             and p.estado = 'carrito')
);
```

**Concepto:** con RLS, **cada operación necesita su propia política** (select, insert, update, delete). Es la misma raíz del error del 2026-11-05 (update devolvía `[]`). La diferencia: un INSERT bloqueado **sí** da error (`42501`); un UPDATE o DELETE bloqueado **no** da error, solo devuelve `[]`.

---

## 3. `409 Conflict` al agregar al carrito (`POST /rest/v1/detalles_pedidos`)

**Tipo:** restricción de la tabla. Ya no era RLS (eso estaba arreglado): el insert chocó con una regla de los datos. Supabase responde 409 a `23505` (registro duplicado) o `23503` (foreign key).

**Causa más probable (`23505`):** ese producto ya tenía una fila en el carrito, pero la página no lo sabía (`detalleIds[id]` vacío). Pasa si se pulsa "Agregar" antes de que termine `cargarCarritoDesdeBD()`, o si se agregó desde otra pestaña. Entonces intenta un INSERT en vez de un UPDATE.

**Solución:** en `agregarAlCarrito()`, si el insert falla con `23505`, buscar la fila que ya existe y volver a intentar por el UPDATE (igual que ya hacía `obtenerOCrearCarrito()` con el carrito).

```js
if (error.code === '23505') {
  const { data: existente } = await db.from('detalles_pedidos')
    .select('id, cantidad').eq('pedido_id', pedido).eq('producto_id', Number(id)).maybeSingle();
  detalleIds[id] = existente.id;
  carrito[id] = existente.cantidad;
  return agregarAlCarrito(id, cantidad);
}
```

**Concepto:** el código HTTP orienta: `403` = permisos (RLS / grant), `409` = conflicto con los datos (duplicado, foreign key). Para saber cuál es exactamente, hay que desplegar el objeto del error y leer `code`.

---

## 4. `42P01: relation "productos_practica" does not exist` (al confirmar el pedido)

**Tipo:** referencia a algo que no existe — el `ReferenceError` de la base de datos.

**Causa:** la función `confirmar_pedido()` (copiada de la guía) consultaba `productos_practica`; mi tabla se llama `products_practice`. Postgres **no revisa los nombres de tabla dentro de una función plpgsql al crearla**, solo al ejecutarla: por eso el error salió recién al confirmar.

**Solución:** recrear la función con el nombre correcto. Se hizo con un bloque que busca el nombre malo en todas las funciones y lo reemplaza:

```sql
def := replace(pg_get_functiondef(oid), 'productos_practica', 'products_practice');
execute def;   -- es un CREATE OR REPLACE FUNCTION
```

**Concepto:** es la **4.ª vez** que aparece `productos_practica` en el proyecto (2026-10-23, 2026-10-29, 2026-11-06 y hoy) y queda una más sin corregir en `js/productos.js:644`. Viene de la guía, que usa ese nombre. Antes de pegar código de la guía, buscar `productos_practica` y `admin_practica` y cambiarlos por `products_practice` y `admins_practica`.

---

## Hallazgo extra: el SQL Editor ejecuta solo lo seleccionado

`cancelar_pedidos.sql` quedó a medias (el trigger de devolver stock decía `FALTA`): estaban seleccionadas las líneas 1–42 al pulsar Run, y Supabase **ejecuta solo la selección** si hay texto seleccionado. Para ejecutar un script completo: clic en el editor sin seleccionar nada → Run.
