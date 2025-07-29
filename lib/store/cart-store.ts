import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  type: 'general' | 'vip' | 'ultra' | 'free';
  quantity: number;
  price: number;
  maxStock: number;
}

interface CartState {
  eventId: number | null;
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (type: CartItem['type'], newQty: number, price: number, maxStock: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  setEventId: (eventId: number) => void;
  checkout: () => Promise<void>; // New: Save to DB
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      eventId: null,
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.type === item.type);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.type === item.type ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.maxStock) } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, maxStock: item.maxStock }] });
        }
      },
      updateQuantity: (type, newQty, price, maxStock) => {
        const items = [...get().items];
        const index = items.findIndex((i) => i.type === type);
        const clampedQty = Math.max(0, Math.min(newQty, maxStock));

        if (index > -1) {
          if (clampedQty === 0) {
            items.splice(index, 1);
          } else {
            items[index].quantity = clampedQty;
            items[index].maxStock = maxStock;
          }
        } else if (clampedQty > 0) {
          items.push({ type, quantity: clampedQty, price, maxStock });
        }

        set({ items });
      },
      clearCart: () => set({ items: [], eventId: null }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      setEventId: (eventId) => set({ eventId }),
      checkout: async () => {
        const { eventId, items } = get();
        if (!eventId || items.length === 0) return;

        try {
          const res = await fetch('/api/tickets/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ eventId, selections: items.map(item => ({
              type: item.type,
              quantity: item.quantity,
            })) }),
          });
          if (!res.ok) throw new Error('Checkout failed');
          const data = await res.json();
          set({ items: [], eventId: null }); // Clear cart on success
          // Redirect or handle data (e.g., MP init_point)
        } catch (err) {
          console.error(err);
        }
      },
    }),
    { name: 'cart-storage' }
  )
);