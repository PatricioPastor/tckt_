'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart-store'; // Asume path correcto
import { IconGift, IconCreditCard } from '@tabler/icons-react'; // O tu lib de íconos (e.g., Untitled UI)

export const Subtotal = () => {
  const { getTotal } = useCartStore();
  const subtotal = getTotal(); // Total base desde cart-store
  const serviceFeePercent = 0.08; // 8% total
  const prizePoolPercent = 0.03; // 3% para pozo
  const serviceFeePercentNet = 0.05; // 5% tarifa servicio

  // Cálculos
  const serviceFee = subtotal * serviceFeePercent;
  const prizePool = subtotal * prizePoolPercent;
  const netServiceFee = subtotal * serviceFeePercentNet;
  const total = subtotal + serviceFee;

  return (
    <div className="bg-black text-neutral-300 flex flex-col gap-6">
      {/* Método de Pago */}
      <div className="flex flex-col gap-4 items-start justify-start">
        <h2 className="text-base font-medium tracking-tighter text-white">Método de Pago</h2>
        <div className="bg-transparent w-full rounded-lg py-6 flex justify-center items-center max-h-[70px] border border-white/70 hover:border-white/90 transition-colors duration-200">
          <Image src="/mercadopago.svg" height={50} width={150} alt="Mercado Pago" className="object-contain" />
        </div>
      </div>

      {/* Resumen de Compra */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-medium tracking-tighter text-white">Resumen de Compra</h2>
        <div className="flex flex-col gap-2 bg-neutral-900/50 rounded-lg p-4">
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-400">Subtotal</span>
            <span className="text-sm font-semibold text-white">
              ${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Tarifa de Servicio y Pozo */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IconGift className="text-yellow-400" size={16} />
              <span className="text-sm text-neutral-400">Contribución a Premios & Sorteos (3%)</span>
            </div>
            <span className="text-sm font-semibold text-yellow-400">
              +${prizePool.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IconCreditCard className="text-green-400" size={16} />
              <span className="text-sm text-neutral-400">Tarifa de Servicio (5%)</span>
            </div>
            <span className="text-sm font-semibold text-green-400">
              +${netServiceFee.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t border-neutral-700 pt-2 mt-2">
            <span className="text-base font-bold text-white">Total a Pagar</span>
            <span className="text-base font-bold text-white">
              ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};