import { createClient } from '@supabase/supabase-js'
import type { Product } from './types'
export async function products():Promise<Product[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return []
  const {data,error}=await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).from('products').select('*, variants:product_variants(*)').eq('active',true).order('created_at',{ascending:false})
  if(error) throw error
  return (data || []).map(p=>({...p,variants:p.variants.filter((v:{active:boolean})=>v.active).sort((a:{ml:number},b:{ml:number})=>a.ml-b.ml)})) as Product[]
}
