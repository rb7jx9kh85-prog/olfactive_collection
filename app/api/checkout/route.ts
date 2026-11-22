import { NextRequest, NextResponse } from 'next/server'
import { checkoutSchema, normalizeCart } from '@/lib/checkout'
import { service } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
export const runtime='nodejs'
export async function POST(request:NextRequest) {
  try {
    const parsed=checkoutSchema.parse(await request.json())
    const items=normalizeCart(parsed.items)
    const db=service()
    const {data:order,error}=await db.rpc('reserve_order',{p_items:items,p_email:parsed.email,p_name:parsed.customer_name,p_address:parsed.address,p_promo:parsed.promo_code || null})
    if(error || !order) return NextResponse.json({error:error?.message || 'Stock indisponible'},{status:400})
    try {
      const {data:lines,error:lineError}=await db.from('order_items').select('*').eq('order_id',order.id)
      if(lineError || !lines?.length) throw new Error('Commande incomplète')
      const base=process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/,'')
      if(!base) throw new Error('URL du site non configurée')
      // Stripe charges the exact server-verified total; order lines are recorded separately.
      const session=await stripe().checkout.sessions.create({mode:'payment',customer_email:order.email,locale:'fr',payment_method_types:['card'],line_items:[{price_data:{currency:'chf',product_data:{name:'Commande Olfactive Collection'},unit_amount:order.total_cents},quantity:1}],metadata:{order_id:order.id},success_url:`${base}/commande/${order.public_token}?paiement=retour`,cancel_url:`${base}/panier?annule=1`,expires_at:Math.floor(Date.now()/1000)+1860})
      const {error:updateError}=await db.from('orders').update({stripe_session_id:session.id}).eq('id',order.id).eq('status','pending')
      if(updateError) { await stripe().checkout.sessions.expire(session.id); throw updateError }
      return NextResponse.json({url:session.url})
    } catch(e) {
      await db.rpc('release_order',{p_order_id:order.id})
      throw e
    }
  } catch(e) { console.error('checkout',e); return NextResponse.json({error:e instanceof Error && !/key|secret|stripe/i.test(e.message)?e.message:'Paiement temporairement indisponible'},{status:400}) }
}
