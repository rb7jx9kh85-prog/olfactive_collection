import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminRequest } from '@/lib/admin-api'
import { service } from '@/lib/supabase'
export async function POST(req:Request){return adminRequest(req,async()=>{
 const b=z.object({lot_id:z.uuid(),delta:z.number().int().refine(x=>x!==0),note:z.string().trim().min(3)}).parse(await req.json())
 const {data,error}=await service().rpc('adjust_lot',{p_id:b.lot_id,p_delta:b.delta,p_note:b.note})
 if(error)throw error;return NextResponse.json(data)
})}
