"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "@untitledui/icons";

export default function PaymentRedirectPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const rawTo = sp.get("to") || "";
  const [opened, setOpened] = useState(false);

  const paymentUrl = useMemo(() => {
    try { return new URL(rawTo).toString(); } catch { return ""; }
  }, [rawTo]);

  useEffect(() => {
    if (paymentUrl && !opened) {
      const w = window.open(paymentUrl, "_blank", "noopener,noreferrer");
      if (w) setOpened(true);
    }
  }, [paymentUrl, opened]);

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b border-neutral-800 bg-[#0B0B0B]/80 px-4 backdrop-blur">
        <button
          onClick={() => router.back()}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-800 text-neutral-300 hover:bg-[#141414]"
          aria-label="Volver"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-sm font-medium text-neutral-100">Completar pago</div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-xl border border-neutral-800 bg-[#0E0E0E] p-5">
          <h1 className="mb-2 text-lg font-semibold tracking-tight text-neutral-100">Abrí tu pago en una nueva pestaña</h1>
          <p className="text-sm leading-5 text-neutral-400">
            Te llevamos al procesador de pagos para completar la compra. Al finalizar, vas a volver a NoTrip automáticamente.
          </p>

          <div className="mt-5 space-y-2">
            <Button
              onClick={() => paymentUrl && window.open(paymentUrl, "_blank", "noopener,noreferrer")}
              className="h-9 w-full rounded-md bg-neutral-100 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
              disabled={!paymentUrl}
            >
              Abrir link de pago
            </Button>

            <button onClick={() => router.push("/tickets")} className="w-full py-1 text-xs text-neutral-400 hover:text-neutral-300">
              Ya pagué, ver mis tickets
            </button>
            <button onClick={() => router.push("/")} className="w-full py-1 text-xs text-neutral-400 hover:text-neutral-300">
              Ir al inicio
            </button>
          </div>

          {!paymentUrl && (
            <p className="mt-4 text-xs text-red-400">No encontramos el link de pago. Volvé al checkout e intentá nuevamente.</p>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-neutral-500">Tip: si no se abrió, tu navegador puede estar bloqueando pop-ups.</p>
      </main>
    </div>
  );
}
