import { products } from '@/lib/store'
import { Cart } from '@/components/cart'
export const dynamic='force-dynamic'
export default async function Page(){return <Cart products={await products()}/>}
