import { service } from '@/lib/supabase'
import { AdminProducts } from '@/components/admin-products'
import { StripeSync } from '@/components/stripe-sync'
export default async function Page(){const db=service();const {data}=await db.from('products').select('*,variants:product_variants(*)').order('created_at',{ascending:false});return <><StripeSync/><AdminProducts initial={data||[]}/></>}
