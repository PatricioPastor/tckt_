import { auth } from '@/lib/auth'
import { EventStatus, Prisma, PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

interface TicketTypeRequest {
  code: string;
  label: string;
  price: number | string;
  stock_max: number;
  stock_current?: number;
  user_max_per_type?: number;
}

interface ArtistRequest {
  id?: number;
  name?: string;
  bio?: string;
  image_url?: string;
  social_links?: string[];
  order?: number;
  slot_time?: string;
  is_headliner?: boolean;
}

interface CreateEventRequest {
  name: string;
  date: string;
  location: string;
  description?: string;
  banner_url?: string;
  status?: EventStatus;
  capacity_total?: number;
  is_rsvp_allowed?: boolean;
  event_genre?: string;
  ticket_types: TicketTypeRequest[];
  artists: ArtistRequest[];
}

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  // Si querés exigir login:
  // if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as CreateEventRequest

  // Validación mínima
  if (
    !body?.name ||
    !body?.date ||
    !body?.location ||
    !Array.isArray(body?.ticket_types) || body.ticket_types.length === 0 ||
    !Array.isArray(body?.artists) || body.artists.length === 0
  ) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validar unicidad de códigos de ticket
  const codes = body.ticket_types.map((t: TicketTypeRequest) => t.code)
  const dup = codes.find((c: string, i: number) => codes.indexOf(c) !== i)
  if (dup) return Response.json({ error: `Duplicated ticket code: ${dup}` }, { status: 400 })

  try {
    const [event] = await prisma.$transaction(async (tx) => {
      // Calcular capacidad desde tiers si no viene
      const capacityFromTiers = body.ticket_types.reduce(
        (sum: number, tt: TicketTypeRequest) => sum + Number(tt.stock_max || 0),
        0
      )

      // Crear evento
      const newEvent = await tx.event.create({
        data: {
          name: body.name,
          date: new Date(body.date),
          location: body.location,
          description: body.description ?? null,
          bannerUrl: body.banner_url ?? null,
          status: body.status ?? 'published',
          producerId: 1, // Hardcode por ahora
          capacityTotal: body.capacity_total ?? capacityFromTiers,
          isRsvpAllowed: body.is_rsvp_allowed ?? false,
          eventGenre: body.event_genre ?? null
        }
      })

      // Crear tipos de ticket dinámicos
      await tx.ticketType.createMany({
        data: body.ticket_types.map((tt: TicketTypeRequest) => ({
          eventId: newEvent.id,
          code: tt.code,
          label: tt.label,
          price: new Prisma.Decimal(tt.price), // mejor mandar como string
          stockMax: tt.stock_max,
          stockCurrent: tt.stock_current ?? tt.stock_max,
          userMaxPerType: tt.user_max_per_type ?? 5,
          // scanExpiration: tt.scan_expiration ? new Date(tt.scan_expiration) : null
        }))
      })

      // Resolver artistas
      const resolvedArtists: Array<{
        id: number
        order: number | null
        slotTime: string | null
        isHeadliner: boolean
      }> = []
      const missingIds: number[] = []

      for (const art of body.artists) {
        if (art.id) {
          // Validar que exista
          const exists = await tx.artist.findUnique({
            where: { id: art.id },
            select: { id: true }
          })
          if (!exists) {
            missingIds.push(art.id)
            continue
          }
          resolvedArtists.push({
            id: art.id,
            order: art.order ?? null,
            slotTime: art.slot_time ?? null,
            isHeadliner: !!art.is_headliner
          })
        } else if (art.name) {
          // Crear artista nuevo
          const created = await tx.artist.create({
            data: {
              name: art.name,
              bio: art.bio ?? null,
              imageUrl: art.image_url ?? null,
              socialLinks: art.social_links ?? []
            }
          })
          resolvedArtists.push({
            id: created.id,
            order: art.order ?? null,
            slotTime: art.slot_time ?? null,
            isHeadliner: !!art.is_headliner
          })
        } else {
          throw new Error('Each artist must have either an id or a name')
        }
      }

      if (missingIds.length) {
        throw new Error(`Missing artist ids: ${missingIds.join(', ')}`)
      }

      await tx.eventArtist.createMany({
        data: resolvedArtists.map((ra) => ({
          eventId: newEvent.id,
          artistId: ra.id,
          order: ra.order,
          slotTime: ra.slotTime,
          isHeadliner: ra.isHeadliner
        }))
      })

      
      // await tx.log.create({
      //   data: {
      //     userId: session?.user?.id ?? 'system',
      //     action: 'event_created',
      //     details: { eventId: newEvent.id },
      //     timestamp: new Date()
      //   }
      // })

      return [newEvent]
    })

    return Response.json({ event }, { status: 200 })
  } catch (err: unknown) {
    console.error(err)
    const errorMessage = err instanceof Error ? err.message : 'Create failed'
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
