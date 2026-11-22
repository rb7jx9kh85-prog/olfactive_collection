import { service } from '@/lib/supabase'
import { AdminClients } from '@/components/admin-clients'
export default async function Page(){const {data}=await service().from('customers').select('*').order('last_order_at',{ascending:false}).limit(250);return <AdminClients initial={data||[]}/>}
