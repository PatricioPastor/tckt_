"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { TcktLogo } from "@/components/tckt-logo";

export default function DoorSalePendingPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="mb-8">
        <TcktLogo className="w-24 h-auto" />
      </div>
      <Card className="max-w-md w-full border-neutral-800 bg-neutral-950 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-950 flex items-center justify-center border border-yellow-900">
            <Clock className="h-10 w-10 text-yellow-500" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-white">
              Pago Pendiente
            </CardTitle>
            <CardDescription className="text-neutral-400 mt-2">
              Tu pago está siendo procesado.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-center">
          <p className="text-sm text-neutral-300">
            Esto puede tomar unos minutos. Recibirás un email una vez que tu pago sea confirmado.
          </p>
          <p className="text-xs text-neutral-500">
            Por favor revisá tu correo o la sección de entradas para actualizaciones.
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
            Ver Eventos
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
