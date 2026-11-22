import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import '@fontsource-variable/inter'
import './globals.css'
import './boutique.css'
import Link from 'next/link'
import type { Metadata } from 'next'
import { service } from '@/lib/supabase'
import { StoreNav } from '@/components/store-nav'

export const metadata: Metadata = {
  title: { default: 'Olfactive Collection | Décants de parfums de niche', template: '%s | Olfactive Collection' },
  description: 'Explorez la parfumerie de niche sur votre peau. Une collection de décants en 5 ml, 10 ml et 10 ml rechargeable, selon le parfum.',
}
export const dynamic = 'force-dynamic'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { data: settings } = process.env.SUPABASE_SECRET_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? await service().from('site_settings').select('brand_name,announcement,contact_email').eq('id', 1).single()
    : { data: null }
  const brand = settings?.brand_name || 'Olfactive Collection'
  const announcement = settings?.announcement?.trim()
  return <html lang="fr"><body>
    <a className="skip-link" href="#contenu">Aller au contenu</a>
    <div className="shop-announcement">{announcement && announcement !== 'L’art du parfum, à votre mesure.' ? announcement : 'Décants de parfums de niche · 5 ml, 10 ml et 10 ml rechargeable'}</div>
    <StoreNav brand={brand}/>
    <div id="contenu" tabIndex={-1}>{children}</div>
    <footer className="shop-footer">
      <div className="shop-shell">
        <div className="shop-footer-grid">
          <div><Link href="/" className="footer-signature">{brand}</Link><p>Des parfums à essayer sur peau,<br/>des favoris à garder près de soi.</p></div>
          <div><h2>Explorer</h2><Link href="/catalogue">Tous les parfums</Link><Link href="/catalogue?maison=Amouage">La sélection Amouage</Link></div>
          <div><h2>Votre commande</h2><Link href="/#formats">Choisir son format</Link><Link href="/#questions">Questions fréquentes</Link><Link href="/panier">Voir le panier</Link>{settings?.contact_email && <a href={`mailto:${settings.contact_email}`}>Nous écrire</a>}</div>
        </div>
        <div className="shop-footer-bottom"><span>© {new Date().getFullYear()} {brand}</span><span>Parfumerie de niche · Prix en CHF</span></div>
      </div>
    </footer>
  </body></html>
}
