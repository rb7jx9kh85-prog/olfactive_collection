create extension if not exists pgcrypto;
create table public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
create table public.products (id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), house text not null, name text not null, description text not null default '', notes text[] not null default '{}', image_url text, active boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.product_variants (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, ml integer not null check(ml between 1 and 100), price_cents integer not null check(price_cents > 0), active boolean not null default true, unique(product_id,ml));
create table public.lots (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id), reference text not null, received_ml integer not null check(received_ml > 0), remaining_ml integer not null check(remaining_ml >= 0), cost_cents integer check(cost_cents >= 0), received_at timestamptz not null default now(), unique(product_id,reference), check(remaining_ml <= received_ml));
create table public.inventory_movements (id uuid primary key default gen_random_uuid(), lot_id uuid not null references public.lots(id), order_id uuid, delta_ml integer not null check(delta_ml <> 0), reason text not null check(reason in ('receipt','reservation','release','adjustment')), note text, created_at timestamptz not null default now());
create table public.promo_codes (id uuid primary key default gen_random_uuid(), code text not null unique, percent_off integer not null check(percent_off between 1 and 100), max_uses integer check(max_uses > 0), used_count integer not null default 0 check(used_count >= 0), active boolean not null default true, expires_at timestamptz, check(max_uses is null or used_count <= max_uses));
create table public.orders (id uuid primary key default gen_random_uuid(), public_token uuid not null unique default gen_random_uuid(), email text not null, customer_name text not null, address jsonb not null, status text not null default 'pending' check(status in ('pending','paid','packing','shipped','expired')), currency text not null default 'chf' check(currency='chf'), subtotal_cents integer not null check(subtotal_cents >= 0), discount_cents integer not null default 0 check(discount_cents >= 0), shipping_cents integer not null check(shipping_cents >= 0), total_cents integer not null check(total_cents >= 0), promo_id uuid references public.promo_codes(id), stripe_session_id text unique, stripe_payment_intent_id text, tracking_number text, tracking_url text, created_at timestamptz not null default now(), paid_at timestamptz, shipped_at timestamptz);
create table public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, variant_id uuid not null references public.product_variants(id), product_name text not null, house text not null, ml integer not null, quantity integer not null check(quantity between 1 and 20), unit_price_cents integer not null, unique(order_id,variant_id));
alter table public.inventory_movements add constraint movement_order_fk foreign key (order_id) references public.orders(id);
create table public.order_allocations (id uuid primary key default gen_random_uuid(), order_item_id uuid not null references public.order_items(id) on delete cascade, lot_id uuid not null references public.lots(id), ml integer not null check(ml > 0));
create table public.stripe_events (id text primary key, event_type text not null, received_at timestamptz not null default now());
create table public.site_settings (id integer primary key default 1 check(id=1), brand_name text not null default 'Olfactive Collection', announcement text not null default 'L’art du parfum, à votre mesure.', contact_email text not null default '', updated_at timestamptz not null default now());
insert into public.site_settings(id) values(1);
create index on public.products(house);
create index on public.product_variants(product_id);
create index on public.lots(product_id,received_at);
create index on public.orders(created_at desc);
create index on public.orders(email);
create index on public.orders(status,created_at);
create index on public.order_items(order_id);
create index on public.inventory_movements(lot_id,created_at desc);

-- Admin data is only read by server routes after an Auth identity and admin_users check.
-- Only catalogue tables receive public read policies; all writes use the server secret.
do $$ declare t text; begin foreach t in array array['admin_users','products','product_variants','lots','inventory_movements','promo_codes','orders','order_items','order_allocations','stripe_events','site_settings'] loop execute format('alter table public.%I enable row level security',t); end loop; end $$;
create policy "active products" on public.products for select to anon, authenticated using (active);
create policy "active variants" on public.product_variants for select to anon, authenticated using (active and exists(select 1 from public.products p where p.id=product_id and p.active));
revoke all on all tables in schema public from anon, authenticated;
grant select on public.products, public.product_variants to anon, authenticated;

