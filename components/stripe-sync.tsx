'use client'
import { useState } from 'react'

export function StripeSync() {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function sync() {
    setBusy(true)
    setMessage('Synchronisation Stripe…')
    const response = await fetch('/api/admin/stripe/sync', { method: 'POST' })
    const body = await response.json()
    setMessage(response.ok ? `${body.products} produits et ${body.variants} variantes synchronisés dans Stripe.` : body.error || 'Synchronisation impossible')
    setBusy(false)
  }
  return <div className="panel"><h2 style={{fontSize:29}}>Catalogue Stripe</h2><p className="muted">Crée les produits et prix dans l’environnement Stripe correspondant à la clé configurée.</p><button className="button" onClick={sync} disabled={busy}>{busy ? 'Synchronisation…' : 'Synchroniser avec Stripe'}</button>{message&&<p role="status" style={{marginBottom:0}}>{message}</p>}</div>
}
