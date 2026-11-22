import { stripe } from './stripe'
import { service } from './supabase'

export async function syncStripeCatalog() {
  const db = service()
  const client = stripe()
  const { data: products, error } = await db.from('products').select('id,slug,house,name,description,active,stripe_product_id,product_variants(id,ml,refillable,price_cents,active,stripe_price_id)').order('house').order('name')
  if (error) throw error
  let synced = 0
  for (const product of products || []) {
    const stripeProduct = product.stripe_product_id
      ? await client.products.update(product.stripe_product_id, { name: `${product.house} · ${product.name}`, description: product.description || undefined, active: product.active })
      : await client.products.create({ name: `${product.house} · ${product.name}`, description: product.description || undefined, active: product.active, metadata: { product_id: product.id, slug: product.slug } })
    if (!product.stripe_product_id) await db.from('products').update({ stripe_product_id: stripeProduct.id }).eq('id', product.id)
    for (const variant of product.product_variants || []) {
      if (variant.stripe_price_id) {
        await client.prices.update(variant.stripe_price_id, { active: variant.active })
        synced++
        continue
      }
      const price = await client.prices.create({ currency: 'chf', unit_amount: variant.price_cents, product: stripeProduct.id, active: variant.active, nickname: `${variant.ml} ml${variant.refillable ? ' rechargeable' : ''}`, metadata: { variant_id: variant.id, product_id: product.id, ml: String(variant.ml), refillable: String(variant.refillable) } })
      await db.from('product_variants').update({ stripe_price_id: price.id }).eq('id', variant.id)
      synced++
    }
  }
  return { products: products?.length || 0, variants: synced }
}
