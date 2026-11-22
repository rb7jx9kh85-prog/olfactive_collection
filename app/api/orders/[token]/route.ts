import { NextResponse } from 'next/server'
import { service } from '@/lib/supabase'
export async function GET(_:Request,{params}:{params:Promise<{token:string}>}) {
 const {token}=await params
 if(!/^[a-f0-9-]{36}$/i.test(token)) return new NextResponse('Not found',{status:404})
 const {data}=await service().from('orders').select('id,public_token,status,subtotal_cents,discount_cents,shipping_cents,total_cents,currency,tracking_number,tracking_url,created_at,order_items(product_name,house,ml,refillable,quantity,unit_price_cents)').eq('public_token',token).maybeSingle()
 if(!data) return new NextResponse('Not found',{status:404})
 return NextResponse.json(data,{headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}})
}
