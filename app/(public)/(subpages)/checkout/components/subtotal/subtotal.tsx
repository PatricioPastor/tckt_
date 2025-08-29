"use client";

import Image from "next/image";
import { useCartStore } from "@/lib/store/cart-store";
import { IconGift, IconCreditCard } from "@tabler/icons-react";

export const Subtotal = () => {
  const { getTotal } = useCartStore();
  const subtotal = getTotal();
  const serviceFeePercent = 0.08;
  const prizePoolPercent = 0.03;
  const serviceFeePercentNet = 0.05;

  const serviceFee = subtotal * serviceFeePercent;
  const prizePool = subtotal * prizePoolPercent;
  const netServiceFee = subtotal * serviceFeePercentNet;
  const total = subtotal + serviceFee;

  return (
    <div className="flex flex-col gap-8 text-neutral-200">
      {/* Método de pago */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium tracking-tight text-neutral-100">Método de pago</h2>
        <div className="flex w-full items-center justify-center rounded-lg border border-neutral-800 bg-[#0E0E0E] py-5 hover:border-neutral-700">
          <Image src="/mercadopago.svg" height={50} width={150} alt="Mercado Pago" className="opacity-90" />
        </div>
      </section>

      {/* Resumen */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium tracking-tight text-neutral-100">Resumen</h2>

        <div className="rounded-lg border border-neutral-800 bg-[#0E0E0E] p-4">
          <Row label="Subtotal" value={subtotal} />

          <Row
            label={
              <span className="inline-flex items-center gap-2">
                <IconGift size={16} className="text-amber-400" />
                Contribución a premios & sorteos (3%)
              </span>
            }
            value={prizePool}
            accent="amber"
          />

          <Row
            label={
              <span className="inline-flex items-center gap-2">
                <IconCreditCard size={16} className="text-emerald-400" />
                Tarifa de servicio (5%)
              </span>
            }
            value={netServiceFee}
            accent="emerald"
          />

          <div className="my-2 border-t border-neutral-800" />

          <Row label="Total a pagar" value={total} strong />
        </div>

        <p className="text-[11px] leading-4 text-neutral-500">
          El total incluye tarifas e impuestos. El detalle de aportes a premios y servicio se muestra arriba.
        </p>
      </section>
    </div>
  );
};

function Row({
  label,
  value,
  strong,
  accent,
}: {
  label: React.ReactNode;
  value: number;
  strong?: boolean;
  accent?: "amber" | "emerald";
}) {
  const base = strong ? "text-base font-semibold text-neutral-100" : "text-sm font-medium text-neutral-300";
  const val =
    strong
      ? "text-base font-semibold text-neutral-100"
      : accent === "amber"
      ? "text-sm font-semibold text-amber-400"
      : accent === "emerald"
      ? "text-sm font-semibold text-emerald-400"
      : "text-sm font-semibold text-neutral-200";

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={base}>{label}</span>
      <span className={val}>
        ${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}
