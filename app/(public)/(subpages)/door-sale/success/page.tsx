"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { TcktLogo } from "@/components/tckt-logo";

export default function DoorSaleSuccessPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="mb-8">
        <TcktLogo className="w-24 h-auto" />
      </div>
      <Card className="max-w-md w-full border-neutral-800 bg-neutral-950 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-950 flex items-center justify-center border border-green-900">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-white">
              ¡Pago Exitoso!
            </CardTitle>
            <CardDescription className="text-neutral-400 mt-2">
              Tu entrada ha sido registrada. Ya podés ingresar al evento.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-center">
          <p className="text-sm text-neutral-300">
            Revisá tu correo electrónico para ver la confirmación y el código QR de tu entrada.
          </p>
          <p className="text-xs text-neutral-500">
            Si no recibís el email, por favor contactá a soporte o revisá la sección de tus entradas.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={() => router.push("/tickets")}
            className="w-full h-11 bg-white text-black hover:bg-neutral-200 font-medium"
          >
            Ver Mis Entradas
          </Button>
          <Button
            onClick={() => router.push("/events")}
            variant="outline"
            className="w-full h-11 border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white font-medium"
          >
            Ver Más Eventos
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
