import Link from 'next/link'
import { Droplets, ScanLine, ShoppingBag } from 'lucide-react'
import { products } from '@/lib/store'
import { featuredSlugs, formatGuide } from '@/lib/editorial'
import { ProductCard } from '@/components/product-card'
import { CollectionPhoto } from '@/components/photo'

const questions = [
  ['Qu’est-ce qu’un décant ?', 'Une petite quantité de parfum prélevée du flacon d’origine et transvasée dans un vaporisateur. Vous recevez le volume choisi sur la fiche. Les grands flacons photographiés présentent les parfums de la collection.'],
  ['Quel format choisir pour une première découverte ?', 'Le 5 ml vous laisse essayer le parfum à plusieurs reprises. Si vous savez déjà que vous l’aimez ou souhaitez l’emporter, choisissez le 10 ml ou sa version rechargeable lorsque la fiche la propose.'],
  ['Comment bien essayer un parfum ?', 'Vaporisez-le sur une zone de peau sans parfum et retrouvez-le au fil de la journée. Pour comparer deux compositions, essayez-les idéalement à des jours différents.'],
  ['Quand le prix de la livraison est-il affiché ?', 'Les frais dépendent de la destination et du montant après remise. Le montant final est présenté sur Stripe avant que vous validiez le paiement.'],
]

export default async function Home() {
  const list = await products()
  const featured = featuredSlugs.flatMap(slug => list.filter(item => item.slug === slug))
  const selection = [...featured, ...list.filter(item => !featuredSlugs.includes(item.slug))].slice(0, 4)
  const houses = ['Amouage', 'Frédéric Malle', 'Acqua di Parma', 'Louis Vuitton', 'Tom Ford']
  return <main className="boutique">
    <section className="shop-hero">
      <div className="shop-hero-copy">
        <span className="shop-kicker">Parfumerie de niche en décants</span>
        <h1>Le parfum se<br className="desktop-break"/> choisit <em>sur peau.</em></h1>
        <p>Portez les créations d’Amouage, de Frédéric Malle et d’autres grandes maisons avant de choisir votre prochain flacon. En 5 ml, 10 ml ou 10 ml rechargeable.</p>
        <div className="shop-hero-actions">
          <Link className="shop-button" href="/catalogue">Découvrir la collection</Link>
          <Link className="shop-text-link" href="#formats">Choisir mon format</Link>
        </div>
      </div>
      <figure className="shop-hero-photo">
        <CollectionPhoto file="hero" alt="Flacons Amouage Silver Oud et Oud Ulya, photographiés dans la collection" sizes="(max-width: 720px) 100vw, 53vw" position="50% 31%" priority/>
        <figcaption><span>Dans la collection</span><strong>Amouage</strong></figcaption>
      </figure>
    </section>

    <div className="shop-benefits">
      <div><Droplets size={19} strokeWidth={1.5}/> Prélevé du flacon d’origine</div>
      <div><ScanLine size={19} strokeWidth={1.5}/> Trois formats à découvrir</div>
      <div><ShoppingBag size={19} strokeWidth={1.5}/> Paiement sécurisé avec Stripe</div>
    </div>

    <section className="shop-section shop-shell" aria-labelledby="selection">
      <div className="shop-section-head">
        <div><span className="shop-kicker">La sélection</span><h2 id="selection">Par où commencer ?</h2><p>Quatre pistes pour découvrir la collection sur peau.</p></div>
        <Link href="/catalogue" className="shop-text-link">Tous les parfums</Link>
      </div>
      {selection.length ? <div className="shop-grid">{selection.map(product => <ProductCard key={product.id} product={product}/>)}</div>
        : <div className="shop-empty"><p>La sélection est momentanément indisponible.</p><Link href="/catalogue" className="shop-text-link">Ouvrir le catalogue</Link></div>}
    </section>

    <section className="house-band" aria-label="Les maisons">
      <div className="shop-shell house-band-inner">{houses.map(house => <Link key={house} href={`/catalogue?maison=${encodeURIComponent(house)}`}>{house}</Link>)}</div>
    </section>

    <section className="shop-shell shop-section format-editorial" id="formats">
      <figure className="format-photo">
        <CollectionPhoto file="amouage-collection" alt="Plusieurs flacons Amouage réunis dans la collection" sizes="(max-width: 720px) 100vw, 48vw" position="center 65%"/>
        <figcaption>Les flacons de notre sélection Amouage</figcaption>
      </figure>
      <div>
        <span className="shop-kicker">Le guide des décants</span>
        <h2>Quelques millilitres.<br/><em>Plusieurs façons de porter.</em></h2>
        <p>Un décant, c’est le parfum du flacon d’origine, transvasé dans un vaporisateur de plus petite contenance. Voici comment choisir le vôtre.</p>
        <dl className="format-list">{formatGuide.map(format => <div key={format.volume}><dt>{format.volume}</dt><dd><strong>{format.title}</strong><p>{format.text}</p></dd></div>)}</dl>
      </div>
    </section>

    <section className="shop-feature">
      <div className="shop-feature-image"><CollectionPhoto file="amouage-atelier" alt="Silver Oud et Oud Ulya parmi les coffrets Amouage" sizes="(max-width: 720px) 100vw, 50vw" position="50% 60%"/></div>
      <div className="shop-feature-copy"><span className="shop-kicker">Portrait de maison</span><h2>Amouage, <em>à votre rythme.</em></h2><p>Commencez par le profil frais de Decision ou explorez le registre plus sombre de Silver Oud. Portez-les séparément, puis revenez à celui qui vous intrigue encore.</p><Link className="shop-button shop-button-cream" href="/catalogue?maison=Amouage">Explorer Amouage</Link></div>
    </section>

    <section className="shop-shell shop-section shop-faq" id="questions">
      <div><span className="shop-kicker">Avant de choisir</span><h2>Vos questions</h2></div>
      <div>{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </section>
  </main>
}
