import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminRequest } from '@/lib/admin-api'
import { service } from '@/lib/supabase'
const schema=z.object({id:z.uuid().optional(),slug:z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),house:z.string().trim().min(2),name:z.string().trim().min(2),description:z.string().default(''),notes:z.array(z.string()).default([]),image_url:z.url().nullable().optional(),active:z.boolean().default(false),variants:z.array(z.object({id:z.uuid().optional(),ml:z.number().int().min(1).max(100),price_cents:z.number().int().positive(),active:z.boolean().default(true)})).min(1)})
export async function POST(req:Request){return adminRequest(req,async()=>{
 const body=schema.parse(await req.json()); const db=service()
 const {variants,...p}=body
 const previous=body.id?(await db.from('product_variants').select('id,ml').eq('product_id',body.id)).data||[]:[]
 const {data,error}=await db.from('products').upsert({...p,updated_at:new Date().toISOString()}).select('id').single()
 if(error) throw error
 const {error:vError}=await db.from('product_variants').upsert(variants.map(v=>({...v,product_id:data.id})),{onConflict:'product_id,ml'})
 if(vError) throw vError
 const removed=previous.filter(old=>!variants.some(v=>v.ml===old.ml)).map(v=>v.id)
 if(removed.length){const {error:removeError}=await db.from('product_variants').update({active:false}).in('id',removed);if(removeError)throw removeError}
 return NextResponse.json({id:data.id})
})}
export async function DELETE(req:Request){return adminRequest(req,async()=>{
 const {id}=z.object({id:z.uuid()}).parse(await req.json());const db=service()
 const {error}=await db.from('products').update({active:false}).eq('id',id)
 if(error) throw error
 return NextResponse.json({ok:true})
})}
