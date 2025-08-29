"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { TicketsList } from './components/tickets/tickets-list';
import { BackHeader } from '@/components/back-header/back-header';

import { Ticket, TicketStatus, useTicketsStore } from '@/lib/store/tickets-store';



export default function Page() {
  const router = useRouter();
  const { isLoading, error, findTickets, getTicketsByStatus } = useTicketsStore();
  const [proximosTickets, setProximosTickets] = useState<Ticket[]>([]);
  const [terminadosTickets, setTerminadosTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    findTickets();
    setProximosTickets(getTicketsByStatus(TicketStatus.Pending, TicketStatus.Paid));
    setTerminadosTickets(getTicketsByStatus(TicketStatus.Used));
  }, []);

  if (isLoading) return <div className="flex justify-center items-center h-screen text-white">Cargando tickets...</div>;

  return (
    <div className="bg-black min-h-screen text-white">
      
      <BackHeader 
        title="Mis tickets" 
        className="border-b border-neutral-800" 
      />

      <div className="w-full">
        <Tabs defaultValue="proximos" className="">
          <TabsList className="bg-transparent w-full h-auto p-0 rounded-none  space-x-0 mb-2 border-b border-neutral-800">
            <TabsTrigger 
              value="proximos" 
              className="flex-1  h-auto py-2 px-0 bg-transparent border-0  border-r border-r-neutral-800  data-[state=active]:text-white text-neutral-500 rounded-none text-sm font-medium transition-colors hover:text-neutral-300"
            >
              próximos
            </TabsTrigger>
            <TabsTrigger 
              value="terminados" 
              className="flex-1 h-auto py-2 px-0 bg-transparent   border-0  data-[state=active]:text-white text-neutral-500 rounded-none text-sm font-medium transition-colors hover:text-neutral-300"
            >
              terminados
            </TabsTrigger>
          </TabsList>
          
          <div className='w-full flex-1 px-4'>
            <TabsContent value="proximos" className="mt-0">
              <TicketsList tickets={proximosTickets} />
            </TabsContent>

            <TabsContent value="terminados" className="mt-0">
              <TicketsList tickets={[]} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

    </div>
  );
}



