"use client";

import { Minus, Plus, Ticket01, InfoCircle } from "@untitledui/icons";
import { useCartStore } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";
import { type ticketType as PrismaTicketType } from "@prisma/client";

type TicketType = {
  id:             number;
  eventId:        number;
  code:           string;
  label:          string;
  price:          string;
  stockMax:       number;
  stockCurrent:   number;
  userMaxPerType: number;
  scanExpiration: null;
  isVisible:      boolean;
  isDisabled:     boolean;
}


export function TicketCard({ ticketType }: { ticketType: TicketType }) {
  const { items, updateQuantity } = useCartStore();
  const quantity = items.find((i) => i.code === ticketType.code)?.quantity || 0;

  const isOutOfStock = ticketType.stockCurrent <= 0;
  const disabledDec = quantity <= 0;
  const disabledInc =
    quantity >= ticketType.userMaxPerType || quantity >= ticketType.stockCurrent;

  const isSelected = quantity > 0;

  const inc = () => {
    if (!disabledInc && !isOutOfStock) {
      updateQuantity(
        ticketType.code,
        quantity + 1,
        Number(ticketType.price),
        ticketType.stockCurrent
      );
    }
  };
  const dec = () => {
    if (!disabledDec) {
      updateQuantity(
        ticketType.code,
        quantity - 1,
        Number(ticketType.price),
        ticketType.stockCurrent
      );
    }
  };

  if (isOutOfStock) {
    return (
      <div className="w-full rounded-xl border border-neutral-800 bg-[#0E0E0E] p-4 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#141414]">
              <Ticket01 className="size-5 text-neutral-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-neutral-400">
                {ticketType.label.toUpperCase()}
              </h3>
              <p className="text-xs text-neutral-500">Agotado</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-semibold text-neutral-500">
              ${Number(ticketType.price).toLocaleString("es-AR")}
            </p>
            <p className="mt-1 text-xs text-neutral-600">Sin stock</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-xl border p-4 transition-all duration-200",
        isSelected
          ? "border-neutral-700 bg-[#0F0F0F] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]"
          : "border-neutral-800 bg-[#0E0E0E] hover:border-neutral-700"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
              isSelected ? "bg-neutral-100" : "bg-[#141414]"
            )}
          >
            <Ticket01
              className={cn(
                "size-5 transition-colors",
                isSelected ? "text-black" : "text-neutral-400"
              )}
            />
          </div> */}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold tracking-tight text-neutral-100">
              {ticketType.label.toUpperCase()}
            </h3>
            {/* <p className="truncate text-xs text-neutral-400">
              Recibís un QR válido hasta las 02:00
            </p>
            */}
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-neutral-500">
                Disponibles: {ticketType.stockCurrent}
              </span>
              {ticketType.userMaxPerType ? (
                <span className="text-xs text-neutral-500">
                  • Máx: {ticketType.userMaxPerType}
                </span>
              ) : null}
            </div> 
          </div>
        </div>

        {/* Precio + controles */}
        <div className="flex-shrink-0 text-right">
          <p className="font-mono text-lg font-semibold text-neutral-100">
            ${Number(ticketType.price).toLocaleString("es-AR")}
          </p>

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              onClick={dec}
              disabled={disabledDec}
              aria-label="Restar ticket"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                disabledDec
                  ? "cursor-not-allowed bg-[#151515] text-neutral-600"
                  : "bg-[#161616] text-neutral-200 hover:bg-[#1b1b1b] active:scale-95"
              )}
            >
              <Minus size={16} />
            </button>

            <div
              className={cn(
                "flex h-8 min-w-[2rem] items-center justify-center rounded-lg font-mono text-base font-bold transition-colors",
                isSelected
                  ? "bg-neutral-100 text-black"
                  : "bg-[#151515] text-neutral-300"
              )}
            >
              {quantity}
            </div>

            <button
              onClick={inc}
              disabled={disabledInc}
              aria-label="Sumar ticket"
              title={
                disabledInc
                  ? "Alcanzaste el máximo por usuario o stock disponible"
                  : undefined
              }
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                disabledInc
                  ? "cursor-not-allowed bg-[#151515] text-neutral-600"
                  : "bg-neutral-100 text-black hover:bg-neutral-200 active:scale-95"
              )}
            >
              <Plus size={16} />
            </button>
          </div>

          {isSelected && (
            <p className="mt-1 text-xs font-medium text-neutral-300">
              Subtotal:{" "}
              <span className="text-neutral-100">
                ${(Number(ticketType.price) * quantity).toLocaleString("es-AR")}
              </span>
            </p>
          )}

          {disabledInc && !isOutOfStock && (
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-neutral-500">
              <InfoCircle className="size-3.5" /> Máximo alcanzado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
