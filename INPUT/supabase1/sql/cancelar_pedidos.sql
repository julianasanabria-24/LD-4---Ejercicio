-- =================================================================
-- CANCELAR PEDIDOS: solo el admin, es definitivo y devuelve el stock
-- Ejecútalo una vez en Supabase → SQL Editor → Run. Se puede repetir.
--
-- Las POLÍTICAS ya impiden que un cliente cancele: en "pedidos" la única
-- política de UPDATE es admin_actualiza_estado. Estos triggers agregan
-- una segunda capa DENTRO de la base: aunque mañana alguien cree otra
-- política o una función que deje actualizar pedidos, la regla se cumple.
-- =================================================================

-- 1) ANTES de cambiar el estado: reglas de la cancelación
create or replace function proteger_cancelacion()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  -- Solo un admin puede pasar un pedido a 'cancelado'.
  -- auth.uid() es null en el SQL Editor: ahí (como dueño) sí se permite.
  if new.estado = 'cancelado'
     and auth.uid() is not null
     and not exists (select 1 from admins_practica where id = auth.uid()) then
    raise exception 'Solo un administrador puede cancelar pedidos';
  end if;

  -- Cancelar es definitivo: el stock ya se devolvió (ver paso 2). Si se
  -- pudiera "reactivar", esas unidades se venderían dos veces.
  if old.estado = 'cancelado' and new.estado <> 'cancelado' then
    raise exception 'Un pedido cancelado no se puede reactivar';
  end if;

  return new;
end;
$$;

drop trigger if exists pedidos_proteger_cancelacion on pedidos;
create trigger pedidos_proteger_cancelacion
before update of estado on pedidos
for each row execute function proteger_cancelacion();


-- 2) DESPUÉS de cancelar: devolver al inventario las unidades del pedido.
--    confirmar_pedido() las descontó al confirmar; un carrito nunca
--    descontó nada, por eso se excluye old.estado = 'carrito'.
create or replace function devolver_stock_cancelado()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  update products_practice p
     set unidades = p.unidades + d.cantidad
    from detalles_pedidos d
   where d.pedido_id = new.id
     and p.id = d.producto_id;
  return new;
end;
$$;

drop trigger if exists pedidos_devolver_stock on pedidos;
create trigger pedidos_devolver_stock
after update of estado on pedidos
for each row
when (new.estado = 'cancelado' and old.estado is distinct from 'cancelado' and old.estado <> 'carrito')
execute function devolver_stock_cancelado();

-- Las funciones de trigger no deben poder llamarse sueltas desde la API
revoke execute on function proteger_cancelacion()    from public, anon, authenticated;
revoke execute on function devolver_stock_cancelado() from public, anon, authenticated;


-- 3) Comprobación: deben salir los 2 triggers nuevos y, en políticas de
--    UPDATE sobre pedidos, solo admin_actualiza_estado
select 'trigger' as tipo, tgname as nombre, pg_get_triggerdef(oid) as detalle
from pg_trigger
where tgrelid = 'public.pedidos'::regclass and not tgisinternal
union all
select 'politica UPDATE', policyname, coalesce(qual, '')
from pg_policies
where tablename = 'pedidos' and cmd in ('UPDATE', 'ALL')
order by 1, 2;
