import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminRequest } from '@/lib/admin-api'
import { service } from '@/lib/supabase'
export async function POST(req:Request){return adminRequest(req,async()=>{
 const b=z.object({product_id:z.uuid(),reference:z.string().trim().min(2),ml:z.number().int().positive(),cost_cents:z.number().int().nonnegative().nullable().optional()}).parse(await req.json())
 const {data,error}=await service().rpc('receive_lot',{p_product:b.product_id,p_reference:b.reference,p_ml:b.ml,p_cost:b.cost_cents??null})
 if(error)throw error;return NextResponse.json(data)
})}
