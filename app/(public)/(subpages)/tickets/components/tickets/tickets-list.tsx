import { Ticket } from '@/lib/store/tickets-store';
import React from 'react'
import { TicketCard } from './ticket';
import { Ticket01 } from '@untitledui/icons';
import { useRouter } from 'next/navigation';
import { Calendar, ShoppingBag } from 'lucide-react';

type TicketsProps = {
    tickets: Ticket[];
    isLoading?: boolean;
    emptyStateType?: 'proximos' | 'terminados';
}

export const TicketsList = ({ tickets, isLoading = false, emptyStateType = 'proximos' }: TicketsProps) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-neutral-800/30 rounded-lg h-24 border border-neutral-800/50"></div>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    const isTerminadosTab = emptyStateType === 'terminados';
    
    return (
      <div className="flex flex-col items-center justify-start mt-12 min-h-[60vh] px-6 text-center">
        {/* Círculos concéntricos e ícono */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          {/* Círculos animados más sutiles */}
          <div className="absolute animate-pulse w-8 h-8 rounded-full border border-neutral-800/70" />
          <div className="absolute animate-pulse w-16 h-16 rounded-full border border-neutral-800/50" />
          <div className="absolute animate-pulse w-24 h-24 rounded-full border border-neutral-800/30" />
          <div className="absolute animate-pulse w-28 h-28 rounded-full border border-neutral-800/20" />

          {/* Ícono */}
          <div className="size-10 border border-neutral-700 rounded-xl flex items-center justify-center bg-neutral-900/50 relative z-10">
            {isTerminadosTab ? (
              <Calendar className="w-5 h-5 text-neutral-400" />
            ) : (
              <Ticket01 className="w-5 h-5 text-neutral-400" />
            )}
          </div>
        </div>

        {/* Texto principal */}
        <h3 className="text-neutral-200 font-medium text-base mb-2">
          {isTerminadosTab 
            ? 'No tienes tickets usados' 
            : 'No tienes tickets próximos'
          }
        </h3>

        {/* Subtexto */}
        <p className="text-neutral-500 text-sm max-w-sm leading-relaxed mb-6">
          {isTerminadosTab 
            ? 'Los tickets de eventos pasados aparecerán aquí.'
            : 'Tus próximos eventos aparecerán aquí una vez que compres tickets.'
          }
        </p>

        {/* CTA button */}
        {!isTerminadosTab && (
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-100 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Explorar eventos
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket: Ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}
