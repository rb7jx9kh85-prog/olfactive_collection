'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import type { Product } from '@/lib/types'
import { houseName, productName } from '@/lib/editorial'
import { ProductCard } from './product-card'

function fold(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr').trim()
}

function minimumPrice(product: Product) {
  return Math.min(...product.variants.map(variant => variant.price_cents))
}

export function Catalogue({ products, initialHouse, focusSearch }: { products: Product[]; initialHouse?: string; focusSearch?: boolean }) {
  const houses = [...new Set(products.map(p => houseName(p.house)))].sort((a, b) => a.localeCompare(b, 'fr'))
  const [house, setHouse] = useState(houses.find(item => fold(item) === fold(initialHouse ?? '')) ?? '')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('selection')
  const terms = fold(query).split(/\s+/).filter(Boolean)
  const filtered = products.filter(p => {
    const text = fold([p.house, houseName(p.house), p.name, productName(p), ...p.notes].join(' '))
    return (!house || houseName(p.house) === house) && terms.every(term => text.includes(term))
  })
  if (sort === 'price') filtered.sort((a, b) => minimumPrice(a) - minimumPrice(b))
  if (sort === 'name') filtered.sort((a, b) => productName(a).localeCompare(productName(b), 'fr'))

  return <section className="shop-catalogue" id="catalogue-filtre" aria-label="Rechercher dans la collection">
    <div className="shop-filters">
      <label className="search-field"><span className="sr-only">Parfum, maison ou famille</span><Search size={19} aria-hidden="true"/><input className="input" type="search" placeholder="Parfum, maison ou famille…" value={query} onChange={e => setQuery(e.target.value)} autoFocus={focusSearch}/></label>
      <label><span className="sr-only">Maison</span><select className="input" value={house} onChange={e => setHouse(e.target.value)}><option value="">Toutes les maisons</option>{houses.map(item => <option key={item}>{item}</option>)}</select></label>
      <label><span className="sr-only">Trier les parfums</span><select className="input" value={sort} onChange={e => setSort(e.target.value)}><option value="selection">Ordre de la collection</option><option value="price">Prix croissant</option><option value="name">Nom de A à Z</option></select></label>
    </div>
    <div className="shop-filter-summary"><span role="status">{filtered.length} parfum{filtered.length === 1 ? '' : 's'}{house ? ` · ${house}` : ''}</span>{(query || house) && <button type="button" className="shop-text-link" onClick={() => { setQuery(''); setHouse('') }}>Effacer les filtres</button>}</div>
    {filtered.length
      ? <div className="shop-grid">{filtered.map(product => <ProductCard key={product.id} product={product}/>)}</div>
      : <div className="shop-empty"><h2>{products.length ? 'Aucun parfum ne correspond à votre recherche.' : 'La collection est momentanément indisponible.'}</h2>{products.length > 0 && <p>Essayez une autre maison ou un terme comme « boisé » ou « vanille ».</p>}</div>}
  </section>
}
