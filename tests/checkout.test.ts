import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { checkoutSchema,normalizeCart,shippingCents } from '../lib/checkout'
import { matchesPaidSession } from '../lib/payment'
const id='123e4567-e89b-42d3-a456-426614174000'
test('the checkout rejects malformed quantities and shipping destinations',()=>{
 const base={items:[{variant_id:id,quantity:1}],email:'client@example.com',customer_name:'Client Exemple',address:{line1:'1 Rue Exemple',city:'Sion',postal_code:'1950',country:'CH'}}
 assert.equal(checkoutSchema.safeParse(base).success,true)
 assert.equal(checkoutSchema.safeParse({...base,items:[{variant_id:id,quantity:-1}]}).success,false)
 assert.equal(checkoutSchema.safeParse({...base,address:{...base.address,country:'XX'}}).success,false)
})
test('cart normalization merges lines and blocks bypassing item quantity limits',()=>{
 assert.deepEqual(normalizeCart([{variant_id:id,quantity:2},{variant_id:id,quantity:3}]),[{variant_id:id,quantity:5}])
 assert.throws(()=>normalizeCart([{variant_id:id,quantity:15},{variant_id:id,quantity:10}]))
})
test('delivery threshold is computed after discount by the server contract',()=>{
 assert.equal(shippingCents(15000,'CH'),0)
 assert.equal(shippingCents(14999,'CH'),790)
 assert.equal(shippingCents(15000,'FR'),1290)
})
test('fulfillment rejects mismatched order, session, amount, currency and unpaid state',()=>{
 const order={id, total_cents:3270,stripe_session_id:'cs_test_123'}
 const session={id:'cs_test_123',metadata:{order_id:id},amount_total:3270,currency:'chf',payment_status:'paid',status:'complete'}
 assert.equal(matchesPaidSession(order,session),true)
 assert.equal(matchesPaidSession(order,{...session,amount_total:1}),false)
 assert.equal(matchesPaidSession(order,{...session,metadata:{order_id:'other'}}),false)
 assert.equal(matchesPaidSession(order,{...session,payment_status:'unpaid'}),false)
 assert.equal(matchesPaidSession(order,{...session,status:'expired'}),false)
 assert.equal(matchesPaidSession(order,{...session,currency:'eur'}),false)
 assert.equal(matchesPaidSession(order,{...session,id:'cs_test_other'}),false)
})
