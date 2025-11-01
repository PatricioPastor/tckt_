"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentStatus {
  status: 'pending' | 'approved' | 'failed';
  paymentId?: string;
  transactionAmount?: number;
  tickets?: Array<{
    id: string;
    qrCode: string;
    event: { name: string };
    type: { type: string };
  }>;
  error?: string;
}

function PaymentConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'pending' });
  const [timeElapsed, setTimeElapsed] = useState(0);

  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    // Start timer
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!paymentId) {
      setPaymentStatus({ status: 'failed', error: 'No payment ID provided' });
      return;
    }

    // Poll for payment confirmation
    const pollPayment = async () => {
      try {
        const response = await fetch(`/api/payments/status?payment_id=${paymentId}`);
        const data = await response.json();

        if (data.success) {
          setPaymentStatus({
            status: data.status === 'approved' ? 'approved' : 'pending',
            paymentId: data.paymentId,
            transactionAmount: data.transactionAmount,
            tickets: data.tickets
          });

          // Stop polling if approved or failed
          if (data.status === 'approved' || data.status === 'rejected') {
            return true; // Stop polling
          }
        }
        return false; // Continue polling
      } catch (error) {
        console.error('Payment status check error:', error);
        return false;
      }
    };

    // Initial check
    pollPayment();

    // Poll every 3 seconds for up to 5 minutes
    const pollInterval = setInterval(async () => {
      const shouldStop = await pollPayment();
      if (shouldStop || timeElapsed > 300) { // 5 minutes max
        clearInterval(pollInterval);
        if (!shouldStop && timeElapsed > 300) {
          setPaymentStatus({ status: 'failed', error: 'Payment confirmation timeout' });
        }
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [paymentId, timeElapsed]);

  const handleGoToTickets = () => {
    router.push('/tickets');
  };

  const handleTryAgain = () => {
    router.back();
  };

  return (
    <div className="bg-black min-h-screen text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        
        {/* Status Icon */}
        <div className="mb-8">
          {paymentStatus.status === 'pending' && (
            <div className="mx-auto w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-neutral-400 animate-pulse" />
            </div>
          )}
          {paymentStatus.status === 'approved' && (
            <div className="mx-auto w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          )}
          {paymentStatus.status === 'failed' && (
            <div className="mx-auto w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          )}
        </div>

        {/* Status Content */}
        {paymentStatus.status === 'pending' && (
          <>
            <h1 className="text-2xl font-semibold mb-4">Confirmando pago</h1>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Estamos verificando tu pago con MercadoPago. 
              <br />
              Esto puede tomar unos momentos...
            </p>
            <div className="text-neutral-600 text-sm">
              Tiempo transcurrido: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </div>
          </>
        )}

        {paymentStatus.status === 'approved' && (
          <>
            <h1 className="text-2xl font-semibold text-green-400 mb-4">¡Pago confirmado!</h1>
            <p className="text-neutral-400 mb-6">
              Tu compra se procesó correctamente.
            </p>
            
            {/* Payment Details */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">ID de pago:</span>
                  <span className="text-white font-mono">{paymentStatus.paymentId}</span>
                </div>
                {paymentStatus.transactionAmount && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Monto:</span>
                    <span className="text-white">${paymentStatus.transactionAmount.toLocaleString()}</span>
                  </div>
                )}
                {paymentStatus.tickets && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Tickets:</span>
                    <span className="text-white">{paymentStatus.tickets.length}</span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleGoToTickets}
              className="w-full h-12 bg-white text-black font-medium rounded-lg hover:bg-neutral-100"
            >
              Ver mis tickets
            </Button>
          </>
        )}

        {paymentStatus.status === 'failed' && (
          <>
            <h1 className="text-2xl font-semibold text-red-400 mb-4">Error en el pago</h1>
            <p className="text-neutral-400 mb-6">
              {paymentStatus.error || 'No pudimos confirmar tu pago. Inténtalo nuevamente.'}
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleTryAgain}
                className="w-full h-12 bg-white text-black font-medium rounded-lg hover:bg-neutral-100"
              >
                Intentar nuevamente
              </Button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full text-neutral-500 text-sm py-2 hover:text-neutral-400 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-neutral-800">
          <p className="text-xs text-neutral-600">
            ¿Problemas con tu pago? Contáctanos para ayudarte.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function PaymentConfirmPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0B0B0B]">Cargando...</div>}>
      <PaymentConfirmContent />
    </Suspense>
  );
}