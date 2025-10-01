import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  code: string        // identificador lógico del ticketType (p.ej. "tier1")
  label: string       // visible en UI (p.ej. "TIER 1")
  price: number       // en ARS
  quantity: number
  maxStock: number    // stock disponible para este tipo
}

interface CartState {
  eventId: number | null
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateQuantity: (code: CartItem['code'], newQty: number, price: number, maxStock: number) => void
  clearCart: () => void
  getTotal: () => number
  getFreeItems: () => CartItem[]
  getPaidItems: () => CartItem[]
  hasFreeTickets: () => boolean
  hasPaidTickets: () => boolean
  setEventId: (eventId: number) => void
  checkout: () => Promise<{ success: boolean; data?: unknown; error?: string }>
  checkoutFree: (sendEmail?: boolean) => Promise<{ success: boolean; data?: unknown; error?: string }>
  persistToLocalStorage: () => void
  loadFromLocalStorage: () => void
}

const cartStore = (
  set: (partial: Partial<CartState> | ((state: CartState) => Partial<CartState>)) => void,
  get: () => CartState
): CartState => ({
  eventId: null,
  items: [],

      addItem: (item: CartItem) => {
        const items = [...get().items]
        const idx = items.findIndex(i => i.code === item.code)
        if (idx > -1) {
          const nextQty = Math.min(items[idx].quantity + item.quantity, item.maxStock)
          items[idx] = { ...items[idx], quantity: nextQty, price: item.price, maxStock: item.maxStock }
        } else {
          items.push(item)
        }
        set({ items })
      },

      updateQuantity: (code: string, newQty: number, price: number, maxStock: number) => {
        const items = [...get().items]
        const idx = items.findIndex(i => i.code === code)
        const clamped = Math.max(0, Math.min(newQty, maxStock))

        if (idx > -1) {
          if (clamped === 0) {
            items.splice(idx, 1)
          } else {
            items[idx] = { ...items[idx], quantity: clamped, price, maxStock }
          }
        } else if (clamped > 0) {
          // si no existía y hay qty>0, lo agregamos con label vacío (mejor pasar label real desde el caller)
          items.push({ code, label: code, price, quantity: clamped, maxStock })
        }

        set({ items })
      },

      clearCart: () => set({ items: [], eventId: null }),

      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getFreeItems: () => get().items.filter(i => i.price === 0),
      getPaidItems: () => get().items.filter(i => i.price > 0),

      hasFreeTickets: () => get().items.some(i => i.price === 0),
      hasPaidTickets: () => get().items.some(i => i.price > 0),

      setEventId: (eventId: number) => set({ eventId }),

      // Compra paga: envía selections por code
      checkout: async () => {
        const { eventId, items } = get()
        if (!eventId || items.length === 0) {
          return { success: false, error: 'Cart is empty or no event selected' }
        }

        try {
          const res = await fetch('/api/tickets/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId,
              selections: items
                .filter(i => i.price > 0)
                .map(i => ({ code: i.code, quantity: i.quantity }))
            })
          })

          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || 'Checkout failed')
          }

          const data = await res.json()
          set({ items: [], eventId: null }) // limpiar carrito al éxito
          return { success: true, data }
        } catch (e) {
          return { success: false, error: (e as Error).message }
        }
      },

      // Solo tickets gratis
      checkoutFree: async (sendEmail = false) => {
        const { eventId, getFreeItems } = get()
        const freeItems = getFreeItems()
        if (!eventId || freeItems.length === 0) {
          return { success: false, error: 'No free tickets in cart' }
        }

        try {
          const res = await fetch('/api/tickets/buy-free', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId,
              sendEmail,
              selections: freeItems.map(i => ({ code: i.code, quantity: i.quantity }))
            })
          })

          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || 'Free checkout failed')
          }

          const data = await res.json()

          // quitar solo los free del carrito
          const remaining = get().items.filter(i => i.price > 0)
          set({ items: remaining })

          return { success: true, data }
        } catch (e) {
          return { success: false, error: (e as Error).message }
        }
      },

      // helpers manuales (persist ya lo maneja igual)
      persistToLocalStorage: () => {
        const state = get()
        localStorage.setItem('cart-storage', JSON.stringify({
          state: { eventId: state.eventId, items: state.items },
          version: 0
        }))
      },

      loadFromLocalStorage: () => {
        try {
          const stored = localStorage.getItem('cart-storage')
          if (stored) {
            const { state } = JSON.parse(stored)
            set({ eventId: state.eventId ?? null, items: state.items ?? [] })
          }
        } catch (err) {
          console.error('Failed to load cart from localStorage:', err)
        }
      }
    })

export const useCartStore = create<CartState>()(
  persist(cartStore as any, {
    name: 'cart-storage',
    // Evita hydration mismatch: solo hidrata después del montaje en cliente
    skipHydration: typeof window === 'undefined',
  })
)
