"use client";

import { useCartStore } from "@/lib/store/cart-store";
import { ItemFromCart } from "./item/item";

export const ItemsCart = () => {
  const { items, updateQuantity } = useCartStore();

  const handleQuantityChange = (type: string, delta: number) => {
    const item = items.find((i) => i.code === type);
    if (!item) return;
    const next = item.quantity + delta;
    updateQuantity(type, next, item.price, item.maxStock);
  };

  return (
    <section className="space-y-3">
      <h2 className="text-base font-medium tracking-tight text-neutral-100">Tus entradas</h2>
      <div className="rounded-lg border border-neutral-800 bg-[#0E0E0E]">
        {items.map((item, idx) => (
          <div key={item.code} className={idx > 0 ? "border-t border-neutral-800" : undefined}>
            <ItemFromCart item={item} handleQuantityChange={handleQuantityChange} />
          </div>
        ))}
      </div>
    </section>
  );
};
