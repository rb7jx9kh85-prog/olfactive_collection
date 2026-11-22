import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminRequest } from '@/lib/admin-api'
import { service } from '@/lib/supabase'
export async function PATCH(req:Request){return adminRequest(req,async()=>{
 const b=z.object({id:z.uuid(),full_name:z.string().trim().min(2),phone:z.string().trim().max(40).nullable(),notes:z.string().trim().max(2000)}).parse(await req.json())
 const {data,error}=await service().from('customers').update(b).eq('id',b.id).select().single()
 if(error)throw error;return NextResponse.json(data)
})}
