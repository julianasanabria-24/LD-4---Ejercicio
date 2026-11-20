-- =================================================================
-- PEDIDOS: "Mis pedidos" (cliente) y "Pedidos" / "Mis clientes" (admin)
-- Ejecútalo una vez en Supabase → SQL Editor → Run. Se puede repetir.
-- =================================================================

-- 1) La vista pedidos_con_total debe respetar RLS.
--    Una vista normal se ejecuta con los permisos de su DUEÑO (postgres),
--    que se salta RLS: cualquier cliente con sesión podría leer los pedidos
--    (direcciones y teléfonos) de TODOS los demás. security_invoker = true
--    hace que se ejecute con los permisos de quien consulta.
alter view pedidos_con_total set (security_invoker = true);

-- 2) Políticas del administrador, con el nombre REAL de la tabla
--    (admins_practica, en plural). Si ya estaban bien, quedan igual.
drop policy if exists "ver_pedidos"            on pedidos;
drop policy if exists "admin_actualiza_estado" on pedidos;
drop policy if exists "ver_historial_admin"    on historial_estados_pedido;

create policy "ver_pedidos" on pedidos
for select to authenticated
using (
  (select auth.uid()) = cliente_id
  or exists (select 1 from admins_practica where id = (select auth.uid()))
);

create policy "admin_actualiza_estado" on pedidos
for update to authenticated
using ( exists (select 1 from admins_practica where id = (select auth.uid())) )
with check ( exists (select 1 from admins_practica where id = (select auth.uid())) );

create policy "ver_historial_admin" on historial_estados_pedido
for select to authenticated
using ( exists (select 1 from admins_practica where id = (select auth.uid())) );

-- clientes_practica NO necesita cambios: "cliente lee su perfil" ya deja
-- leer a un admin (or exists ... admins_practica).

-- 3) Comprobación: security_invoker=true y 0 políticas con "admin_practica"
select 'vista pedidos_con_total' as revision,
       coalesce(array_to_string(reloptions, ', '), 'SIN security_invoker') as resultado
from pg_class where oid = 'public.pedidos_con_total'::regclass
union all
select 'politicas con admin_practica (debe ser 0)', count(*)::text
from pg_policies
where qual like '%admin\_practica%' or with_check like '%admin\_practica%';
