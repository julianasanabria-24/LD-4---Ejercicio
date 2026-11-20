-- =================================================================
-- AGREGAR ADMINS DESDE EL PANEL (pestaña "Administradores" de admin.html)
-- Ejecútalo una vez en Supabase → SQL Editor → Run. Se puede repetir.
--
-- admins_practica sigue cerrada para el navegador (proteger_admins.sql):
-- nadie puede hacer insert directo. En su lugar, estas dos funciones
-- "security definer" corren como el dueño de la tabla, PERO antes
-- comprueban que quien las llama ya sea admin. Un cliente que las
-- llame desde la consola recibe un error.
-- =================================================================

-- 1) Agregar un admin. La cuenta (auth.users) la crea antes admin.js con
--    signUp(); si el correo ya tenía cuenta (por ejemplo, un cliente),
--    se usa esa misma cuenta.
create or replace function agregar_admin(p_nombre text, p_correo text)
returns admins_practica
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id   uuid;
  v_fila admins_practica;
begin
  if not exists (select 1 from admins_practica where id = auth.uid()) then
    raise exception 'Solo un administrador puede agregar administradores';
  end if;

  if coalesce(trim(p_nombre), '') = '' or coalesce(trim(p_correo), '') = '' then
    raise exception 'Nombre y correo son obligatorios';
  end if;

  select id into v_id
  from auth.users
  where lower(email) = lower(trim(p_correo));

  if v_id is null then
    raise exception 'No existe una cuenta con el correo %', p_correo;
  end if;

  if exists (select 1 from admins_practica where id = v_id) then
    raise exception 'Esa persona ya es administradora';
  end if;

  -- Un admin lo da de alta: se confirma su correo (como "Auto Confirm User")
  update auth.users
  set email_confirmed_at = now()
  where id = v_id and email_confirmed_at is null;

  insert into admins_practica (id, nombre, correo, rol)
  values (v_id, trim(p_nombre), lower(trim(p_correo)), 'admin')
  returning * into v_fila;

  return v_fila;
end;
$$;

-- 2) Listar los admins. La política "ver_perfil" solo deja ver la fila
--    propia, así que la lista también pasa por una función que exige ser admin.
create or replace function listar_admins()
returns setof admins_practica
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins_practica where id = auth.uid()) then
    raise exception 'Solo un administrador puede ver la lista de administradores';
  end if;

  return query select * from admins_practica order by created_at;
end;
$$;

-- 3) Solo usuarios con sesión pueden llamarlas (y adentro se exige ser admin)
revoke all on function agregar_admin(text, text) from public, anon;
revoke all on function listar_admins() from public, anon;
grant execute on function agregar_admin(text, text) to authenticated;
grant execute on function listar_admins() to authenticated;
