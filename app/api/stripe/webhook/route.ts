import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { service } from '@/lib/supabase'
import { deliverEmail } from '@/lib/email'
import type Stripe from 'stripe'
import { matchesPaidSession } from '@/lib/payment'
export const runtime='nodejs'
export async function POST(request:NextRequest) {
  const sig=request.headers.get('stripe-signature')
  if(!sig || !process.env.STRIPE_WEBHOOK_SECRET) return new NextResponse('Signature absente',{status:400})
  let event:Stripe.Event
  try { event=stripe().webhooks.constructEvent(await request.text(),sig,process.env.STRIPE_WEBHOOK_SECRET) }
  catch { return new NextResponse('Signature invalide',{status:400}) }
  if(!['checkout.session.completed','checkout.session.expired'].includes(event.type)) return NextResponse.json({received:true})
  const session=event.data.object as Stripe.Checkout.Session
  const id=session.metadata?.order_id
  if(!id) return new NextResponse('Commande absente',{status:400})
  const db=service()
  const {data:order}=await db.from('orders').select('id,status,stripe_session_id,total_cents').eq('id',id).maybeSingle()
  if(!order || (order.stripe_session_id && order.stripe_session_id!==session.id)) return new NextResponse('Session incohérente',{status:400})
  try {
    if(event.type==='checkout.session.completed') {
      if(!matchesPaidSession(order,session)) return new NextResponse('Paiement non confirmé',{status:400})
      const {data:changed,error}=await db.rpc('confirm_order',{p_order_id:id,p_session_id:session.id,p_payment_intent:typeof session.payment_intent==='string'?session.payment_intent:null,p_amount:session.amount_total,p_event_id:event.id})
      if(error) throw error
      if(changed){const {data:full}=await db.from('orders').select('*').eq('id',id).single(); if(full) await deliverEmail(full,'paid')}
    } else {
      const {error}=await db.rpc('release_order',{p_order_id:id,p_event_id:event.id})
      if(error) throw error
    }
    return NextResponse.json({received:true})
  } catch(e){console.error('stripe webhook',e);return new NextResponse('Traitement échoué',{status:500})}
}
