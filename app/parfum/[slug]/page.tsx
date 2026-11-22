import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import { products } from '@/lib/store'
import { houseName, productName, productStory } from '@/lib/editorial'
import { AddCart } from '@/components/add-cart'
import { ProductGallery } from '@/components/product-gallery'
import { ProductCard } from '@/components/product-card'

type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = (await products()).find(item => item.slug === slug)
  if (!product) return {}
  return { title: `${productName(product)} · ${houseName(product.house)}`, description: productStory(product) || `Découvrez ${productName(product)} en décant et choisissez votre format.` }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const list = await products()
  const product = list.find(item => item.slug === slug)
  if (!product) notFound()
  const house = houseName(product.house)
  const name = productName(product)
  const story = productStory(product)
  const related = list.filter(item => item.house === product.house && item.slug !== slug).slice(0, 4)
  return <main className="boutique shop-shell shop-product-page">
    <nav aria-label="Fil d’Ariane" className="shop-breadcrumb"><Link href="/catalogue">Collection</Link><span aria-hidden="true">/</span><Link href={`/catalogue?maison=${encodeURIComponent(house)}`}>{house}</Link></nav>
    <div className="shop-product-layout">
      <ProductGallery product={product}/>
      <section className="shop-product-copy" aria-labelledby="nom-parfum">
        <span className="shop-kicker">{house}</span>
        <h1 id="nom-parfum">{name}</h1>
        {product.notes.length > 0 && <ul className="shop-note-list" aria-label="Profil olfactif">{product.notes.map(note => <li key={note}>{note}</li>)}</ul>}
        <p className="shop-product-intro">{story || 'Prenez le temps de le découvrir sur peau, de la première vaporisation jusqu’aux notes qui restent en fin de journée.'}</p>
        <AddCart product={product}/>
        <div className="shop-product-service"><ShieldCheck size={19} strokeWidth={1.5}/><span>Paiement sécurisé avec Stripe</span></div>
        <details className="product-disclosure"><summary>Que contient ma commande ?</summary><p>Vous recevez le parfum dans un vaporisateur de la contenance choisie. Les photos montrent le flacon d’origine à titre de présentation.</p></details>
        <details className="product-disclosure"><summary>Quel format choisir ?</summary><p>Le 5 ml permet de découvrir le parfum sur plusieurs ports. Le 10 ml convient à une fragrance que vous portez plus souvent. La version rechargeable permet de réutiliser le vaporisateur.</p><Link className="shop-text-link" href="/#formats">Voir le guide des formats</Link></details>
      </section>
    </div>
    {related.length > 0 && <section className="shop-section"><div className="shop-section-head"><h2>À découvrir chez {house}</h2></div><div className="shop-grid">{related.map(item => <ProductCard key={item.id} product={item}/>)}</div></section>}
  </main>
}
