import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import QRCode from 'qrcode';
import { headers } from 'next/headers';
import { TicketStatus } from '@/app/generated/prisma'

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ 
    headers: await headers() 
  });

  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || user.role !== 'user') {
    return NextResponse.json({ error: 'Forbidden - Only user role can acquire tickets' }, { status: 403 });
  }

  const { eventId, selections, sendEmail = false, referredByRrppId } = await req.json();
  if (!eventId || !selections?.length) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  try {
    
    const result:any = await prisma.$transaction(async (tx:any) => {
      const event = await tx.event.findUnique({ 
        where: { id: eventId }, 
        include: { 
          ticketTypes: {
            select: {
              id: true, code: true, label: true, price: true, 
              stockCurrent: true, userMaxPerType: true, 
              minPurchaseQuantity: true, isDisabled: true
            }
          }
        } 
      });
      if (!event) throw new Error('Event not found');

      const tickets = [];

      for (const sel of selections) {
        const tt = event.ticketTypes.find(t => t.code === sel.code);
        if (!tt) throw new Error('Ticket type not found: ' + sel.code);

        // Validar que el ticket no esté deshabilitado
        if (tt.isDisabled) {
          throw new Error(`Ticket type ${tt.label} is currently disabled and cannot be acquired`);
        }

        // Validar cantidad mínima de compra (combos)
        if (sel.quantity < tt.minPurchaseQuantity) {
          throw new Error(`${tt.label} requires a minimum purchase of ${tt.minPurchaseQuantity} tickets`);
        }

        // Ensure it's actually a free ticket
        if (Number(tt.price) > 0) throw new Error('This endpoint only handles free tickets');
        
        if (tt.stockCurrent < sel.quantity) throw new Error('Insufficient stock for ' + sel.type);
        
        // Check user limits
        const userTickets = await tx.ticket.count({ 
          where: { ownerId: session.user.id, typeId: tt.id } 
        });
        if (userTickets + sel.quantity > tt.userMaxPerType) {
          throw new Error('User limit exceeded for ' + sel.type);
        }

        // Generate unique QRs for each ticket
        for (let i = 0; i < sel.quantity; i++) {
          const qrData = `ticket_${eventId}_${tt.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const qrCode = await QRCode.toDataURL(qrData);
          tickets.push({
            eventId,
            ownerId: session.user.id,
            typeId: tt.id,
            qrCode,
            code: qrData,
            status: 'paid' as TicketStatus, // Free tickets are immediately "paid"
            referredByRrppId: referredByRrppId || null,
            createdAt: new Date(),
          });
        }

        // Update stock
        await tx.ticketType.update({
          where: { id: tt.id },
          data: { stockCurrent: tt.stockCurrent - sel.quantity },
        });
      }

      // Insert tickets as paid (no payment needed)
      await tx.ticket.createMany({ data: tickets });

      // Get the created tickets
      const createdTickets = await tx.ticket.findMany({
        where: {
          ownerId: session.user.id,
          eventId,
          status: 'paid',
          createdAt: {
            gte: new Date(Date.now() - 5000) // Last 5 seconds
          }
        },
        include: {
          event: true,
          type: true,
          owner: true
        }
      });

      // Log the free ticket acquisition
      await tx.log.create({
        data: { 
          userId: session.user.id, 
          action: 'free_tickets_acquired', 
          details: { 
            eventId, 
            ticketCount: tickets.length,
            sendEmail
          } 
        },
      });

      return { 
        tickets: createdTickets,
        event,
        sendEmail
      };
    });

    // TODO: Implement email sending if sendEmail is true
    if (result.sendEmail) {
      // Send QR codes via email
      console.log('TODO: Send QR codes to user email');
    }

    return NextResponse.json({ 
      success: true,
      message: 'Free tickets acquired successfully',
      data: {
        tickets: result.tickets,
        ticketCount: result.tickets.length,
        event: result.event
      }
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Free ticket acquisition error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Free ticket acquisition failed';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}