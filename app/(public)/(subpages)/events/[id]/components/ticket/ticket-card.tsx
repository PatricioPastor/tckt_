"use client";

import { Minus, Plus, Ticket01, InfoCircle } from "@untitledui/icons";
import { useCartStore } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


type TicketType = {
  id:                  number;
  eventId:             number;
  code:                string;
  label:               string;
  price:               string;
  stockMax:            number;
  stockCurrent:        number;
  userMaxPerType:      number;
  minPurchaseQuantity: number;
  scanExpiration:      null;
  isVisible:           boolean;
  isDisabled:          boolean;
}


export function TicketCard({ ticketType }: { ticketType: TicketType }) {
  const { items, updateQuantity } = useCartStore();
  const quantity = items.find((i) => i.code === ticketType.code)?.quantity || 0;

  const isOutOfStock = ticketType.stockCurrent <= 0;
  const isDisabled = ticketType.isDisabled;
  const disabledDec = quantity <= 0 || isDisabled;
  const disabledInc =
    quantity >= ticketType.userMaxPerType || quantity >= ticketType.stockCurrent || isDisabled;

  const isSelected = quantity > 0;

  const inc = () => {
    if (isDisabled || isOutOfStock) return;

    // Si estamos en 0 y hay un mínimo, agregamos directamente el mínimo
    if (quantity === 0 && ticketType.minPurchaseQuantity > 1) {
      // Validar que el mínimo no exceda el máximo por usuario
      if (ticketType.minPurchaseQuantity > ticketType.userMaxPerType) {
        toast.error(`Este combo requiere ${ticketType.minPurchaseQuantity} tickets pero el máximo por usuario es ${ticketType.userMaxPerType}`);
        return;
      }
      
      // Validar stock disponible
      if (ticketType.minPurchaseQuantity > ticketType.stockCurrent) {
        toast.error(`Este combo requiere ${ticketType.minPurchaseQuantity} tickets pero solo hay ${ticketType.stockCurrent} disponibles`);
        return;
      }

      updateQuantity(
        ticketType.code,
        ticketType.minPurchaseQuantity,
        Number(ticketType.price),
        ticketType.stockCurrent
      );
      if (ticketType.minPurchaseQuantity > 1) {
        toast.success(`Agregaste ${ticketType.minPurchaseQuantity} tickets (mínimo requerido)`);
      }
      return;
    }

    // Validar máximo por usuario
    if (quantity >= ticketType.userMaxPerType) {
      toast.error(`Máximo permitido: ${ticketType.userMaxPerType} tickets por usuario`);
      return;
    }

    // Validar stock disponible
    if (quantity >= ticketType.stockCurrent) {
      toast.error("No hay más stock disponible");
      return;
    }

    updateQuantity(
      ticketType.code,
      quantity + 1,
      Number(ticketType.price),
      ticketType.stockCurrent
    );
  };
  const dec = () => {
    if (!disabledDec && !isDisabled) {
      const newQuantity = quantity - 1;
      // Si baja por debajo del mínimo, poner en 0
      if (newQuantity > 0 && newQuantity < ticketType.minPurchaseQuantity) {
        toast.warning(`Este ticket requiere un mínimo de ${ticketType.minPurchaseQuantity} unidades`);
        updateQuantity(
          ticketType.code,
          0,
          Number(ticketType.price),
          ticketType.stockCurrent
        );
      } else {
        updateQuantity(
          ticketType.code,
          newQuantity,
          Number(ticketType.price),
          ticketType.stockCurrent
        );
      }
    }
  };

  if (isDisabled) {
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
              <p className="text-xs text-neutral-500">Desactivado</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-semibold text-neutral-500">
              ${Number(ticketType.price).toLocaleString("es-AR")}
            </p>
            <p className="mt-1 text-xs text-neutral-600">No disponible</p>
          </div>
        </div>
      </div>
    );
  }

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

  // Generar descripción basada en el tipo de ticket
  const getDescription = () => {
    if (ticketType.minPurchaseQuantity > 1) {
      return `Combo de ${ticketType.minPurchaseQuantity} entradas`;
    }
    return "Entrada individual";
  };

  const getLowStockWarning = () => {
    if (ticketType.stockCurrent <= 10 && ticketType.stockCurrent > 0) {
      return `¡Últimas ${ticketType.stockCurrent} disponibles!`;
    }
    return null;
  };

  return (
    <div
      className={cn(
        "w-full rounded-xl border transition-all duration-200",
        isSelected
          ? "border-neutral-600 bg-gradient-to-br from-[#111111] to-[#0A0A0A] shadow-lg"
          : "border-neutral-800 bg-[#0E0E0E] hover:border-neutral-700"
      )}
    >
      {/* Header con precio y badges */}
      <div className="flex items-start justify-between gap-4 p-4 pb-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              "text-base font-semibold tracking-tight leading-tight",
              isSelected ? "text-white" : "text-neutral-100"
            )}>
              {ticketType.label}
            </h3>
            <p className="font-mono text-xl font-bold text-neutral-100">
              ${Number(ticketType.price).toLocaleString("es-AR")}
            </p>
          </div>
          
          <p className="text-xs text-neutral-400">
            {getDescription()}
          </p>

          {/* Badges informativos */}
          <div className="flex flex-wrap items-center gap-2">
            {ticketType.minPurchaseQuantity > 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[11px] font-medium text-yellow-500">
                Mínimo {ticketType.minPurchaseQuantity}
              </span>
            )}
            {ticketType.userMaxPerType && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                Máx {ticketType.userMaxPerType} por persona
              </span>
            )}
            {getLowStockWarning() && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400">
                {getLowStockWarning()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Divider sutil */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

      {/* Footer con controles y subtotal */}
      <div className="flex items-center justify-between gap-4 p-4 pt-3">
        {/* Controles de cantidad */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={dec}
            disabled={disabledDec}
            aria-label="Restar ticket"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition-all",
              disabledDec
                ? "cursor-not-allowed border-neutral-800 text-neutral-700"
                : "border-neutral-700 text-white hover:border-neutral-600 hover:bg-neutral-900/50 active:scale-95"
            )}
          >
            <Minus size={16} strokeWidth={2} />
          </button>

          <div
            className={cn(
              "flex h-9 min-w-[3rem] items-center justify-center rounded-lg border px-3 font-mono text-lg font-semibold transition-all",
              isSelected
                ? "border-neutral-600 bg-neutral-900/30 text-white"
                : "border-neutral-800 bg-transparent text-neutral-400"
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
                ? "Alcanzaste el máximo disponible"
                : ticketType.minPurchaseQuantity > 1 && quantity === 0
                ? `Se agregarán ${ticketType.minPurchaseQuantity} tickets (mínimo)"`
                : undefined
            }
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition-all",
              disabledInc
                ? "cursor-not-allowed border-neutral-800 text-neutral-700"
                : "border-white text-white hover:bg-white/10 active:scale-95"
            )}
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Subtotal o mensaje */}
        <div className="text-right">
          {isSelected ? (
            <div className="space-y-0.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                Subtotal
              </p>
              <p className="font-mono text-base font-bold text-white">
                ${(Number(ticketType.price) * quantity).toLocaleString("es-AR")}
              </p>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">
              Seleccioná cantidad
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
