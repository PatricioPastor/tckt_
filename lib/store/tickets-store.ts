import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TicketsStore = {
  tickets: Ticket[] | [];
  isLoading: boolean;
  error: string | null;
  findTickets: () => Promise<void>;
  getTicketsByStatus: (...args: TicketStatus[]) => Ticket[];
};

export const useTicketsStore = create<TicketsStore>()(
  persist(
    (set, get) => ({
      tickets: [],
      isLoading: false,
      error: null,
      getTicketsByStatus: (...statuses: TicketStatus[]) => {
        return get().tickets.filter(ticket => statuses.includes(ticket.status));
      },
      findTickets: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/tickets/my');
          const {data}: {data: Ticket[]} = await res.json();
          set({ tickets: data || [] });

        } catch (err) {
          set({ error: (err as Error).message });
        }finally {
          set({ isLoading: false });
        }
      },
    }),
    { name: 'ticket-storage' } 
  )
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