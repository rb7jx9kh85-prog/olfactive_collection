alter table public.product_variants add column if not exists refillable boolean not null default false;
alter table public.product_variants drop constraint if exists product_variants_product_id_ml_key;
alter table public.product_variants add constraint product_variants_product_ml_refillable_key unique(product_id, ml, refillable);
alter table public.product_variants add column if not exists stripe_price_id text;
alter table public.products add column if not exists stripe_product_id text;
alter table public.order_items add column if not exists refillable boolean not null default false;
create index if not exists product_variants_stripe_price_id_idx on public.product_variants(stripe_price_id);

create or replace function public.copy_variant_refillable_to_order_item()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  select pv.refillable into new.refillable
  from public.product_variants pv where pv.id = new.variant_id;
  return new;
end $$;
drop trigger if exists order_item_variant_metadata on public.order_items;
create trigger order_item_variant_metadata before insert on public.order_items
for each row execute function public.copy_variant_refillable_to_order_item();
revoke all on function public.copy_variant_refillable_to_order_item() from public,anon,authenticated;
grant execute on function public.copy_variant_refillable_to_order_item() to service_role;

create temporary table _pdf_catalogue (
  slug text primary key,
  house text not null,
  product_name text not null,
  family text not null,
  price_5 numeric(8,2) not null,
  price_10 numeric(8,2) not null,
  price_10_refill numeric(8,2) not null
) on commit drop;

