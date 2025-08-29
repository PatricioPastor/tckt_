// app/api/events/[id]/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Opcional, si querés evitar cacheos raros en prod:
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Params = { id: string }

// ✅ En Next 14.2+/15, params viene como Promise en Route Handlers
export async function GET(
  _req: Request,
  ctx: { params: Promise<Params> } // 👈 importante
) {
  try {
    const { id } = await ctx.params                    // 👈 await params
    const eventId = Number(id)

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: true,
        eventArtists: {
          include: { artist: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    return NextResponse.json(event, { status: 200 })
  } catch (err) {
    console.error('Error al obtener el evento:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
