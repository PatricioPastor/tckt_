"use client";

import Image from "next/image";
import { useCartStore } from "@/lib/store/cart-store";

const round2 = (n: number) => Math.round(n * 100) / 100;

export const Subtotal = () => {
  const { getTotal } = useCartStore();
  const subtotal = getTotal();

  // ---- Tasas ----
  const APP_FEE_RATE = 0.08; // 8% neto que recibe la app
  const MP_FEE_RATE = Number(process.env.NEXT_PUBLIC_MP_FEE_RATE ?? "0.041"); // Comisión MP (~4.1%)
  
  // ---- Cálculo: el cliente paga lo necesario para que, tras la comisión de MP,
  // vos recibas el subtotal + 8%
  const total = round2((subtotal * (1 + APP_FEE_RATE)) / (1 - MP_FEE_RATE));

  // ---- Desglose informativo ----
  const appFee = round2(subtotal * APP_FEE_RATE);
  const estimatedMpFee = round2(total * MP_FEE_RATE);
  const netReceived = round2(total - estimatedMpFee);

  return (
    <div className="flex flex-col gap-8 text-neutral-200">
      {/* Método de pago */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium tracking-tight text-neutral-100">
          Método de pago
        </h2>
        <div className="flex w-full items-center justify-center rounded-lg border border-neutral-800 bg-[#0E0E0E] py-5 hover:border-neutral-700">
          <Image
            src="/mercadopago.svg"
            height={50}
            width={150}
            alt="Mercado Pago"
            className="opacity-90"
          />
        </div>
      </section>

      {/* Resumen */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium tracking-tight text-neutral-100">
          Resumen
        </h2>

        <div className="rounded-lg border border-neutral-800 bg-[#0E0E0E] p-4">
          <Row label="Subtotal" value={subtotal} />
          <Row
            label={`Tarifa de servicio (${(APP_FEE_RATE * 100).toFixed(0)}%)`}
            value={appFee}
          />
          <Row
            label={`Comisión MercadoPago (~${(MP_FEE_RATE * 100).toFixed(1)}%)`}
            value={estimatedMpFee}
          />

          <div className="my-2 border-t border-neutral-800" />

          <Row label="Total a pagar" value={total} strong />
        </div>

        {/* <p className="text-[11px] leading-4 text-neutral-500">
          El total incluye la comisión de Mercado Pago y garantiza que la app
          reciba un 8% neto sobre el valor del ticket.
        </p> */}
      </section>
    </div>
  );
};

function Row({
  label,
  value,
  strong,
}: {
  label: React.ReactNode;
  value: number;
  strong?: boolean;
}) {
  const base = strong
    ? "text-base font-semibold text-neutral-100"
    : "text-sm text-neutral-400";
  const val = strong
    ? "text-base font-semibold text-neutral-100"
    : "text-sm text-neutral-300";

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={base}>{label}</span>
      <span className={val}>
        ${value.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  );
}
