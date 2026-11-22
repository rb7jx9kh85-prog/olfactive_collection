import { service } from '@/lib/supabase'
import { AdminStock } from '@/components/admin-stock'
export default async function Page(){const db=service();const [{data:p},{data:l},{data:m}]=await Promise.all([db.from('products').select('id,name,house'),db.from('lots').select('*').order('received_at',{ascending:false}),db.from('inventory_movements').select('*').order('created_at',{ascending:false}).limit(100)]);return <AdminStock products={p||[]} lots={l||[]} movements={m||[]}/>}
