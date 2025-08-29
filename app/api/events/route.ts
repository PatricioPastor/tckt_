import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Better Auth config
import prisma from '@/lib/prisma';
import { EventStatus } from '@prisma/client';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const whereClause = !session?.user ? { status: EventStatus.published } : {};

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
      // Asumimos que 'labelName' podría venir de una relación o un campo.
      // Por ahora, lo dejaremos como un campo hardcodeado o del evento mismo.
      eventGenre: true, // Usaremos esto como 'labelName' por ahora.
    },
    orderBy: {
      date: 'asc',
    },
  });

  if (!events || events.length === 0) {
    return NextResponse.json(
      { message: 'No se han encontrado eventos', data: [] },
      { status: 404 }
    );
  }

  // Mapeamos los datos a la estructura que el frontend espera.
  const formattedEvents = events.map(event => ({
    id: event.id,
    artists: event.eventArtists.map(ea => ea.artist.name),
    date: event.date,
    labelName: event.eventGenre || 'NO LABEL', // Placeholder si no hay género
    location: event.location,
    imageUrl: event.bannerUrl,
    name: event.name,
  }));

  return NextResponse.json({ data: formattedEvents, message: 'Eventos encontrados' }, { status: 200 });
}
