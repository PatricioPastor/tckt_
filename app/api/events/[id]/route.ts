import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Asumiendo que tienes una instancia de prisma centralizada

// Definimos el contexto para obtener los parámetros de la URL
interface Context {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Safely convert and validate the ID
    const eventId = params?.id ? parseInt(params.id, 10) : null;
    
    if (!eventId || isNaN(eventId)) {
      return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        ticketTypes: true,
        eventArtists: {     // Corregido de 'artists' a 'eventArtists'
          include: {
            artist: true,     // Incluir los detalles del artista a través de la tabla intermedia
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(event, { status: 200 });

  } catch (error) {
    console.error('Error al obtener el evento:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
