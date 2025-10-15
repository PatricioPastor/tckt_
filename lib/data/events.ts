import { cache } from 'react';
import prisma from '@/lib/prisma';
import { EventStatus } from '@prisma/client';
import { 
  EventCardData, 
  EventWithDetails, 
  eventWithDetailsInclude,
  EventForMetadata,
  eventForMetadataInclude
} from '@/lib/types/event.types';

/**
 * Get all published events for home page
 * Cached for the duration of the request
 */
export const getPublishedEvents = cache(async (): Promise<EventCardData[]> => {
  const events = await prisma.event.findMany({
    where: { 
      status: EventStatus.published 
    },
    include: {
      eventArtists: {
        include: {
          artist: true,
        },
        orderBy: {
          order: 'asc'
        }
      },
    },
    orderBy: {
      date: 'asc'
    }
  });

  return events.map((event) => ({
    id: event.id,
    name: event.name,
    date: event.date.toISOString(),
    location: event.location,
    imageUrl: event.bannerUrl || '/background.png',
    labelName: event.eventGenre || 'NO LABEL',
    artists: event.eventArtists.map((ea) => ea.artist.name),
    isSoldOut: event.isSoldOut ?? false,
  }));
});

/**
 * Get event by ID with full details
 * Cached for the duration of the request
 * Serializes Decimal fields to strings for Client Components
 */
export const getEventById = cache(async (id: number): Promise<EventWithDetails | null> => {
  const event = await prisma.event.findUnique({
    where: { id },
    ...eventWithDetailsInclude,
  });

  if (!event) return null;

  // Serialize Decimal to string for Client Components
  return {
    ...event,
    ticketTypes: event.ticketTypes.map(tt => ({
      ...tt,
      price: tt.price.toString(),
    })),
  } as any;
});

/**
 * Get event for metadata generation (minimal data)
 * Cached for the duration of the request
 */
export const getEventForMetadata = cache(async (id: number): Promise<EventForMetadata | null> => {
  return await prisma.event.findUnique({
    where: { id },
    ...eventForMetadataInclude,
  });
});
