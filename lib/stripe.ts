import Stripe from 'stripe'
export function stripe() { if(!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) throw new Error('Stripe doit utiliser une clé de test'); return new Stripe(process.env.STRIPE_SECRET_KEY) }
