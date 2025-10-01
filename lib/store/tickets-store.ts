import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TicketsStore = {
  tickets: Ticket[] | [];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  findTickets: () => Promise<void>;
  getTicketsByStatus: (...args: TicketStatus[]) => Ticket[];
  refreshTickets: () => Promise<void>;
  clearError: () => void;
  updateTicketStatus: (ticketId: number, status: TicketStatus) => void;
};

const ticketsStore = (set: any, get: any) => ({
  tickets: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  getTicketsByStatus: (...statuses: TicketStatus[]) => {
    return get().tickets.filter((ticket: Ticket) => statuses.includes(ticket.status));
  },
  findTickets: async () => {
    const currentTime = Date.now();
    const { lastUpdated } = get();

    // Skip if we just fetched (less than 30 seconds ago)
    if (lastUpdated && currentTime - lastUpdated < 30000) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/tickets/my', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const {data}: {data: Ticket[]} = await res.json();
      set({
        tickets: data || [],
        lastUpdated: currentTime,
        error: null
      });

    } catch (err) {
      console.error('Error fetching tickets:', err);
      set({ error: (err as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  refreshTickets: async () => {
    set({ lastUpdated: null }); // Force refresh
    await get().findTickets();
  },
  clearError: () => {
    set({ error: null });
  },
  updateTicketStatus: (ticketId: number, status: TicketStatus) => {
    const { tickets } = get();
    const updatedTickets = tickets.map((ticket: Ticket) =>
      ticket.id === ticketId ? { ...ticket, status } : ticket
    );
    set({ tickets: updatedTickets });
  },
})

export const useTicketsStore = create<TicketsStore>()(
  persist(ticketsStore, {
    name: 'tickets-storage',
    partialize: (state) => ({
      tickets: state.tickets,
      lastUpdated: state.lastUpdated
    }),
    // Evita hydration mismatch: solo hidrata después del montaje en cliente
    skipHydration: typeof window === 'undefined',
  })
);


export interface Ticket {
    id:                number;
    eventId:           number;
    ownerId:           string;
    typeId:            number;
    qrCode:            string;
    status:            TicketStatus;
    paymentId:         null;
    transferredFromId: null;
    createdAt:         Date;
    event:             Event;
    type:              Type;
    owner:             Owner;
}

export enum TicketStatus {
  Used = 'used',
  Pending = 'pending',
  Paid = 'paid',
  Transferred = 'transferred'
}

export interface Event {
    id:            number;
    name:          string;
    date:          Date;
    location:      string;
    description:   string;
    bannerUrl:     string;
    status:        string;
    producerId:    number;
    capacityTotal: number;
    isRsvpAllowed: boolean;
    eventGenre:    string;
    createdAt:     Date;
}

export interface Owner {
    username: string;
    role:     string;
}

export interface Type {
    id:             number;
    eventId:        number;
    type:           string;
    price:          string;
    stockMax:       number;
    stockCurrent:   number;
    userMaxPerType: number;
}

export interface Pagination {
    page:  number;
    limit: number;
    total: number;
    pages: number;
}