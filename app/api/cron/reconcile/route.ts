import { NextRequest,NextResponse } from 'next/server'
import { service } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { deliverEmail } from '@/lib/email'
import { matchesPaidSession } from '@/lib/payment'
export const runtime='nodejs'
export async function GET(request:NextRequest){
  if(!process.env.CRON_SECRET || request.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`) return new NextResponse('Unauthorized',{status:401})
  const db=service()
  const cutoff=new Date(Date.now()-35*60_000).toISOString()
  const {data:orders,error}=await db.from('orders').select('*').eq('status','pending').lt('created_at',cutoff).limit(50)
  if(error) return new NextResponse('Database error',{status:500})
  let processed=0
  for(const order of orders || []) {
    try {
      if(!order.stripe_session_id){await db.rpc('release_order',{p_order_id:order.id});processed++;continue}
      let session=await stripe().checkout.sessions.retrieve(order.stripe_session_id)
      if(session.status==='open') session=await stripe().checkout.sessions.expire(session.id)
      if(matchesPaidSession(order,session)) {
        const {data:changed,error:confirmError}=await db.rpc('confirm_order',{p_order_id:order.id,p_session_id:session.id,p_payment_intent:typeof session.payment_intent==='string'?session.payment_intent:null,p_amount:session.amount_total,p_event_id:`reconcile:${session.id}`})
        if(confirmError) throw confirmError
        if(changed) await deliverEmail(order,'paid')
      } else if(session.status==='expired') { const {error:releaseError}=await db.rpc('release_order',{p_order_id:order.id});if(releaseError)throw releaseError }
      processed++
    } catch(e){console.error('reconcile',order.id,e)}
  }
  const {data:jobs}=await db.from('email_jobs').select('order_id,kind').is('sent_at',null).order('created_at').limit(30)
  for(const job of jobs||[]){const {data:order}=await db.from('orders').select('*').eq('id',job.order_id).maybeSingle();if(order)await deliverEmail(order,job.kind as 'paid'|'shipped')}
  return NextResponse.json({processed,emails:jobs?.length||0})
}
