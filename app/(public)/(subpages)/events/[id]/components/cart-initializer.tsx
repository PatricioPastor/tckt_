"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart-store";

type CartInitializerProps = {
  eventId: number;
};

export function CartInitializer({ eventId }: CartInitializerProps) {
  const { eventId: currentEventId, setEventId, clearCart } = useCartStore();

  useEffect(() => {
    // Si el eventId cambió, limpiar el carrito
    if (currentEventId !== null && currentEventId !== eventId) {
      clearCart();
    }
    setEventId(eventId);
  }, [eventId, currentEventId, setEventId, clearCart]);

  return null;
}
