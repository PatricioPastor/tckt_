"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { TicketsList } from './components/tickets/tickets-list';
import { BackHeader } from '@/components/back-header/back-header';
import { TicketsHeader } from './components/tickets-header';

import { Ticket, TicketStatus, useTicketsStore } from '@/lib/store/tickets-store';



export default function Page() {
  const { tickets, isLoading, error, findTickets, refreshTickets, clearError } = useTicketsStore();
  const [refreshing, setRefreshing] = useState(false);

  // Memoize ticket categorization to prevent unnecessary re-renders
  const { proximosTickets, terminadosTickets } = useMemo(() => {
    const now = new Date();
    
    const proximos = tickets.filter(ticket => {
      const eventDate = new Date(ticket.event.date);
      const isPendingOrPaid = [TicketStatus.Pending, TicketStatus.Paid].includes(ticket.status);
      const isUpcoming = eventDate > now;
      return isPendingOrPaid && isUpcoming;
    });

    const terminados = tickets.filter(ticket => {
      const eventDate = new Date(ticket.event.date);
      const isUsedOrPast = ticket.status === TicketStatus.Used || eventDate <= now;
      return isUsedOrPast;
    });

    return { proximosTickets: proximos, terminadosTickets: terminados };
  }, [tickets]);

  // Initial load
  useEffect(() => {
    findTickets();
  }, [findTickets]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshTickets();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  if (isLoading && tickets.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white">
        <BackHeader 
          title="Mis tickets" 
          className="border-b border-neutral-800" 
        />
        <div className="flex justify-center items-center h-[70vh] text-white">
          <div className="text-center space-y-3">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
            <p className="text-neutral-400">Cargando tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      
      <BackHeader 
        title="Mis tickets" 
        className="border-b border-neutral-800" 
      />
      
      <TicketsHeader 
        totalTickets={tickets.length}
        proximosCount={proximosTickets.length}
        terminadosCount={terminadosTickets.length}
        isRefreshing={refreshing || isLoading}
        onRefresh={handleRefresh}
      />

      {/* Error Toast */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-300 text-sm">
            Error al cargar tickets: {error}
          </p>
          <button 
            onClick={clearError}
            className="text-red-400 text-xs underline mt-1"
          >
            Cerrar
          </button>
        </div>
      )}

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
              <TicketsList 
                tickets={proximosTickets} 
                isLoading={isLoading}
                emptyStateType="proximos"
              />
            </TabsContent>

            <TabsContent value="terminados" className="mt-0">
              <TicketsList 
                tickets={terminadosTickets}
                isLoading={isLoading}
                emptyStateType="terminados"
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

    </div>
  );
}



