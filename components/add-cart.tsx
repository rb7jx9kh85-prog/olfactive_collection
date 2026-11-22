'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import { money } from '@/lib/types'
import { variantName } from '@/lib/editorial'
import { cartLines, saveCart } from '@/lib/cart-state'

export function AddCart({ product }: { product: Product }) {
  const [selected, setSelected] = useState(product.variants[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState('')
  const variant = product.variants.find(item => item.id === selected)

  function add() {
    if (!variant) return
    try {
      const lines = cartLines()
      const existing = lines.find(item => item.variant_id === variant.id)
      if ((existing?.quantity ?? 0) + quantity > 20) {
        setFeedback('Le panier est limité à 20 décants par format.')
        return
      }
      if (existing) existing.quantity += quantity
      else lines.push({ variant_id: variant.id, quantity })
      saveCart(lines)
      setFeedback('Ajouté au panier.')
    } catch { setFeedback('Impossible d’enregistrer le panier dans ce navigateur.') }
  }

  if (!variant) return <p className="shop-purchase">Ce parfum n’a pas de format à commander pour le moment.</p>

  return <div className="shop-purchase">
    <fieldset className="shop-variants">
      <legend>Choisir le format</legend>
      <div>{product.variants.map(item => <label key={item.id} className="shop-variant">
        <input type="radio" name="decant-format" value={item.id} checked={selected === item.id} onChange={() => { setSelected(item.id); setFeedback('') }}/>
        <span><strong>{variantName(item)}</strong><small>{money(item.price_cents)}</small></span>
      </label>)}</div>
    </fieldset>
    <div className="shop-buy-row">
      <label><span className="sr-only">Quantité</span><select className="input" value={quantity} onChange={event => { setQuantity(Number(event.target.value)); setFeedback('') }}>{Array.from({ length: 10 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select></label>
      <button className="shop-button" type="button" onClick={add}>Ajouter au panier · {money(variant.price_cents * quantity)}</button>
    </div>
    <div className="shop-cart-feedback" role="status">{feedback}{feedback === 'Ajouté au panier.' && <Link href="/panier" className="shop-text-link">Voir le panier</Link>}</div>
  </div>
}
