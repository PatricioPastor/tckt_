import { Prisma } from '@prisma/client';

/**
 * Event Card Data - Optimized for list views (home page, carousels)
 */
export interface EventCardData {
  id: number;
  name: string;
  date: string; // ISO string
  location: string;
  imageUrl: string | null;
  labelName: string;
  artists: string[];
  isSoldOut: boolean;
}

/**
 * Event with full details including ticket types and artists
 * Used in detail pages
 */
export const eventWithDetailsInclude = Prisma.validator<Prisma.eventDefaultArgs>()({
  include: {
    ticketTypes: true,
    eventArtists: {
      include: {
        artist: true,
      },
      orderBy: {
        order: 'asc'
      }
    }
  },
});

export type EventWithDetails = Prisma.eventGetPayload<typeof eventWithDetailsInclude>;

/**
 * Event with minimal data for metadata generation
 */
export const eventForMetadataInclude = Prisma.validator<Prisma.eventDefaultArgs>()({
  include: {
    eventArtists: {
      include: {
        artist: {
          select: {
            name: true,
          }
        },
      },
    },
  },
});

export type EventForMetadata = Prisma.eventGetPayload<typeof eventForMetadataInclude>;
