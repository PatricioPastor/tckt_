'use client';

import { Badge } from '@/components/ui/badge'
import {getBadgeVariant} from '@/lib/helpers';
import { Ticket } from '@/lib/store/tickets-store';
import { QrCode02, Calendar, MarkerPin01 } from '@untitledui/icons'
import { Drawer } from 'vaul';
import Image from 'next/image'
import React from 'react'

interface TicketCardProps {
    ticket: Ticket;
    
}

export const mapTypePaid = (type:Ticket['status']) =>  {

  switch(type) {
    case 'paid': return 'Pago';
    case 'pending': return 'Pendiente';
    case 'used': return 'Usado';
    case 'transferred': return 'Transferido';
    default: return type;
  }

}

export const TicketCard = ({ticket}: TicketCardProps) => {
  const event = ticket.event;
  
  const formatDate = (date: Date) => {
    const eventDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short'
    };
    return eventDate.toLocaleDateString('es-AR', options);
  };

  const formatTime = (date: Date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div 
      key={ticket.id} 
      className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-br from-[#0E0E0E] to-[#0A0A0A] transition-all hover:border-neutral-700 hover:shadow-lg"
    >
      {/* Decorative gradient */}
      <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-br from-neutral-700/10 to-transparent blur-2xl" />
      
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base mb-2 leading-tight truncate">
              {event.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5 text-neutral-300">
                <Calendar className="size-3.5" />
                {formatDate(event.date)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-neutral-300 font-medium">
                <span className="size-1 rounded-full bg-neutral-600" />
                {formatTime(event.date)}
              </span>
            </div>
          </div>
          <TicketDrawer ticket={ticket}/>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent my-3" />
        
        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MarkerPin01 className="size-4 text-neutral-500 flex-shrink-0" />
            <span className="text-sm text-neutral-400 truncate">
              {event.location}
            </span>
          </div>
          <Badge
            variant={getBadgeVariant(ticket.status)}
            className={`text-xs px-2.5 py-0.5 font-medium flex-shrink-0 ${
              ticket.status === 'paid'
                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : ticket.status === 'pending'
                ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                : ticket.status === 'used'
                ? 'bg-neutral-700/40 text-neutral-400 border-neutral-600'
                : 'bg-neutral-700/40 text-neutral-400 border-neutral-600'
            }`}
          >
            {mapTypePaid(ticket.status)}
          </Badge>
        </div>
      </div>
    </div>
  );
}


export default function TicketDrawer({ ticket }: { ticket: Ticket }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const event = ticket.event;

  const formatFullDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <Drawer.Root dismissible={false} open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-300 transition-all hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white active:scale-95">
        <QrCode02 size={18} />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        <Drawer.Content className="bg-[#0A0A0A] border-t border-neutral-800 flex flex-col rounded-t-2xl mt-24 h-fit fixed bottom-0 left-0 right-0 outline-none">
          <div className="p-6 pb-8">
            {/* Handle */}
            <div className="mx-auto w-12 h-1.5 rounded-full bg-neutral-700 mb-8" />
            
            <div className="max-w-md mx-auto space-y-6">
              {/* Event Info */}
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold text-white leading-tight">{event.name}</h2>
                
                <div className="flex flex-col items-center gap-2 text-sm">
                  <div className="inline-flex items-center gap-2 text-neutral-300">
                    <Calendar className="size-4" />
                    <span className="capitalize">{formatFullDate(event.date)}</span>
                    <span className="size-1 rounded-full bg-neutral-600" />
                    <span className="font-medium">{formatTime(event.date)}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 text-neutral-400">
                    <MarkerPin01 className="size-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
              
              {/* Status & Info */}
              <div className="flex flex-col items-center gap-3">
                <Badge
                  variant={getBadgeVariant(ticket.status)}
                  className={`text-sm px-3 py-1 ${
                    ticket.status === 'paid'
                      ? 'bg-green-500/15 text-green-400 border-green-500/30'
                      : ticket.status === 'pending'
                      ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                      : ticket.status === 'used'
                      ? 'bg-neutral-700/40 text-neutral-400 border-neutral-600'
                      : 'bg-neutral-700/40 text-neutral-400 border-neutral-600'
                  }`}
                >
                  {mapTypePaid(ticket.status)}
                </Badge>
                
                <div className="text-center">
                  <p className="text-xs text-neutral-500 mb-1">Titular del ticket</p>
                  <p className="text-sm text-white font-medium">{ticket.owner.username}</p>
                </div>
              </div>
              
              {/* QR Code */}
              <div className="w-full flex flex-col items-center gap-3 py-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full" />
                  <Image
                    src={ticket.qrCode}
                    alt="QR Ticket"
                    width={220}
                    height={220}
                    className="relative rounded-2xl border-2 border-neutral-800 bg-white p-3 shadow-2xl"
                  />
                </div>
                <p className="text-xs text-neutral-500 text-center max-w-[280px]">
                  Mostrá este código QR en la entrada del evento
                </p>
              </div>
              
              {/* Close Button */}
              <button
                className="w-full bg-white text-black rounded-xl py-3.5 text-sm font-semibold hover:bg-neutral-100 transition-all active:scale-[0.98]"
                onClick={() => setIsOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
