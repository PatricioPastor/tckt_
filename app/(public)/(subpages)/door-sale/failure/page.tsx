"use client";

import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { TcktLogo } from "@/components/tckt-logo";

function DoorSaleFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("collection_id") || searchParams.get("eventId");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="mb-8">
        <TcktLogo className="w-24 h-auto" />
      </div>
      <Card className="max-w-md w-full border-neutral-800 bg-neutral-950 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-950 flex items-center justify-center border border-red-900">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-white">
              Pago Rechazado
            </CardTitle>
            <CardDescription className="text-neutral-400 mt-2">
              No se pudo procesar tu pago.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-center">
          <p className="text-sm text-neutral-300">
            Esto puede suceder por fondos insuficientes, problemas con la tarjeta o rechazo del pago.
          </p>
          <p className="text-xs text-neutral-500">
            Por favor intentá nuevamente o usá otro método de pago.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {eventId && (
            <Button
              onClick={() => router.push(`/door-sale?eventId=${eventId}`)}
              className="w-full h-11 bg-white text-black hover:bg-neutral-200 font-medium"
            >
              Intentar Nuevamente
            </Button>
          )}
          <Button
            onClick={() => router.push("/events")}
            variant="outline"
            className="w-full h-11 border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white font-medium"
          >
            Ver Eventos
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function DoorSaleFailurePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-black">Cargando...</div>}>
      <DoorSaleFailureContent />
    </Suspense>
  );
}
