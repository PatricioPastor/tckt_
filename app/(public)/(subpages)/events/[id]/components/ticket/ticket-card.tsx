// app/components/event/ticket-card.tsx (o tu path)
import Image from "next/image";
import { Minus, Plus } from "@untitledui/icons";
import { useCartStore } from '@/lib/store/cart-store';

export const TicketCard = ({ ticketType }: { ticketType: any }) => { // Asume type de EventWithDetails
  const { items, updateQuantity } = useCartStore();
  const quantity = items.find(i => i.type === ticketType.type)?.quantity || 0;
  const disabledDec = quantity <= 0;
  const disabledInc = quantity >= ticketType.userMaxPerType || quantity >= ticketType.stockCurrent;

  const handleIncrement = () => updateQuantity(ticketType.type, quantity + 1, ticketType.stockCurrent, ticketType.userMaxPerType);
  const handleDecrement = () => updateQuantity(ticketType.type, quantity - 1, ticketType.stockCurrent, ticketType.userMaxPerType);

  return (
    <div className="gradient-bg w-full gap-3 rounded-lg p-3 flex items-stretch overflow-hidden">
      <div className="relative w-12 max-w-[48px] h-auto">
        <Image src={'/background1.jpg'} alt={ticketType.type} fill style={{ objectFit: 'cover' }} className="opacity-90" />
      </div>
      <div className="flex-1 gap-6 flex justify-between items-center">
        <div>
          <h3 className="font-semibold tracking-tight text-white">{ticketType.type.toUpperCase()}</h3>
          <p className="text-xs text-neutral-400">Recibirás un QR con validez hasta las 2:00am</p>
        </div>
        <div className="text-right">
          <p className="font-semibold font-mono text-white text-lg">${Number(ticketType.price).toLocaleString('es-AR')}</p>
          <div className="flex items-center justify-end gap-2 mt-1">
            <button onClick={handleDecrement} className={`text-white/60 hover:text-white ${disabledDec ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={disabledDec}><Minus size={20} /></button>
            <span className="font-bold text-white text-lg text-center">{quantity}</span>
            <button onClick={handleIncrement} className={`text-white/90 hover:text-white ${disabledInc ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={disabledInc}><Plus size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};