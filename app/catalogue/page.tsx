import { products } from '@/lib/store'
import { Catalogue } from '@/components/catalogue'
export const dynamic='force-dynamic'
export default async function Page(){return <main className="container"><div className="catalogue-head"><span className="eyebrow">L’univers olfactif</span><h1 className="page-title">La collection</h1><p className="muted">Des créations singulières à porter, explorer et faire siennes.</p></div><Catalogue products={await products()}/></main>}
