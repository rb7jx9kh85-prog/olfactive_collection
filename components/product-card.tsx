import Link from 'next/link'
import type { Product } from '@/lib/types'
import { money } from '@/lib/types'
import { houseName, productName } from '@/lib/editorial'
import { ProductPhoto } from './photo'

export function ProductCard({ product }: { product: Product }) {
  const price = Math.min(...product.variants.map(variant => variant.price_cents))
  return <article className="shop-card">
    <Link href={`/parfum/${product.slug}`}>
      <div className="shop-card-image"><ProductPhoto product={product} sizes="(max-width: 650px) 49vw, (max-width: 1050px) 32vw, 25vw"/></div>
      <div className="shop-card-info">
        <span className="shop-kicker">{houseName(product.house)}</span>
        <h3>{productName(product)}</h3>
        {product.notes.length > 0 && <p>{product.notes.join(' · ')}</p>}
        <span className="shop-card-price">{Number.isFinite(price) ? `Dès ${money(price)}` : 'Formats à venir'}</span>
      </div>
    </Link>
  </article>
}
