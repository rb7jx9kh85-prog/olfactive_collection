import { OrderStatus } from '@/components/order-status'
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;return <OrderStatus token={token}/>}
