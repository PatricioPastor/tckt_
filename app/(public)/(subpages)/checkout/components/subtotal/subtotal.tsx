"use client";

import Image from "next/image";
import { useCartStore } from "@/lib/store/cart-store";
import { IconGift, IconCreditCard, IconReceiptTax } from "@tabler/icons-react";

const round2 = (n: number) => Math.round(n * 100) / 100;

export const Subtotal = () => {
  const { getTotal } = useCartStore();
  const subtotal = getTotal();

  // ---- Tasas (ajustables) ----
  const APP_FEE_RATE = 0.08; // 8% total de la app
  const MP_FEE_RATE = Number(process.env.NEXT_PUBLIC_MP_FEE_RATE ?? "0.06");       // 6% por defecto
  const IIBB_RATE   = Number(process.env.NEXT_PUBLIC_IIBB_LP_RATE ?? "0.025");     // 2.5% por defecto

  // ---- Comisión unificada de la app (8%) ----
  const appFee = round2(subtotal * APP_FEE_RATE);

  // // ---- Comisión MP (sobre subtotal + 8% app) ----
  // const basePlusApp = subtotal + appFee;
  // const mpFee = round2(basePlusApp * MP_FEE_RATE);

  // // ---- IIBB La Pampa (sobre subtotal + app + mp) ----
  // const basePlusAppAndMp = basePlusApp + mpFee;
  // const iibb = round2(basePlusAppAndMp * IIBB_RATE);

  // ---- Total que paga el usuario ----
  const total = round2(subtotal + appFee );

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
          <Row label={`Comisión de la app (${(APP_FEE_RATE * 100).toFixed(0)}%)`} value={appFee} />
          {/* <Row label={`Comisión Mercado Pago (${(MP_FEE_RATE * 100).toFixed(1)}%)`} value={mpFee} /> */}
          {/* <Row label={`IIBB La Pampa (${(IIBB_RATE * 100).toFixed(1)}%)`} value={iibb} /> */}

          <div className="my-2 border-t border-neutral-800" />

          <Row label="Total a pagar" value={total} strong />
        </div>

        <p className="text-[11px] leading-4 text-neutral-500">
          El total ya incluye tarifa de la aplicación (8%), comisión de Mercado Pago (impuestos en responsabiliadad de MercadoPago).
        </p>
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
  const base = strong ? "text-base font-semibold text-neutral-100" : "text-sm text-neutral-400";
  const val = strong ? "text-base font-semibold text-neutral-100" : "text-sm text-neutral-300";

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={base}>{label}</span>
      <span className={val}>
        ${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}
