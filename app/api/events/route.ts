import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EventStatus } from '@/app/generated/prisma';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

export async function GET() {
  try {
    // ALWAYS show only published events (no authentication bypass)
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

    // Map the data to the structure expected by the frontend
    const formattedEvents = events.map((event) => ({
      id: event.id,
      artists: event.eventArtists.map((ea) => ea.artist.name),
      date: event.date.toISOString(), // Consistent ISO string
      labelName: event.eventGenre || 'NO LABEL',
      location: event.location,
      imageUrl: event.bannerUrl || '/background.jpg', // Fallback
      name: event.name,
      isSoldOut: event.isSoldOut ?? false,
    }));

    return NextResponse.json(
      { data: formattedEvents, message: 'Eventos encontrados' },
      { status: 200 }
    );
  } catch (error) {
    // Log to external service in production
    console.error('[API Events] Error fetching events:', error);
    
    return NextResponse.json(
      { message: 'Error al obtener los eventos', data: [] },
      { status: 500 }
    );
  }
}