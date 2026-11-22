import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Supabase non configuré')
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
}
export async function sessionClient() {
  const jar=await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{
    cookies:{getAll:()=>jar.getAll(),setAll:items=>{try{items.forEach(({name,value,options})=>jar.set(name,value,options))}catch{ /* Server Components cannot write cookies. */ }}}
  })
}
export async function requireAdmin() {
  const client=await sessionClient()
  const {data:{user}}=await client.auth.getUser()
  if(!user) return null
  const {data}=await service().from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle()
  return data ? user : null
}
