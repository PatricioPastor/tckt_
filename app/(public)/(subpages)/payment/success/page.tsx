"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart-store';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Limpiar carrito al llegar a success
    clearCart();

    // Auto-redirect to tickets page after 3 seconds
    const timer = setTimeout(() => {
      router.push('/tickets');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, clearCart]);

  const handleGoToTickets = () => {
    router.push('/tickets');
  };

  return (
    <div className="bg-black min-h-screen text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">¡Pago exitoso!</h1>
        
        <p className="text-gray-400 mb-8">
          Tu compra se ha procesado correctamente. Te redirigiremos a tus tickets en unos segundos.
        </p>
        
        <Button 
          onClick={handleGoToTickets}
          className="w-full bg-white text-black font-semibold rounded-full hover:bg-gray-100"
        >
          Ver mis tickets
        </Button>
        
        <p className="text-sm text-gray-500 mt-4">
          Redirigiendo automáticamente en 3 segundos...
        </p>
      </div>
    </div>
  );
}