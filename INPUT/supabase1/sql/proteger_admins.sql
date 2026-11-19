-- =================================================================
-- PROTEGER admins_practica: nadie puede hacerse admin desde el navegador
-- Ejecútalo una vez en Supabase → SQL Editor → Run. Se puede repetir.
--
-- El problema: la política "agregar" dejaba a CUALQUIER usuario con
-- sesión insertar su propio id en admins_practica. Un cliente podía
-- abrir la consola (F12) y escribir:
--   await db.from('admins_practica').insert({ id: '<su uuid>', nombre: 'x', correo: 'x' })
-- y desde ese momento todas las políticas lo trataban como admin.
-- =================================================================

-- 1) Sin política de INSERT, RLS rechaza cualquier insert del navegador
drop policy if exists "agregar" on admins_practica;

-- 2) Y además, sin permiso: el navegador solo puede LEER (y RLS lo limita
--    a su propia fila con la política "ver_perfil"). Las políticas de las
--    otras tablas siguen funcionando: su "exists (select 1 from
--    admins_practica ...)" solo necesita leer.
revoke all on admins_practica from anon, authenticated;
grant select on admins_practica to authenticated;

-- 3) Comprobación (una sola tabla de resultados):
--    - permisos: authenticated solo SELECT; anon, ninguno
--    - políticas: solo ver_perfil (SELECT)
--    - admins actuales: revisa que TODOS sean personas de confianza.
--      Si aparece alguien que no reconoces, bórralo:
--        delete from admins_practica where correo = 'correo@raro.com';
select 'permiso' as tipo, grantee as nombre, string_agg(privilege_type, ', ') as detalle
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'admins_practica'
  and grantee in ('anon', 'authenticated')
group by grantee
union all
select 'politica', policyname, cmd
from pg_policies
where tablename = 'admins_practica'
union all
select 'admin actual', correo, nombre || ' · creado ' || created_at::date
from admins_practica
order by 1, 2;


-- =================================================================
-- CÓMO CREAR UN ADMIN NUEVO (desde ahora, solo así)
-- 1) Supabase → Authentication → Users → "Add user" → "Create new user"
--    con su correo y contraseña (marca "Auto Confirm User").
-- 2) Aquí en el SQL Editor, cambia el correo y el nombre y ejecuta:
--
-- insert into admins_practica (id, nombre, correo, rol)
-- select id, 'Nombre del admin', email, 'admin'
-- from auth.users
-- where email = 'nuevo.admin@correo.com';
--
-- El SQL Editor trabaja como "postgres" (dueño de la tabla), por eso
-- este insert sí funciona aunque el navegador ya no pueda hacerlo.
-- =================================================================
