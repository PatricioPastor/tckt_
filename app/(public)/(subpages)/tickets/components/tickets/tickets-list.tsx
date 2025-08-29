import { Ticket } from '@/lib/store/tickets-store';
import Image from 'next/image'
import React from 'react'
import { TicketCard } from './ticket';
import { Ticket01 } from '@untitledui/icons';

type TicketsProps = {
    tickets: Ticket[];
    // handleQrClick: (ticket: Ticket) => void;
}



export const TicketsList = ({tickets }: TicketsProps) => {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-start mt-12 min-h-[80vh] px-6 text-center">
        {/* Círculos concéntricos e ícono */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Círculos */}
          <div className="absolute animate-pulse w-12 h-12 rounded-full border border-neutral-800/90" />
          <div className="absolute animate-pulse w-20 h-20 rounded-full border border-neutral-800/80" />
          <div className="absolute animate-pulse w-28 h-28 rounded-full border border-neutral-800/65" />
          <div className="absolute animate-pulse w-36 h-36 rounded-full border border-neutral-800/50" />
          <div className="absolute animate-pulse w-44 h-44 rounded-full border border-neutral-800/40" />
          <div className="absolute animate-pulse w-52 h-52 rounded-full border border-neutral-800/30" />

          {/* Ícono */}
          <div className="size-12 border border-[#373A41] rounded-xl flex items-center justify-center bg-black relative z-10">
            <Ticket01 className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Texto principal */}
        <h3 className="text-white font-semibold text-lg -mt-6 mb-2">
          No tienes tickets activos aún
        </h3>

        {/* Subtexto */}
        <p className="text-neutral-500 text-sm max-w-xs leading-relaxed">
          Tus tickets comprados se mostrarán aquí.
        </p>
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
