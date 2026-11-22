create table public.customers (
 id uuid primary key default gen_random_uuid(),
 email text not null unique,
 full_name text not null,
 phone text,
 notes text not null default '',
 last_order_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
alter table public.customers enable row level security;
revoke all on public.customers from anon, authenticated;
create index customers_last_order_at_idx on public.customers(last_order_at desc);
create or replace function public.confirm_order(p_order_id uuid,p_session_id text,p_payment_intent text,p_amount integer,p_event_id text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare o public.orders;
begin
 select * into o from public.orders where id=p_order_id for update;
 if not found then raise exception 'Commande inconnue'; end if;
 if o.status in ('paid','packing','shipped') then return false; end if;
 if o.status <> 'pending' or o.total_cents<>p_amount or (o.stripe_session_id is not null and o.stripe_session_id<>p_session_id) then raise exception 'Paiement incohérent'; end if;
 update public.orders set status='paid',paid_at=now(),stripe_session_id=p_session_id,stripe_payment_intent_id=p_payment_intent where id=o.id;
 insert into public.customers(email,full_name,last_order_at) values(o.email,o.customer_name,now())
 on conflict (email) do update set full_name=excluded.full_name,last_order_at=excluded.last_order_at;
 insert into public.stripe_events(id,event_type) values(p_event_id,'checkout.session.completed') on conflict do nothing;
 return true;
end $$;
revoke all on function public.confirm_order(uuid,text,text,integer,text) from public,anon,authenticated;
grant execute on function public.confirm_order(uuid,text,text,integer,text) to service_role;
