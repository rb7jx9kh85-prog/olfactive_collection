'use client'
import Link from 'next/link'
import { Search, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-state'

export function StoreNav({ brand }: { brand: string }) {
  const count = useCart().reduce((sum, item) => sum + item.quantity, 0)
  return <header className="shop-header">
    <div className="shop-shell shop-navigation">
      <nav aria-label="Navigation principale" className="shop-links">
        <Link href="/catalogue">La collection</Link>
        <Link href="/#formats">Les décants</Link>
      </nav>
      <Link href="/" className="shop-wordmark" aria-label={`${brand}, accueil`}>
        {brand.toLowerCase() === 'olfactive collection'
          ? <>Olfactive<span>Collection</span></>
          : brand}
      </Link>
      <div className="shop-actions">
        <Link href="/catalogue?recherche=1#catalogue-filtre" aria-label="Rechercher un parfum"><Search size={19} strokeWidth={1.5}/></Link>
        <Link href="/panier" aria-label={`Panier, ${count} article${count === 1 ? '' : 's'}`}><ShoppingBag size={19} strokeWidth={1.5}/><span className="cart-count">{count}</span></Link>
      </div>
    </div>
  </header>
}
