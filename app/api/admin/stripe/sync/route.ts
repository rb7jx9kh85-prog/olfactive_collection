import { NextResponse } from 'next/server'
import { adminRequest } from '@/lib/admin-api'
import { syncStripeCatalog } from '@/lib/stripe-catalog'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  return adminRequest(request, async () => NextResponse.json(await syncStripeCatalog()))
}
