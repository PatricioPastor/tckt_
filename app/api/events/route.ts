import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Better Auth config
import prisma from '@/lib/prisma';
import { EventStatus } from '@/app/generated/prisma';

export async function GET() {
  // Get the session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Define the where clause only for non-authenticated users
  const whereClause = session?.user
    ? {} 
    : { status: EventStatus.published }; // Only published events for non-authenticated users

  try {
    // Fetch events with explicit type-safe arguments
    
    const events = await prisma.event.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        date: true,
        location: true,
        bannerUrl: true,
        eventArtists: {
          select: {
            artist: {
              select: {
                name: true,
              },
            },
          },
        },
        eventGenre: true,
      },
    });

    // Check if events are empty
    if (!events || events.length === 0) {
      return NextResponse.json(
        { message: 'No se han encontrado eventos', data: [] },
        { status: 404 }
      );
    }

    // Map the data to the structure expected by the frontend
    const formattedEvents = events.map((event) => ({
      id: event.id,
      artists: event.eventArtists.map((ea) => ea.artist.name),
      date: event.date,
      labelName: event.eventGenre || 'NO LABEL', // Placeholder if no genre
      location: event.location,
      imageUrl: event.bannerUrl,
      name: event.name,
    }));

    return NextResponse.json(
      { data: formattedEvents, message: 'Eventos encontrados' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'Error al obtener los eventos', data: [] },
      { status: 500 }
    );
  }
}