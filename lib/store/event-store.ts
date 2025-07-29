import { create } from 'zustand';
import { Prisma } from '@prisma/client';

// Tipo para los datos de la tarjeta de evento, devueltos por el endpoint optimizado.
export interface EventCardData {
  id: number;
  artists: string[];
  date: string;
  labelName: string;
  location: string;
  imageUrl: string;
}

// Usamos Prisma.eventGetPayload para derivar el tipo para la vista de detalle.
const eventWithDetailsArgs = {
  include: {
    ticketTypes: true,
    eventArtists: {
      include: {
        artist: true,
      },
    },
  },
};

export type EventWithDetails = Prisma.eventGetPayload<typeof eventWithDetailsArgs>;

type EventStore = {
  events: EventCardData[]; // Usamos el nuevo tipo para la lista de eventos.
  selectedEvent: EventWithDetails | null; 
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  clearSelected: () => void;
};

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('La petición de eventos ha fallado');
      const { data }: { data: EventCardData[] } = await res.json();
      set({ events: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchEventById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        // El backend ahora devuelve un error 404 con un JSON
        const errorData = await res.json();
        throw new Error(errorData.error || `No se pudo encontrar el evento con ID ${id}`);
      }
      const data: EventWithDetails = await res.json();
      set({ selectedEvent: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  clearSelected: () => set({ selectedEvent: null }),
}));