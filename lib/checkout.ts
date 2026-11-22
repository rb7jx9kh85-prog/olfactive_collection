import { z } from 'zod'
export const checkoutSchema=z.object({items:z.array(z.object({variant_id:z.uuid(),quantity:z.number().int().min(1).max(20)})).min(1).max(30),email:z.email().max(255),customer_name:z.string().trim().min(2).max(120),address:z.object({line1:z.string().trim().min(3).max(180),line2:z.string().trim().max(180).optional(),city:z.string().trim().min(2).max(100),postal_code:z.string().trim().min(3).max(16),country:z.enum(['CH','FR','BE'])}),promo_code:z.string().trim().max(32).optional()})
export function normalizeCart<T extends {variant_id:string;quantity:number}>(items:T[]) {
  const qty=new Map<string,number>()
  for(const item of items) qty.set(item.variant_id,(qty.get(item.variant_id)||0)+item.quantity)
  if([...qty.values()].some(n=>n>20)) throw new Error('Maximum 20 décants par format')
  return [...qty].map(([variant_id,quantity])=>({variant_id,quantity}))
}
export function shippingCents(subtotal:number, country:'CH'|'FR'|'BE') { return country==='CH' && subtotal>=15000 ? 0 : country==='CH'?790:1290 }
