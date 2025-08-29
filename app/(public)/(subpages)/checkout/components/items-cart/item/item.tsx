"use client";

import { IconMinus, IconPlus } from "@tabler/icons-react";
import { CartItem } from "@/lib/store/cart-store";

export function ItemFromCart({
  item,
  handleQuantityChange,
}: {
  item: CartItem;
  handleQuantityChange: (type: string, delta: number) => void;
}) {
  const canDec = item.quantity > 0;
  const canInc = item.quantity < item.maxStock;

  // Mapear tipo a nombre legible
  const getTicketName = (type: string) => {
    const names: Record<string, string> = {
      general: "Entrada General",
      vip: "Entrada VIP", 
      ultra: "Entrada Ultra",
      free: "Entrada Gratuita"
    };
    return names[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-medium text-neutral-100">
            {getTicketName(item.code)}
          </div>
          {item.price === 0 && (
            <span className="rounded-full border border-emerald-800 bg-emerald-900/30 px-2 py-0.5 text-[11px] text-emerald-400">
              Gratuita
            </span>
          )}
        </div>
        <div className="mt-1 text-sm font-semibold text-neutral-100">
          ${item.price.toLocaleString("es-AR")}
        </div>
      </div>

      <div className="ml-4 flex items-center gap-2">
        <button
          onClick={() => canDec && handleQuantityChange(item.code, -1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-[#111] text-neutral-300 hover:bg-[#151515] disabled:opacity-40 transition-colors"
          disabled={!canDec}
          aria-label="Restar"
        >
          <IconMinus size={16} />
        </button>
        <div className="w-6 text-center text-sm font-medium tabular-nums text-neutral-200">{item.quantity}</div>
        <button
          onClick={() => canInc && handleQuantityChange(item.code, 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-[#111] text-neutral-300 hover:bg-[#151515] disabled:opacity-40 transition-colors"
          disabled={!canInc}
          aria-label="Sumar"
        >
          <IconPlus size={16} />
        </button>
      </div>
    </div>
  );
}
