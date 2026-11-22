'use client'
import { useState } from 'react'
import Link from 'next/link'
import { LockKeyhole, Minus, Plus, ShoppingBag } from 'lucide-react'
import type { Product } from '@/lib/types'
import { money } from '@/lib/types'
import { houseName, productName, variantName } from '@/lib/editorial'
import { saveCart, useCart } from '@/lib/cart-state'
import { ProductPhoto } from './photo'

type Country = 'CH' | 'FR' | 'BE'

export function Cart({ products }: { products: Product[] }) {
  const items = useCart()
  const [country, setCountry] = useState<Country>('CH')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lines = items.map(item => {
    const product = products.find(entry => entry.variants.some(variant => variant.id === item.variant_id))
    return { item, product, variant: product?.variants.find(variant => variant.id === item.variant_id) }
  })
  const subtotal = lines.reduce((sum, { item, variant }) => sum + (variant?.price_cents ?? 0) * item.quantity, 0)

  function quantity(id: string, amount: number) {
    saveCart(items.map(item => item.variant_id === id ? { ...item, quantity: amount } : item).filter(item => item.quantity > 0))
  }

  async function pay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer_name: form.get('name'),
          email: form.get('email'),
          promo_code: form.get('promo') ?? '',
          address: { line1: form.get('address'), line2: form.get('line2'), city: form.get('city'), postal_code: form.get('zip'), country },
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.url) throw new Error(result.error || 'Le paiement est momentanément indisponible.')
      window.location.assign(result.url)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Le paiement est momentanément indisponible.')
      setBusy(false)
    }
  }

  return <main className="boutique shop-shell shop-cart-page">
    <header className="shop-page-heading"><span className="shop-kicker">Votre sélection</span><h1>Mon panier</h1></header>
    {!lines.length ? <div className="shop-empty shop-cart-empty">
      <ShoppingBag size={30} strokeWidth={1.3}/><h2>Votre panier est vide.</h2>
      <p>Un premier décant suffit pour faire connaissance avec un parfum.</p>
      <Link className="shop-button" href="/catalogue">Découvrir la collection</Link>
    </div> : <div className="shop-cart-layout">
      <section aria-label="Parfums dans le panier">
        {lines.map(({ item, product, variant }) => <div className="shop-cart-line" key={item.variant_id}>
          <div className="shop-cart-photo">{product && <ProductPhoto product={product} sizes="96px"/>}</div>
          <div className="shop-cart-item">
            <span className="shop-kicker">{product ? houseName(product.house) : 'Indisponible'}</span>
            <h2>{product ? <Link href={`/parfum/${product.slug}`}>{productName(product)}</Link> : 'Ce format a été retiré'}</h2>
            {variant && <p>{variantName(variant)}</p>}
            <div className="shop-cart-controls">
              {variant && <div className="shop-stepper">
                <button type="button" onClick={() => quantity(item.variant_id, item.quantity - 1)} aria-label="Diminuer la quantité" disabled={item.quantity <= 1}><Minus size={15}/></button>
                <span aria-label="Quantité">{item.quantity}</span>
                <button type="button" onClick={() => quantity(item.variant_id, item.quantity + 1)} aria-label="Augmenter la quantité" disabled={item.quantity >= 20}><Plus size={15}/></button>
              </div>}
              <button type="button" className="shop-text-link" onClick={() => quantity(item.variant_id, 0)}>Retirer</button>
            </div>
          </div>
          {variant && <strong className="shop-cart-price">{money(variant.price_cents * item.quantity)}</strong>}
        </div>)}
        <Link className="shop-text-link shop-cart-back" href="/catalogue">Continuer à explorer</Link>
      </section>
      <form onSubmit={pay} className="shop-checkout">
        <h2>Coordonnées de livraison</h2>
        <label>Nom complet<input className="input" name="name" required minLength={2} maxLength={120} autoComplete="name"/></label>
        <label>Adresse e-mail<input className="input" name="email" type="email" required maxLength={255} autoComplete="email"/></label>
        <label>Adresse<input className="input" name="address" required minLength={3} maxLength={180} autoComplete="address-line1"/></label>
        <label>Complément d’adresse <small>(facultatif)</small><input className="input" name="line2" maxLength={180} autoComplete="address-line2"/></label>
        <div className="form-grid">
          <label>Code postal<input className="input" name="zip" required minLength={3} maxLength={16} autoComplete="postal-code"/></label>
          <label>Ville<input className="input" name="city" required minLength={2} maxLength={100} autoComplete="address-level2"/></label>
        </div>
        <label>Pays<select className="input" name="country" value={country} onChange={event => setCountry(event.target.value as Country)} autoComplete="country"><option value="CH">Suisse</option><option value="FR">France</option><option value="BE">Belgique</option></select></label>
        <details className="product-disclosure" onToggle={event => { if (!event.currentTarget.open) { const input = event.currentTarget.querySelector('input'); if (input) input.value = '' } }}><summary>Ajouter un code promotionnel</summary><label className="sr-only" htmlFor="promo">Code promotionnel</label><input id="promo" className="input" name="promo" maxLength={32}/></details>
        <div className="shop-checkout-summary"><span>Sous-total</span><strong>{money(subtotal)}</strong></div>
        <p>Le total, livraison et remises comprises, sera affiché sur Stripe avant le paiement.</p>
        {country === 'CH' && <p>Livraison offerte en Suisse dès CHF 150 après remise.</p>}
        {lines.some(line => !line.variant) && <p role="alert" className="error">Retirez les formats indisponibles pour continuer.</p>}
        {error && <p role="alert" className="error">{error}</p>}
        <button className="shop-button" disabled={busy || lines.some(line => !line.variant)}><LockKeyhole size={17}/>{busy ? 'Ouverture de Stripe…' : 'Continuer vers le paiement'}</button>
      </form>
    </div>}
  </main>
}
