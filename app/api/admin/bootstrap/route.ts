import { NextResponse } from 'next/server'
import { z } from 'zod'
import { timingSafeEqual,createHash } from 'node:crypto'
import { service } from '@/lib/supabase'
export const runtime='nodejs'
export async function POST(req:Request){
 const configured=process.env.ADMIN_SETUP_TOKEN
 if(!configured || configured.length<32) return NextResponse.json({error:'Initialisation désactivée'},{status:403})
 try{
  const {token,email,password}=z.object({token:z.string(),email:z.email(),password:z.string().min(14).max(128)}).parse(await req.json())
  const a=createHash('sha256').update(token).digest(),b=createHash('sha256').update(configured).digest()
  if(!timingSafeEqual(a,b)) return NextResponse.json({error:'Code invalide'},{status:403})
  const db=service()
  const {count}=await db.from('admin_users').select('user_id',{count:'exact',head:true})
  if(count!==0) return NextResponse.json({error:'Administrateur déjà créé'},{status:403})
  const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true})
  if(error || !data.user) throw error || new Error('Création impossible')
  const {data:created,error:roleError}=await db.rpc('bootstrap_admin',{p_user_id:data.user.id})
  if(roleError || !created){await db.auth.admin.deleteUser(data.user.id);throw roleError||new Error('Administrateur déjà créé')}
  return NextResponse.json({ok:true})
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Initialisation impossible'},{status:400})}
}
