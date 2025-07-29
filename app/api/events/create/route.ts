// app/api/events/create/route.ts
import { auth } from '@/lib/auth'; // Better Auth config
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  let session = await auth.api.getSession({
    headers: await headers() 
  })

  const body = await req.json(); // JSON modificado
  // Validation (simplified—add Zod for prod)
  if (!body.name || !body.date || !body.location || body.ticket_types.length === 0 || body.artists.length === 0) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const [event] = await prisma.$transaction(async (tx) => {
      // Create event
      const newEvent = await tx.event.create({
        data: {
          name: body.name,
          date: new Date(body.date),
          location: body.location,
          description: body.description,
          bannerUrl: body.banner_url,
          status: body.status,
          producerId: 1, // Hardcode
          capacityTotal: body.capacity_total || body.ticket_types.reduce((sum: number, tt: any) => sum + tt.stock_max, 0),
          isRsvpAllowed: body.is_rsvp_allowed,
          eventGenre: body.event_genre
        }
      });

      // Ticket types
      await tx.ticketType.createMany({
        data: body.ticket_types.map((tt: any) => ({
          eventId: newEvent.id,
          type: tt.type,
          price: tt.price,
          stockMax: tt.stock_max,
          stockCurrent: tt.stock_current || tt.stock_max,
          userMaxPerType: tt.user_max_per_type || 5
        }))
      });

      // Artists by ID (no full data—assume IDs exist)
      await tx.eventArtist.createMany({
        data: body.artists.map((art: any) => ({
          eventId: newEvent.id,
          artistId: art.id,
          order: art.order,
          slotTime: art.slot_time,
          isHeadliner: art.is_headliner
        }))
      });

      // Log
      await tx.log.create({
        data: {
          userId: "h3RhJLjF2kCaBISUqLhBxHcVTQAJcZyj",
          action: 'event_created',
          details: { eventId: newEvent.id },
          timestamp: new Date()
        }
      });

      return [newEvent];
    });

    return Response.json({ event }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Create failed' }, { status: 500 });
  }
}


