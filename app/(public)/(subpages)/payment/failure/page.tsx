"use client";

import { useRouter } from 'next/navigation';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailurePage() {
  const router = useRouter();

  const handleRetry = () => {
    // Go back to the previous page (likely checkout)
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoToEvents = () => {
    router.push('/events');
  };

  return (
    <div className="bg-black min-h-screen text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Pago no completado</h1>
        
        <p className="text-gray-400 mb-8">
          No pudimos procesar tu pago. Esto puede deberse a fondos insuficientes, 
          datos incorrectos o problemas técnicos temporales.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={handleRetry}
            className="w-full bg-white text-black font-semibold rounded-full hover:bg-gray-100 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar nuevamente
          </Button>
          
          <Button 
            onClick={handleGoToEvents}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 rounded-full"
          >
            Ver otros eventos
          </Button>
          
          <Button 
            onClick={handleGoHome}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-full flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Volver al inicio
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">
            <strong>¿Necesitas ayuda?</strong>
          </p>
          <p className="text-xs text-gray-500">
            Si continúas teniendo problemas, contacta a nuestro soporte o 
            intenta con otro método de pago.
          </p>
        </div>
      </div>
    </div>
  );
}