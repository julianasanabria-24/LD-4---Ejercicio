-- =================================================================
-- PERFIL DEL CLIENTE QUE NO APARECE EN "MI PERFIL"
-- Ejecútalo una vez en Supabase → SQL Editor → Run. Se puede repetir.
--
-- El problema: si al registrarse Supabase exige confirmar el correo,
-- signUp() devuelve la sesión en null y el insert en clientes_practica
-- se hace SIN sesión → RLS lo rechaza → la persona entra después pero
-- no tiene fila, y "Mi perfil" queda vacío.
--
-- La solución tiene dos partes:
--  1) Una política para que cada cliente pueda crear SU PROPIA fila
--     (cliente.js la crea sola al entrar si no existe).
--  2) Rellenar ahora las filas que faltan de las cuentas ya creadas.
-- =================================================================

-- 1) Insert: solo su propia fila (auth.uid() = id) y solo con rol 'cliente'
drop policy if exists "cliente crea su perfil" on clientes_practica;
create policy "cliente crea su perfil"
  on clientes_practica for insert
  to authenticated
  with check (auth.uid() = id and rol = 'cliente');

grant insert (id, nombre, correo, rol) on clientes_practica to authenticated;

-- 2) Cuentas de Auth que no tienen fila de cliente (y que no son admins)
insert into clientes_practica (id, nombre, correo, rol)
select u.id,
       coalesce(u.raw_user_meta_data ->> 'nombre', split_part(u.email, '@', 1)),
       u.email,
       'cliente'
from auth.users u
where not exists (select 1 from clientes_practica c where c.id = u.id)
  and not exists (select 1 from admins_practica a where a.id = u.id);

notify pgrst, 'reload schema';
