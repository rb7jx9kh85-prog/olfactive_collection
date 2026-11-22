import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminRequest } from '@/lib/admin-api'
import { service } from '@/lib/supabase'
export async function POST(req:Request){return adminRequest(req,async()=>{
 const b=z.object({id:z.uuid().optional(),code:z.string().trim().min(3).max(32),percent_off:z.number().int().min(1).max(100),max_uses:z.number().int().positive().nullable().optional(),expires_at:z.iso.datetime().nullable().optional(),active:z.boolean()}).parse(await req.json())
 const {data,error}=await service().from('promo_codes').upsert({...b,code:b.code.toUpperCase()}).select().single()
 if(error)throw error;return NextResponse.json(data)
})}
