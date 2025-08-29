"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentPendingPage() {
  const router = useRouter();
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // Auto-redirect to tickets after 30 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/tickets');
    }, 30000);

    // Update elapsed time every second
    const timeTimer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(timeTimer);
    };
  }, [router]);

  const handleGoToTickets = () => {
    router.push('/tickets');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="bg-black min-h-screen text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <Clock className="mx-auto h-16 w-16 text-yellow-500 animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Pago en proceso</h1>
        
        <p className="text-gray-400 mb-6">
          Tu pago está siendo procesado. Esto puede tomar unos minutos dependiendo 
          del método de pago seleccionado.
        </p>
        
        <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Estado: Pendiente</span>
          </div>
          <p className="text-xs text-gray-400">
            Te notificaremos por email cuando se confirme el pago
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleGoToTickets}
            className="w-full bg-white text-black font-semibold rounded-full hover:bg-gray-100"
          >
            Ver mis tickets
          </Button>
          
          <Button 
            onClick={handleGoHome}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-full"
          >
            Volver al inicio
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-6">
          Redirigiendo automáticamente en {30 - timeElapsed} segundos...
        </p>
        
        <div className="mt-6 space-y-2 text-xs text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Tickets reservados</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-3 w-3 text-yellow-500" />
            <span>Esperando confirmación de pago</span>
          </div>
        </div>
      </div>
    </div>
  );
}