'use client'
import { useState } from 'react'
import type { Product } from '@/lib/types'
import { productPhotos } from '@/lib/editorial'
import { CollectionPhoto, ProductPhoto } from './photo'

export function ProductGallery({ product }: { product: Product }) {
  const images = productPhotos(product)
  const [index, setIndex] = useState(0)
  return <figure className="shop-gallery">
    <div className="shop-gallery-main">{images[index]
      ? <CollectionPhoto {...images[index]} sizes="(max-width: 720px) 100vw, 48vw" priority={index === 0}/>
      : <ProductPhoto product={product} sizes="(max-width: 720px) 100vw, 48vw"/>}</div>
    {images[index] && <figcaption>{images[index].alt}</figcaption>}
    {images.length > 1 && <div className="shop-gallery-thumbs" aria-label="Autres vues">
      {images.map((item, i) => <button type="button" key={item.file + i} aria-label={item.alt} aria-pressed={i === index} onClick={() => setIndex(i)}><CollectionPhoto {...item} alt="" sizes="76px"/></button>)}
    </div>}
  </figure>
}
