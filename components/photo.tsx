import Image from 'next/image'
import { photoSrc, productPhotos } from '@/lib/editorial'
import type { Product } from '@/lib/types'

export function CollectionPhoto({ file, alt, position, sizes, priority }: {
  file: string; alt: string; position?: string; sizes: string; priority?: boolean
}) {
  const src = photoSrc({ file, alt })
  if (!src.startsWith('/collection/')) return <img src={src} alt={alt} loading="lazy" style={{objectPosition: position}}/>
  return <Image fill src={src} alt={alt} sizes={sizes} preload={priority} style={{objectPosition: position}}/>
}

export function ProductPhoto({ product, sizes }: { product: Product; sizes: string }) {
  const first = productPhotos(product)[0]
  return first ? <CollectionPhoto {...first} sizes={sizes}/> : <div className="photo-placeholder" aria-hidden="true"><span>OC</span></div>
}