-- Each reservation runs in one database transaction. Lock variant then lot rows in stable order.
create or replace function public.reserve_order(p_items jsonb,p_email text,p_name text,p_address jsonb,p_promo text default null)
returns public.orders language plpgsql security invoker set search_path = '' as $$
declare v record; l record; item_row public.order_items; out_order public.orders; remain integer; take_ml integer; subtotal integer:=0; discount integer:=0; shipping integer; promo public.promo_codes; country text; count_items integer;
begin
 if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items)>30 then raise exception 'Panier invalide'; end if;
 if p_email is null or length(p_email)>255 or length(trim(p_name))<2 then raise exception 'Client invalide'; end if;
 country := p_address->>'country'; if country not in ('CH','FR','BE') then raise exception 'Pays non disponible'; end if;
 if exists (select 1 from jsonb_array_elements(p_items) x where (x->>'quantity')::int not between 1 and 20) then raise exception 'Quantité invalide'; end if;
 select count(*) into count_items from jsonb_array_elements(p_items);
 if count_items <> (select count(distinct x->>'variant_id') from jsonb_array_elements(p_items) x) then raise exception 'Formats dupliqués'; end if;
 -- Lock all selected variants before reading mutable prices and stock.
 perform 1 from public.product_variants v where v.id in (select (x->>'variant_id')::uuid from jsonb_array_elements(p_items) x) order by v.id for update;
 if (select count(*) from public.product_variants v where v.id in (select (x->>'variant_id')::uuid from jsonb_array_elements(p_items) x)) <> count_items then raise exception 'Format inconnu'; end if;
 for v in select pv.*,p.name as product_name,p.house,p.active as product_active,(x->>'quantity')::int as qty
 from jsonb_array_elements(p_items) x join public.product_variants pv on pv.id=(x->>'variant_id')::uuid join public.products p on p.id=pv.product_id order by pv.id loop
   if not v.active or not v.product_active then raise exception 'Produit indisponible'; end if;
   subtotal:=subtotal+v.price_cents*v.qty;
 end loop;
 if p_promo is not null and trim(p_promo)<>'' then
   select * into promo from public.promo_codes where code=upper(trim(p_promo)) for update;
   if not found or not promo.active or (promo.expires_at is not null and promo.expires_at<now()) or (promo.max_uses is not null and promo.used_count>=promo.max_uses) then raise exception 'Code promotionnel invalide'; end if;
   discount:=floor(subtotal*promo.percent_off/100.0)::int;
   update public.promo_codes set used_count=used_count+1 where id=promo.id;
 end if;
 shipping:=case when country='CH' and subtotal-discount>=15000 then 0 when country='CH' then 790 else 1290 end;
 insert into public.orders(email,customer_name,address,subtotal_cents,discount_cents,shipping_cents,total_cents,promo_id)
 values(lower(trim(p_email)),trim(p_name),p_address,subtotal,discount,shipping,subtotal-discount+shipping,promo.id) returning * into out_order;
 for v in select pv.*,p.name as product_name,p.house,(x->>'quantity')::int as qty
 from jsonb_array_elements(p_items) x join public.product_variants pv on pv.id=(x->>'variant_id')::uuid join public.products p on p.id=pv.product_id order by pv.id loop
   insert into public.order_items(order_id,variant_id,product_name,house,ml,quantity,unit_price_cents)
   values(out_order.id,v.id,v.product_name,v.house,v.ml,v.qty,v.price_cents) returning * into item_row;
   remain:=v.ml*v.qty;
   for l in select * from public.lots where product_id=v.product_id and remaining_ml>0 order by received_at,id for update loop
     take_ml:=least(remain,l.remaining_ml);
     update public.lots set remaining_ml=remaining_ml-take_ml where id=l.id;
     insert into public.order_allocations(order_item_id,lot_id,ml) values(item_row.id,l.id,take_ml);
     insert into public.inventory_movements(lot_id,order_id,delta_ml,reason) values(l.id,out_order.id,-take_ml,'reservation');
     remain:=remain-take_ml; exit when remain=0;
   end loop;
   if remain>0 then raise exception 'Stock insuffisant pour %',v.product_name; end if;
 end loop;
 return out_order;
