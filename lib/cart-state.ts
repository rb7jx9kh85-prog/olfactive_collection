'use client'
import { useSyncExternalStore } from 'react'
import type { CartLine } from './types'

const key = 'olfactive-cart'
const event = 'cart-update'
const empty = '[]'

function read() {
  try { return localStorage.getItem(key) ?? empty }
  catch { return empty }
}

function subscribe(callback: () => void) {
  window.addEventListener(event, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(event, callback)
    window.removeEventListener('storage', callback)
  }
}

export function cartLines(): CartLine[] {
  return parse(read())
}

function parse(value: string): CartLine[] {
  try {
    const lines = JSON.parse(value)
    return Array.isArray(lines)
      ? lines.filter(line => line && typeof line.variant_id === 'string' && Number.isInteger(line.quantity) && line.quantity > 0)
      : []
  } catch { return [] }
}

export function useCart() {
  return parse(useSyncExternalStore(subscribe, read, () => empty))
}

export function saveCart(lines: CartLine[]) {
  localStorage.setItem(key, JSON.stringify(lines))
  window.dispatchEvent(new Event(event))
}
