export type PaymentOrder={id:string;stripe_session_id:string|null;total_cents:number}
export type PaymentSession={id:string;metadata:Record<string,string>|null;amount_total:number|null;currency:string|null;payment_status:string;status:string|null}
export function matchesPaidSession(order:PaymentOrder,session:PaymentSession) {
 return session.metadata?.order_id===order.id && (!order.stripe_session_id || order.stripe_session_id===session.id) && session.amount_total===order.total_cents && session.currency==='chf' && session.payment_status==='paid' && session.status==='complete'
}
