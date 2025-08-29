'use client';

import { Badge } from '@/components/ui/badge'
import {getBadgeVariant} from '@/lib/helpers';
import { Ticket } from '@/lib/store/tickets-store';
import { QrCode02 } from '@untitledui/icons'
import { Drawer } from 'vaul';
import Image from 'next/image'
import React from 'react'

interface TicketCardProps {
    ticket: Ticket;
    
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
    <div key={ticket.id} className="group border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors bg-neutral-900/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-medium text-base mb-1 leading-tight">
            {event.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span>{formatDate(event.date)}</span>
            <span>•</span>
            <span>{formatTime(event.date)}</span>
          </div>
        </div>
        <TicketDrawer ticket={ticket}/>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-500">
          {event.location}
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={getBadgeVariant(ticket.status)}
            className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-300 border-neutral-700"
          >
            {ticket.status}
          </Badge>
        </div>
      </div>
    </div>
  );
}


export default function TicketDrawer({ ticket }: { ticket: Ticket }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const event = ticket.event;

  return (
    <Drawer.Root dismissible={false} open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white">
        <QrCode02 size={18} />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60" />
        <Drawer.Content className="bg-neutral-900 border-t border-neutral-800 flex flex-col rounded-t-xl mt-24 h-fit fixed bottom-0 left-0 right-0 outline-none">
          <div className="p-6">
            <div className="mx-auto w-12 h-1.5 rounded-full bg-neutral-700 mb-6" />
            <div className="max-w-md mx-auto text-center space-y-6">
              <div>
                <h2 className="text-xl font-medium text-white mb-2">{event.name}</h2>
                <p className="text-sm text-neutral-400">
                  {new Date(event.date).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })} • {event.location}
                </p>
              </div>
              
              <div className="flex justify-center gap-2">
                <Badge 
                  variant={getBadgeVariant(ticket.status)}
                  className="bg-neutral-800 text-neutral-300 border-neutral-700"
                >
                  {ticket.status}
                </Badge>
                <Badge className="bg-neutral-800 text-neutral-300 border-neutral-700">
                  {ticket.type.type}
                </Badge>
              </div>
              
              <div className="text-sm text-neutral-500">
                Titular: <span className="text-neutral-300 font-medium">{ticket.owner.username}</span>
              </div>
              
              <div className="w-full flex justify-center py-4">
                <Image
                  src={ticket.qrCode}
                  alt="QR Ticket"
                  width={200}
                  height={200}
                  className="rounded-xl border border-neutral-800"
                />
              </div>
              
              <button
                className="w-full bg-white text-black rounded-lg py-3 text-sm font-medium hover:bg-neutral-100 transition-colors"
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
