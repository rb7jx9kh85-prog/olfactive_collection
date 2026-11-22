create index inventory_movements_order_id_idx on public.inventory_movements(order_id);
create index order_allocations_lot_id_idx on public.order_allocations(lot_id);
create index order_allocations_order_item_id_idx on public.order_allocations(order_item_id);
create index order_items_variant_id_idx on public.order_items(variant_id);
create index orders_promo_id_idx on public.orders(promo_id);
-- The setup endpoint has a secret token; the database also permits only the very first admin.
create or replace function public.bootstrap_admin(p_user_id uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(641239,1);
 if exists(select 1 from public.admin_users) then return false; end if;
 insert into public.admin_users(user_id) values(p_user_id);
 return true;
end $$;
revoke all on function public.bootstrap_admin(uuid) from public,anon,authenticated;
grant execute on function public.bootstrap_admin(uuid) to service_role;
