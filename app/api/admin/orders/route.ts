import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminRequest } from '@/lib/admin-api'
import { service } from '@/lib/supabase'
import { deliverEmail } from '@/lib/email'
export async function PATCH(req:Request){return adminRequest(req,async()=>{
 const b=z.object({id:z.uuid(),status:z.enum(['packing','shipped']),tracking_number:z.string().max(100).nullable().optional(),tracking_url:z.url().nullable().optional()}).parse(await req.json())
 const db=service();const {data:old}=await db.from('orders').select('*').eq('id',b.id).single()
 if(!old || !['paid','packing','shipped'].includes(old.status)) throw new Error('Commande non payée')
 if(b.status==='packing' && old.status==='shipped') throw new Error('Commande déjà expédiée')
 const {data,error}=await db.from('orders').update({...b,shipped_at:b.status==='shipped'?new Date().toISOString():null}).eq('id',b.id).select('*').single()
 if(error)throw error
 if(b.status==='shipped' && old.status!=='shipped'){await db.from('email_jobs').upsert({order_id:b.id,kind:'shipped'},{onConflict:'order_id,kind'});await deliverEmail(data,'shipped')}
 return NextResponse.json(data)
})}