end $$;

create or replace function public.release_order(p_order_id uuid,p_event_id text default null)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare o public.orders; a record;
begin
 select * into o from public.orders where id=p_order_id for update;
 if not found or o.status<>'pending' then return false; end if;
 for a in select al.lot_id, sum(al.ml)::int as ml from public.order_allocations al join public.order_items oi on oi.id=al.order_item_id where oi.order_id=o.id group by al.lot_id order by al.lot_id loop
   update public.lots set remaining_ml=remaining_ml+a.ml where id=a.lot_id;
   insert into public.inventory_movements(lot_id,order_id,delta_ml,reason) values(a.lot_id,o.id,a.ml,'release');
 end loop;
 update public.orders set status='expired' where id=o.id;
 if o.promo_id is not null then update public.promo_codes set used_count=greatest(0,used_count-1) where id=o.promo_id; end if;
 if p_event_id is not null then insert into public.stripe_events(id,event_type) values(p_event_id,'checkout.session.expired') on conflict do nothing; end if;
 return true;
end $$;

create or replace function public.confirm_order(p_order_id uuid,p_session_id text,p_payment_intent text,p_amount integer,p_event_id text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare o public.orders;
begin
 select * into o from public.orders where id=p_order_id for update;
 if not found then raise exception 'Commande inconnue'; end if;
 if o.status in ('paid','packing','shipped') then return false; end if;
 if o.status <> 'pending' or o.total_cents<>p_amount or (o.stripe_session_id is not null and o.stripe_session_id<>p_session_id) then raise exception 'Paiement incohérent'; end if;
 update public.orders set status='paid',paid_at=now(),stripe_session_id=p_session_id,stripe_payment_intent_id=p_payment_intent where id=o.id;
 insert into public.stripe_events(id,event_type) values(p_event_id,'checkout.session.completed') on conflict do nothing;
 return true;
end $$;

create or replace function public.receive_lot(p_product uuid,p_reference text,p_ml integer,p_cost integer default null)
returns public.lots language plpgsql security invoker set search_path = '' as $$
declare l public.lots;
begin
 insert into public.lots(product_id,reference,received_ml,remaining_ml,cost_cents) values(p_product,trim(p_reference),p_ml,p_ml,p_cost) returning * into l;
 insert into public.inventory_movements(lot_id,delta_ml,reason) values(l.id,p_ml,'receipt'); return l;
end $$;
create or replace function public.adjust_lot(p_id uuid,p_delta integer,p_note text)
returns public.lots language plpgsql security invoker set search_path = '' as $$
declare l public.lots;
begin
 if p_delta=0 or length(trim(p_note))<3 then raise exception 'Motif requis'; end if;
 update public.lots set remaining_ml=remaining_ml+p_delta where id=p_id and remaining_ml+p_delta>=0 and remaining_ml+p_delta<=received_ml returning * into l;
 if not found then raise exception 'Ajustement impossible'; end if;
 insert into public.inventory_movements(lot_id,delta_ml,reason,note) values(l.id,p_delta,'adjustment',p_note); return l;
end $$;
revoke all on function public.reserve_order(jsonb,text,text,jsonb,text), public.release_order(uuid,text), public.confirm_order(uuid,text,text,integer,text), public.receive_lot(uuid,text,integer,integer), public.adjust_lot(uuid,integer,text) from public,anon,authenticated;
grant execute on function public.reserve_order(jsonb,text,text,jsonb,text), public.release_order(uuid,text), public.confirm_order(uuid,text,text,integer,text), public.receive_lot(uuid,text,integer,integer), public.adjust_lot(uuid,integer,text) to service_role;
