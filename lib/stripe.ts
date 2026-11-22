import Stripe from 'stripe'
export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY
  const mode = process.env.STRIPE_MODE || (key?.startsWith('sk_live_') ? 'live' : 'test')
  if (!key || !['sk_test_', 'sk_live_'].some(prefix => key.startsWith(prefix))) throw new Error('Clé Stripe absente ou invalide')
  if (mode === 'live' && !key.startsWith('sk_live_')) throw new Error('STRIPE_MODE=live exige une clé sk_live_')
  if (mode === 'test' && !key.startsWith('sk_test_')) throw new Error('STRIPE_MODE=test exige une clé sk_test_')
  return new Stripe(key)
}
