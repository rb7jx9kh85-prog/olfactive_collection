create or replace function public.adjust_lot(p_id uuid,p_delta integer,p_note text)
returns public.lots language plpgsql security invoker set search_path = '' as $$
declare l public.lots; held integer;
begin
 if p_delta=0 or length(trim(p_note))<3 then raise exception 'Motif requis'; end if;
 select * into l from public.lots where id=p_id for update;
 if not found then raise exception 'Lot inconnu'; end if;
 select coalesce(sum(a.ml),0)::integer into held
 from public.order_allocations a join public.order_items i on i.id=a.order_item_id
 join public.orders o on o.id=i.order_id
 where a.lot_id=p_id and o.status='pending';
 if l.remaining_ml+p_delta<0 or l.remaining_ml+p_delta>l.received_ml-held then raise exception 'Ajustement incompatible avec les réservations'; end if;
 update public.lots set remaining_ml=remaining_ml+p_delta where id=p_id returning * into l;
 insert into public.inventory_movements(lot_id,delta_ml,reason,note) values(l.id,p_delta,'adjustment',p_note);
 return l;
end $$;
revoke all on function public.adjust_lot(uuid,integer,text) from public,anon,authenticated;
grant execute on function public.adjust_lot(uuid,integer,text) to service_role;
