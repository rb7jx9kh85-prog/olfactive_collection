import { Resend } from 'resend'
import type { Order } from './types'
import { service } from './supabase'
export async function sendOrderEmail(order:Order,kind:'paid'|'shipped') {
  if(!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) throw new Error('Resend non configuré')
  const title=kind==='paid'?'Commande confirmée':'Votre commande est expédiée'
  const details=kind==='paid'?`Merci pour votre commande. Référence : ${order.id.slice(0,8)}.`:`Suivi : ${order.tracking_number || 'en cours'}${order.tracking_url?' — '+order.tracking_url:''}`
  const base=process.env.NEXT_PUBLIC_SITE_URL
  const {error}=await new Resend(process.env.RESEND_API_KEY).emails.send({from:process.env.RESEND_FROM_EMAIL,to:order.email,subject:`${title} · Olfactive Collection`,html:`<div style="font:16px Georgia,serif;color:#26231f;padding:32px"><h1>${title}</h1><p>${details.replaceAll('&','&amp;').replaceAll('<','&lt;')}</p><p><a href="${base}/commande/${order.public_token}">Suivre ma commande</a></p></div>`})
  if(error) throw error
}

export async function deliverEmail(order:Order,kind:'paid'|'shipped') {
 const db=service()
 const {data:job}=await db.from('email_jobs').select('sent_at,attempts').eq('order_id',order.id).eq('kind',kind).maybeSingle()
 if(!job || job.sent_at)return
 try {
  if(!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) throw new Error('Resend non configuré')
  await sendOrderEmail(order,kind)
  const {error:markError}=await db.from('email_jobs').update({sent_at:new Date().toISOString(),last_error:null,attempts:job.attempts+1}).eq('order_id',order.id).eq('kind',kind).is('sent_at',null)
  if(markError) throw markError
 } catch(e) {
  await db.from('email_jobs').update({last_error:e instanceof Error?e.message.slice(0,500):'Erreur',attempts:job.attempts+1}).eq('order_id',order.id).eq('kind',kind)
  console.error('email delivery',order.id,kind,e)
 }
}
