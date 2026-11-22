import { service } from '@/lib/supabase'
import { AdminSettings } from '@/components/admin-settings'
export default async function Page(){const {data}=await service().from('site_settings').select('*').eq('id',1).single();return <AdminSettings initial={data||{brand_name:'Olfactive Collection',announcement:'',contact_email:''}}/>}
