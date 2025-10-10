"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Ticket, Minus, Plus } from "lucide-react";
import { TcktLogo } from "@/components/tckt-logo";

export default function DoorSalePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");
  const buyerName = searchParams.get("name") || "";

  const [event, setEvent] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Price calculation (same as server-side)
  const BASE_PRICE = 30000;
  const APP_FEE_RATE = 0.08;
  const MP_FEE_RATE = 0.06;

  const appFee = BASE_PRICE * APP_FEE_RATE;
  const priceWithAppFee = BASE_PRICE + appFee;
  const pricePerTicket = priceWithAppFee / (1 - MP_FEE_RATE);
  const mpFeePerTicket = pricePerTicket - priceWithAppFee;

  const totalAppFee = appFee * quantity;
  const totalMpFee = mpFeePerTicket * quantity;
  const totalPrice = pricePerTicket * quantity;

  useEffect(() => {
    if (!eventId) {
      setError("Evento no encontrado o inválido.");
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);

        if (!res.ok) {
          setError("Evento no encontrado o inválido.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setEvent({ id: data.id, name: data.name });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Error al cargar la información del evento.");
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handlePayment = async () => {
    if (!eventId || !event) return;

    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/create-door-sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: parseInt(eventId),
          buyerName: buyerName || undefined,
          quantity: quantity
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear el link de pago");
        setProcessing(false);
        return;
      }

      if (data.success && data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        setError("Error al crear el link de pago");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Ocurrió un error inesperado");
      setProcessing(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-white" />
          <p className="text-sm text-neutral-400">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4">
        <Card className="max-w-md w-full border-neutral-800 bg-neutral-950 shadow-sm">
          <CardHeader>
            <CardTitle className="text-white">Error</CardTitle>
            <CardDescription className="text-neutral-400">{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.push("/events")}
              className="w-full bg-white text-black hover:bg-neutral-200"
            >
              Ver Eventos
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-white" />
          <p className="text-sm text-neutral-400">Redirigiendo a Mercado Pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="mb-8">
        <TcktLogo className="w-24 h-auto" />
      </div>
      <Card className="max-w-md w-full border-neutral-800 bg-neutral-950 shadow-2xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-white flex items-center justify-center">
            <Ticket className="h-6 w-6 text-black" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-white">
              {buyerName ? `Entrada para ${buyerName}` : "Entrada en Puerta"}
            </CardTitle>
            <CardDescription className="text-neutral-400 mt-2">
              {event?.name}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-neutral-900 rounded-lg p-4 border border-neutral-800">
            <span className="text-sm font-medium text-neutral-300">Cantidad</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-8 w-8 rounded-full border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white disabled:opacity-30"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-bold text-white w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= 10}
                className="h-8 w-8 rounded-full border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white disabled:opacity-30"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 bg-neutral-900 rounded-lg p-4 border border-neutral-800">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">
                Precio base {quantity > 1 && `(${quantity}x $${BASE_PRICE.toLocaleString("es-AR")})`}
              </span>
              <span className="text-white font-medium">
                ${(BASE_PRICE * quantity).toLocaleString("es-AR")}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Cargo por servicio (+8%)</span>
              <span className="text-white font-medium">
                ${totalAppFee.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Cargo de MP (+6%)</span>
              <span className="text-white font-medium">
                ${totalMpFee.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>

            <Separator className="bg-neutral-800" />

            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-medium text-neutral-300">Total</span>
              <span className="text-3xl font-bold text-white tracking-tight">
                ${Math.round(totalPrice).toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/50 p-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full h-11 text-[15px] font-medium bg-white text-black hover:bg-neutral-200 disabled:opacity-50 transition-colors"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </span>
            ) : (
              `Pagar ${quantity > 1 ? `${quantity} entradas` : "entrada"} con Mercado Pago`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
