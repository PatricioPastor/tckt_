"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import Image from 'next/image';
import { Subtotal } from './componentes/subtotal/subtotal';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from '@untitledui/icons';
import { ItemsCart } from './componentes/items-cart/items-cart';

export default function Page() {
  const router = useRouter();
  const { eventId, items, getTotal, checkout } = useCartStore();

  useEffect(() => {
    if(getTotal() == 0){
      router.push('/events/' + eventId);
    }

  }, [eventId, items]);

  if (!eventId) return <div className="flex justify-center items-center h-screen text-white">No event selected</div>;


  const total = getTotal();


  const handleContinue = async () => {
    // Stub: Create MP preference, redirect to init_point
    // Pass selections { typeId, quantity } to /api/tickets/buy
    await checkout()
    // router.push('/payment/success'); // Or MP URL
  };

  

  const handleBack = () => {
    if(eventId){
      router.back();
    }else{
      router.push('/');
    }
  };


  return (
    <div className="bg-black  min-h-screen text-white p-4">
      <div className="mb-6">
        <div className='flex items-center justify-start gap-2'>
          <ChevronLeft size={20} onClick={handleBack}/>
          <h3 className="text-lg tracking-tighter font-bold">Orden de compra</h3>
        </div>
      </div>

      <ItemsCart />

      <Subtotal />

      <div className="fixed bottom-0 left-0 right-0 bg-black p-4 flex justify-between items-center border-t border-neutral-800">
        <div className='flex items-start flex-col justify-start'>
          <span className="text-white/70 font-medium font-mono text-sm">t_tal</span>
          <p className="text-white font-bold text-xl">${total.toLocaleString()}</p>
        </div>
        <Button onClick={handleContinue} size="lg" className="w-1/2  bg-white text-black font-semibold rounded-full backdrop-blur-lg border border-white/20 text-center">
          Comprar
        </Button>
      </div>

    </div>
  )
}