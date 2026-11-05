-- Permite MODIFICAR y ELIMINAR productos desde tu página (con la llave anon).
-- Cómo usarlo: Supabase → SQL Editor → New query → pega todo esto → Run.
--
-- Por qué hace falta: con RLS activado, cada operación (select, insert,
-- update, delete) necesita SU PROPIA política. Sin la de update,
-- Supabase no da error: el update "funciona" pero no encuentra ninguna
-- fila que tenga permiso de cambiar, y devuelve [].
--
-- OJO: "using (true)" = cualquiera con la llave anon puede editar/borrar
-- cualquier fila. Está bien para una tabla de PRÁCTICA, no para una real.

-- drop ... if exists: así puedes correr el archivo varias veces sin error
drop policy if exists "Modificar productos_practica" on public.products_practice;
create policy "Modificar productos_practica"
  on public.products_practice
  for update
  using (true)        -- qué filas puede ELEGIR para cambiar
  with check (true);  -- cómo pueden quedar las filas DESPUÉS del cambio

drop policy if exists "Eliminar productos_practica" on public.products_practice;
create policy "Eliminar productos_practica"
  on public.products_practice
  for delete
  using (true);
