import { service } from '@/lib/supabase'
import { AdminOrders } from '@/components/admin-orders'
export default async function Page(){const {data}=await service().from('orders').select('*,order_items(product_name,house,ml,quantity,unit_price_cents)').order('created_at',{ascending:false}).limit(100);return <AdminOrders initial={data||[]}/>}
