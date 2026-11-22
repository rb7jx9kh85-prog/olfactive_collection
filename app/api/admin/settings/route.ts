import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminRequest } from '@/lib/admin-api'
import { service } from '@/lib/supabase'
export async function POST(req:Request){return adminRequest(req,async()=>{
 const b=z.object({brand_name:z.string().trim().min(2),announcement:z.string().trim().max(160),contact_email:z.union([z.email(),z.literal('')])}).parse(await req.json())
 const {data,error}=await service().from('site_settings').update({...b,updated_at:new Date().toISOString()}).eq('id',1).select().single()
 if(error)throw error;return NextResponse.json(data)
})}
