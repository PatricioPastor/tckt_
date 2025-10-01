"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store/user-store";
import { authClient } from "@/lib/auth-client";
import { ItemsCart } from "./components/items-cart/items-cart";
import { Subtotal } from "./components/subtotal/subtotal";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";
import { BackHeader } from "@/components/back-header/back-header";

export default function CheckoutPage() {
  const router = useRouter();
  const { eventId, getTotal, checkout, checkoutFree, hasFreeTickets, hasPaidTickets } = useCartStore();
  const { user } = useUserStore();
  const { data: session, isPending } = authClient.useSession();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showSlideConfirm, setShowSlideConfirm] = useState(false);
  const [showEmailOption, setShowEmailOption] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => { if (!isPending) setIsCheckingAuth(false); }, [isPending]);

  if (!eventId) {
    return <div className="flex h-screen items-center justify-center text-sm text-neutral-400 bg-[#0B0B0B]">No event selected</div>;
  }

  const subtotal = getTotal();
  
  // Calcular el total con todas las comisiones como en el componente Subtotal
  const APP_FEE_RATE = 0.08;
  const MP_FEE_RATE = Number(process.env.NEXT_PUBLIC_MP_FEE_RATE ?? "0.06");
  const IIBB_RATE = Number(process.env.NEXT_PUBLIC_IIBB_LP_RATE ?? "0.025");
  
  const appFee = Math.round(subtotal * APP_FEE_RATE * 100) / 100;
  const basePlusApp = subtotal + appFee;
  const mpFee = Math.round(basePlusApp * MP_FEE_RATE * 100) / 100;
  const basePlusAppAndMp = basePlusApp + mpFee;
  const iibb = Math.round(basePlusAppAndMp * IIBB_RATE * 100) / 100;
  const total = Math.round((subtotal + appFee + mpFee + iibb) * 100) / 100;

  const handleContinue = async () => {
    if (!session?.user && !user) { router.push('/auth'); return; }
    if (!hasPaidTickets() && hasFreeTickets()) { setShowEmailOption(true); return; }
    setShowSlideConfirm(true);
  };

  const handleSlideConfirm = async () => {
    setIsProcessing(true);
    try {
      // Si solo hay tickets gratis
      if (hasFreeTickets() && !hasPaidTickets()) {
        const freeResult = await checkoutFree(sendEmail);
        if (!freeResult.success) {
          console.error("Free checkout failed");
          setShowSlideConfirm(false);
          setIsProcessing(false);
          return;
        }
        router.push("/tickets");
        return;
      }

      // Si hay tickets pagos
      if (hasPaidTickets()) {
        const result = await checkout();
        const data = result.data as {
          success: boolean;
          initPoint?: string;
          sandboxInitPoint?: string;
        };

        if (data.success && data.initPoint) {
          // Redirigir directamente a MercadoPago
          console.log('[Checkout] Redirecting to MercadoPago:', data.initPoint);

          // Usar sandbox en desarrollo, producción en prod
          const redirectUrl = true
            ? data.initPoint
            : (data.sandboxInitPoint || data.initPoint);

          window.location.href = redirectUrl!;
        } else {
          console.error("Failed to create payment preference");
          setShowSlideConfirm(false);
          setIsProcessing(false);
        }
      }
    } catch (e) {
      console.error(e);
      setShowSlideConfirm(false);
      setIsProcessing(false);
    }
  };

  const handleFreeCheckout = async () => {
    try {
      const r = await checkoutFree(sendEmail);
      if (r.success) router.push("/tickets");
    } catch (e) { console.error(e); }
  };


  // Mostrar loading si está procesando
  if (isProcessing) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0B0B]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-neutral-800 border-t-neutral-100" />
          <p className="text-sm text-neutral-400">Redirigiendo a MercadoPago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <BackHeader title="Checkout" className="border-b border-neutral-800 bg-[#0B0B0B]" />

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-8">
          <ItemsCart />
          <Subtotal />
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-neutral-800 bg-[#0B0B0B]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-neutral-400">Total</p>
              <p className="text-lg font-semibold text-neutral-100">${total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          {showEmailOption ? (
            <div className="space-y-3">
              <div className="text-center">
                <p className="mb-1 text-sm font-medium text-neutral-100">Tickets gratuitos</p>
                <p className="text-xs text-neutral-400">¿Querés recibir los QR por email?</p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-800 bg-[#0E0E0E] p-3">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-transparent text-neutral-100 focus:ring-neutral-100"
                />
                <span className="text-xs text-neutral-300">Enviar QR codes por email</span>
              </label>

              <Button onClick={handleFreeCheckout} className="h-9 w-full rounded-md bg-neutral-100 text-sm font-medium text-black hover:bg-neutral-200">
                Obtener tickets gratuitos
              </Button>

              <button onClick={() => setShowEmailOption(false)} className="w-full py-1 text-xs text-neutral-400 hover:text-neutral-300">
                Volver
              </button>
            </div>
          ) : showSlideConfirm ? (
            <div className="space-y-3">
              <p className="text-center text-xs text-neutral-400">
                {hasPaidTickets() ? 'Deslizá para ir a MercadoPago' : 'Deslizá para confirmar'}
              </p>
              <SlideToConfirm
                onConfirm={handleSlideConfirm}
                text={hasPaidTickets() ? "Deslizar para pagar" : "Deslizar para confirmar"}
                confirmText="Procesando..."
                disabled={isProcessing}
              />
              <button
                onClick={() => setShowSlideConfirm(false)}
                className="w-full py-1 text-xs text-neutral-400 hover:text-neutral-300"
                disabled={isProcessing}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <Button
              onClick={handleContinue}
              className="h-9 w-full rounded-md bg-neutral-100 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCheckingAuth}
            >
              {isCheckingAuth ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-spin rounded-full border border-black/30 border-t-black" />
                  <span className="text-xs">Verificando...</span>
                </div>
              ) : (
                "Continuar al pago"
              )}
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
