import { service } from '@/lib/supabase'
import { AdminPromos } from '@/components/admin-promos'
export default async function Page(){const {data}=await service().from('promo_codes').select('*').order('code');return <AdminPromos initial={data||[]}/>}
