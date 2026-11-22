import { NextResponse } from 'next/server'
import { requireAdmin } from './supabase'
export async function adminRequest(request:Request,handler:()=>Promise<Response>) {
  if(!await requireAdmin()) return NextResponse.json({error:'Accès refusé'},{status:403})
  const origin=request.headers.get('origin')
  if(origin && new URL(origin).host!==request.headers.get('host')) return NextResponse.json({error:'Origine invalide'},{status:403})
  try{return await handler()}catch(e){console.error(e);return NextResponse.json({error:e instanceof Error?e.message:'Opération impossible'},{status:400})}
}