insert into _pdf_catalogue values
('acqua-di-parma-arancia-di-capri-la-riserva','Acqua di Parma','ARANCIA DI CAPRI LA RISERVA','Hespéridée, Aromatique',21,37,41),
('acqua-di-parma-colonia','Acqua di Parma','COLONIA','Hespéridée',6,11,12),
('acqua-di-parma-colonia-club','Acqua di Parma','COLONIA C.L.U.B','Aromatique, boisée, musquée',10,18,19),
('acqua-di-parma-colonia-essenza','Acqua di Parma','COLONIA Essenza','Agrumes, boisée',11,19,21),
('acqua-di-parma-fico-di-amalfi','Acqua di Parma','FICO di AMALFI','Boisée, verte',8,14,15),
('acqua-di-parma-mandarino-di-sicilia','Acqua di Parma','MANDARINO di SICILIA','Aromatique, agrumes',8,14,15),
('acqua-di-parma-mirto-di-panarea','Acqua di Parma','MIRTO di PANAREA','Aromatique, agrumes',8,14,15),
('acqua-di-parma-note-di-colonia-ii','Acqua di Parma','NOTE DI COLONIA II','Boisée, aromatique',23,40,44),
('acqua-di-parma-oud-spice','Acqua di Parma','OUD & SPICE','Épicée, boisée',13,22,24),
('acqua-di-parma-zafferano','Acqua di Parma','ZAFFERANO','Boisée, ambrée',13,22,24),
('amouage-decision','AMOUAGE','DECISION','Fraîche, boisée, aromatique',21,42,46),
('amouage-interlude-53','AMOUAGE','INTERLUDE 53','Boisée, épicée',29,51,56),
('amouage-jubilation-40','AMOUAGE','JUBILATION 40','Boisée, chyprée',29,51,56),
('amouage-opus-xii-rose-incense','AMOUAGE','OPUS XII - ROSE INCENSE','Florale, ambrée',20,35,38),
('amouage-opus-xiii-silver-oud','AMOUAGE','OPUS XIII - SILVER OUD','Ambrée, boisée',36,64,70),
('amouage-purpose-50','AMOUAGE','PURPOSE 50','Boisée, épicée',29,51,56),
('amouage-reflection-45','AMOUAGE','REFLECTION 45','Boisée, florale, musquée',29,51,56),
('aphorismes-by-dominique-ropion-my-clementine','APHORISMES BY DOMINIQUE ROPION','MY CLÉMENTINE','Hespéridée, verte',38,66,73),
('editions-de-parfums-frederic-malle-the-night','EDITIONS DE PARFUMS FREDERIC MALLE',')THE NIGHT( الليل','Ambrée, boisée, florale',63,110,121),
('editions-de-parfums-frederic-malle-acne-studios','EDITIONS DE PARFUMS FREDERIC MALLE','Acne Studios','Aldéhydée, florale, fruitée',23,41,45),
('editions-de-parfums-frederic-malle-carnal-flower','EDITIONS DE PARFUMS FREDERIC MALLE','CARNAL FLOWER','Florale',23,41,45),
('editions-de-parfums-frederic-malle-french-lover','EDITIONS DE PARFUMS FREDERIC MALLE','FRENCH LOVER','Boisée, aromatique, épicée',23,41,45),
('editions-de-parfums-frederic-malle-musc-ravageur','EDITIONS DE PARFUMS FREDERIC MALLE','MUSC RAVAGEUR','Épicée, ambrée, musquée',23,41,45),
('editions-de-parfums-frederic-malle-portrait-of-a-lady','EDITIONS DE PARFUMS FREDERIC MALLE','PORTRAIT OF A LADY','Ambrée, florale, épicée',23,41,45),
('editions-de-parfums-frederic-malle-uncut-gem','EDITIONS DE PARFUMS FREDERIC MALLE','UNCUT GEM','Ambrée fraîche',23,41,45),
('fomowa-paris-vanille-des-rois','FOMOWA PARIS','VANILLE DES ROIS - PINK AND BROWN PRALINE EXTRAIT DE PARFUM','Gourmande, ambrée orientale',8,15,16),
('guerlain-vanille-planifolia-extrait-21','GUERLAIN','VANILLE PLANIFOLIA - EXTRAIT 21','Orientale, vanillée',81,143,157),
('louis-vuitton-imagination','LOUIS VUITTON','IMAGINATION','Hespéridée, aromatique',19,33,36),
('louis-vuitton-pacific-chill','LOUIS VUITTON','PACIFIC CHILL','Aromatique, fruitée',19,33,36),
('matiere-premiere-encens-suave','MATIERE PREMIERE','ENCENS SUAVE - EXTRAIT DE PARFUM','Ambrée, épicée, vanillée',20,35,38),
('nur-tonka-75','NŪR - HAUTE PARFUMERIE ARTISANALE','TONKA 75 - EXTRAIT DE PARFUM','Orientale, vanillée',19.5,35,40),
('nur-vanille-rousse','NŪR - HAUTE PARFUMERIE ARTISANALE','VANILLE ROUSSE - EXTRAIT DE PARFUM','Vanillée, sucrée',19.5,35,40),
('oman-luxury-khanjar','OMAN LUXURY','KHANJAR','Boisée, aromatique',18,31,34),
('oman-luxury-royal-incense','OMAN LUXURY','ROYAL INCENSE','Orientale, ambrée, fumée',18,31,34),
('tom-ford-vanilla-sex','TOM FORD','VANILLA SEX','Vanillée, ambrée, gourmande',25,44,48),
('yves-saint-laurent-babycat-raw-bourbon','YVES SAINT LAURENT','BABYCAT - RAW BOURBON','Vanillée, ambrée, épicée, cuirée',15,27,29);

insert into public.products(slug,house,name,description,notes,active)
select slug,house,product_name,
  'Décant de ' || product_name || ' par ' || house || '.',
  string_to_array(family, ', '), true
from _pdf_catalogue
on conflict (slug) do update set
  house=excluded.house,
  name=excluded.name,
  description=excluded.description,
  notes=excluded.notes,
  active=true,
  updated_at=now();

insert into public.product_variants(product_id,ml,refillable,price_cents,active)
select p.id,x.ml,x.refillable,round(x.price * 100)::integer,true
from _pdf_catalogue c
join public.products p on p.slug=c.slug
cross join lateral (values
  (5,false,c.price_5),
  (10,false,c.price_10),
  (10,true,c.price_10_refill)
) x(ml,refillable,price)
on conflict (product_id,ml,refillable) do update set price_cents=excluded.price_cents,active=true;
