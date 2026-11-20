-- =================================================================
-- REGISTRO DE ADMINS CON CÓDIGO DE INVITACIÓN (admin.html → "Crear cuenta de admin")
-- Ejecútalo UNA vez en Supabase → SQL Editor → Run. Se puede repetir
-- (no cambia el código si ya existe). Después de esto, los admins se
-- crean desde la página, sin volver a entrar a Supabase.
--
-- ANTES DE EJECUTAR: cambia 'CAMBIAME-everwish' (paso 2) por tu código.
-- Luego lo puedes cambiar desde el panel (pestaña Administradores).
--
-- Seguridad:
--  - El código se guarda como HASH bcrypt (igual que las contraseñas):
--    ni siquiera leyendo la tabla se puede saber cuál es.
--  - config_admin no tiene ningún permiso para el navegador.
--  - admins_practica sigue cerrada: solo estas funciones escriben en ella.
-- =================================================================

-- 1) Tabla privada con el código (una sola fila: id = 1)
create table if not exists config_admin (
  id           int primary key default 1 check (id = 1),
  codigo_hash  text not null,
  cambiado_en  timestamptz not null default now()
);
alter table config_admin enable row level security;   -- sin políticas = nadie
revoke all on config_admin from anon, authenticated;

-- 2) Código inicial (solo si todavía no hay uno)
insert into config_admin (id, codigo_hash)
values (1, extensions.crypt('CAMBIAME-everwish', extensions.gen_salt('bf')))
on conflict (id) do nothing;


-- 3) Registrarse como admin con el código.
--    admin.js primero crea la cuenta con signUp(); esta función la
--    confirma y la agrega a admins_practica, SOLO si el código es correcto.
create or replace function registrar_admin(p_nombre text, p_correo text, p_codigo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
  v_id   uuid;
begin
  select codigo_hash into v_hash from config_admin where id = 1;

  if v_hash is null or extensions.crypt(coalesce(p_codigo, ''), v_hash) <> v_hash then
    perform pg_sleep(1);   -- frena a quien intente adivinar el código a fuerza bruta
    raise exception 'Código de invitación incorrecto';
  end if;

  if coalesce(trim(p_nombre), '') = '' or coalesce(trim(p_correo), '') = '' then
    raise exception 'Nombre y correo son obligatorios';
  end if;

  select id into v_id from auth.users where lower(email) = lower(trim(p_correo));
  if v_id is null then
    raise exception 'No existe una cuenta con el correo %', p_correo;
  end if;

  if exists (select 1 from admins_practica where id = v_id) then
    raise exception 'Esa cuenta ya es administradora. Inicia sesión.';
  end if;

  -- Así puede iniciar sesión de inmediato, sin esperar el correo de confirmación
  update auth.users set email_confirmed_at = now()
  where id = v_id and email_confirmed_at is null;

  insert into admins_practica (id, nombre, correo, rol)
  values (v_id, trim(p_nombre), lower(trim(p_correo)), 'admin');
end;
$$;

-- 4) Cambiar el código desde el panel (solo un admin)
create or replace function cambiar_codigo_admin(p_codigo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins_practica where id = auth.uid()) then
    raise exception 'Solo un administrador puede cambiar el código';
  end if;

  if length(coalesce(p_codigo, '')) < 8 then
    raise exception 'El código debe tener al menos 8 caracteres';
  end if;

  update config_admin
  set codigo_hash = extensions.crypt(p_codigo, extensions.gen_salt('bf')),
      cambiado_en = now()
  where id = 1;
end;
$$;

-- 5) Permisos: registrar_admin la usa alguien SIN sesión (anon) porque
--    aún no es admin; el código es lo que lo protege.
revoke all on function registrar_admin(text, text, text) from public;
revoke all on function cambiar_codigo_admin(text) from public, anon;
grant execute on function registrar_admin(text, text, text) to anon, authenticated;
grant execute on function cambiar_codigo_admin(text) to authenticated;
