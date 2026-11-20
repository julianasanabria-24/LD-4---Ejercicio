-- =================================================================
-- PERFIL DEL CLIENTE: columnas nuevas + políticas RLS
-- Ejecútalo una vez en Supabase → SQL Editor → Run.
-- =================================================================

-- 1) Columnas nuevas para el formulario "Mis datos".
--    "if not exists" = si ya la creaste antes, no da error.
alter table clientes_practica add column if not exists telefono  text;
alter table clientes_practica add column if not exists direccion text;
alter table clientes_practica add column if not exists ciudad    text;

-- 2) RLS: cada cliente solo puede VER y EDITAR su propia fila.
--    auth.uid() = el id del usuario que tiene la sesión iniciada
--    (el mismo data.user.id que usamos en el insert del registro).
alter table clientes_practica enable row level security;

drop policy if exists "cliente lee su perfil" on clientes_practica;
create policy "cliente lee su perfil"
  on clientes_practica for select
  to authenticated
  using (auth.uid() = id);

-- using      → qué filas puede tocar (solo la suya)
-- with check → cómo debe quedar la fila después del cambio
--              (no puede cambiar su id por el de otra persona)
drop policy if exists "cliente edita su perfil" on clientes_practica;
create policy "cliente edita su perfil"
  on clientes_practica for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3) Proteger correo y rol: aunque alguien escriba un update desde la
--    consola, la base de datos solo deja cambiar estas 4 columnas.
revoke update on clientes_practica from authenticated;
grant update (nombre, telefono, direccion, ciudad) on clientes_practica to authenticated;

-- 4) La API de Supabase (PostgREST) guarda una "foto" de las columnas
--    de cada tabla (schema cache). Esto la actualiza para que vea las
--    columnas nuevas de una vez.
notify pgrst, 'reload schema';
