import Link from 'next/link'
import type { Product } from '@/lib/types'
import { money } from '@/lib/types'
export function ProductCard({product:p}:{product:Product}){return <Link href={`/parfum/${p.slug}`} className="product-card"><div className="photo">{p.image_url?<img src={p.image_url} alt={`${p.house} ${p.name}`} loading="lazy"/>:<span className="serif" style={{fontSize:50,color:'#9d8c75'}}>O.</span>}</div><div className="product-info"><span className="eyebrow">{p.house}</span><h3>{p.name}</h3><span className="muted" style={{fontSize:13}}>Dès {p.variants.length?money(Math.min(...p.variants.map(x=>x.price_cents))):'—'}</span></div></Link>}
