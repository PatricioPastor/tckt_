import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import QRCode from 'qrcode';
import { headers } from 'next/headers';
import { TicketStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ 
    headers: await headers() 
  });

  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch user for role (since session lacks it)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || user.role !== 'user') {
    return NextResponse.json({ error: 'Forbidden - Only user role can buy' }, { status: 403 });
  }

  const { eventId, selections } = await req.json(); // selections: [{type: 'general', quantity: 2}, ...]
  if (!eventId || !selections?.length) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId }, include: { ticketTypes: true } });
      if (!event) throw new Error('Event not found');

      const tickets = [];
      for (const sel of selections) {
        const tt = event.ticketTypes.find(t => t.type === sel.type);
        if (!tt || tt.stockCurrent < sel.quantity) throw new Error('Insufficient stock for ' + sel.type);
        const userTickets = await tx.ticket.count({ where: { ownerId: session.user.id, typeId: tt.id } });
        if (userTickets + sel.quantity > tt.userMaxPerType) throw new Error('User limit exceeded for ' + sel.type);

        // Generate unique QRs
        for (let i = 0; i < sel.quantity; i++) {
          const qrData = `ticket_${eventId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const qrCode = await QRCode.toDataURL(qrData); // Base64 QR
          tickets.push({
            eventId,
            ownerId: session.user.id,
            typeId: tt.id,
            qrCode,
            status: 'pending' as TicketStatus,
            createdAt: new Date(),
          });
        }

        // Decrement stock
        const updatedTicketType = await tx.ticketType.update({
          where: { id: tt.id },
          data: { stockCurrent: tt.stockCurrent - sel.quantity },
          include: { event: true },
        });
      }

      // Insert tickets
      await tx.ticket.createMany({ data: tickets });

      // Log
      await tx.log.create({
        data: { userId: session.user.id, action: 'tickets_purchased', details: { eventId, ticketCount: tickets.length } },
      });

      // We don't have IDs yet since we just created them
      // Return the count instead of IDs
      return { ticketCount: tickets.length };
    });

    // Stub MP: Create preference here, return init_point
    // const mp = new MercadoPago(...);
    // const preference = await mp.preferences.create({...});
    // return NextResponse.json({ init_point: preference.init_point }, { status: 200 });

    return NextResponse.json({ message: 'Tickets created', data: result }, { status: 200 });
  } catch (error:any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}