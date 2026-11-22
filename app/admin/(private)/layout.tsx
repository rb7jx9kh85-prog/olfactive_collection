import { requireAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
export const dynamic='force-dynamic'
export default async function Layout({children}:{children:React.ReactNode}){const admin=await requireAdmin();if(!admin)redirect('/admin/connexion');return <div className="admin-shell"><aside className="admin-side"><span className="eyebrow" style={{padding:'12px 10px'}}>Atelier</span>{[['/admin','Vue d’ensemble'],['/admin/produits','Produits'],['/admin/stocks','Stock & lots'],['/admin/commandes','Commandes'],['/admin/clients','Clients'],['/admin/promotions','Promotions'],['/admin/parametres','Paramètres']].map(([href,title])=><Link key={href} href={href}>{title}</Link>)}</aside><div className="admin-main">{children}</div></div>}
