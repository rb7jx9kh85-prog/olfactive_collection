import Link from 'next/link'
import type { Metadata } from 'next'
import { products } from '@/lib/store'
import { Catalogue } from '@/components/catalogue'

export const metadata: Metadata = { title: 'La collection de décants' }

export default async function Page({ searchParams }: { searchParams: Promise<{ maison?: string; recherche?: string }> }) {
  const { maison, recherche } = await searchParams
  return <main className="boutique shop-shell shop-collection">
    <header className="shop-page-heading">
      <span className="shop-kicker">Parfumerie de niche</span>
      <h1>La collection</h1>
      <p>Explorez par maison ou par famille olfactive. Le 5 ml est un bon point de départ pour comparer plusieurs parfums sur peau.</p>
      <Link className="shop-text-link" href="/#formats">Le guide des formats</Link>
    </header>
    <Catalogue key={maison ?? ''} products={await products()} initialHouse={maison} focusSearch={recherche === '1'}/>
  </main>
}
