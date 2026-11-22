export type Product = { id:string; slug:string; house:string; name:string; description:string; notes:string[]; image_url:string|null; active:boolean; created_at:string; variants:Variant[] }
export type Variant = { id:string; product_id:string; ml:number; refillable:boolean; price_cents:number; stripe_price_id?:string|null; active:boolean }
export type CartLine = { variant_id:string; quantity:number }
export type Order = { id:string; public_token:string; email:string; customer_name:string; status:string; subtotal_cents:number; discount_cents:number; shipping_cents:number; total_cents:number; currency:string; tracking_number:string|null; tracking_url:string|null; created_at:string; order_items?:{product_name:string; house:string; ml:number; refillable:boolean; quantity:number; unit_price_cents:number}[] }
export const money = (cents:number) => new Intl.NumberFormat('fr-CH',{style:'currency',currency:'CHF'}).format(cents/100)
