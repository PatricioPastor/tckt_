import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user;

    if (!user) {
      await logAction('unauthorized');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const code:string | null = typeof body.qrCode === 'string' ? body.qrCode.trim() : null;

    if (!code) {
      await logAction('no_code');
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    
    const ticket = await prisma.ticket.findUnique({
      where: { code },
      include: { event: true, owner: true, type: true }, // Incluye type para scanExpiration
    });

    logData({ ticket, code });

    if (!ticket) {
      await logAction('ticket_not_found');
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.status === 'used') {
      await logAction('ticket_already_used');
      return NextResponse.json({ success: false, error: 'Ticket already used' }, { status: 409 });
    }

    if (!['paid', 'free'].includes(ticket.status)) {
      await logAction('ticket_invalid');
      return NextResponse.json({
        success: false,
        error: `Ticket is not valid (status: ${ticket.status})`,
      }, { status: 400 });
    }

    // Validar scanExpiration si existe
    const now = new Date();
    if (ticket.type.scanExpiration && now > ticket.type.scanExpiration) {
      await logAction('ticket_expired');
      return NextResponse.json({ success: false, error: 'Ticket expired for scanning' }, { status: 400 });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { code },
      data: { status: 'used' },
    });

    await logAction('ticket_used');

    return NextResponse.json({
      success: true,
      message: 'Ticket validated successfully.',
      ticket: {
        id: updatedTicket.id,
        code: updatedTicket.code,
        status: updatedTicket.status,
        // event: {
        //   id: ticket.event.id,
        //   name: ticket.event.name,
        // },
        // owner: {
        //   id: ticket.owner?.id,
        //   name: ticket.owner?.name,
        //   email: ticket.owner?.email,
        // },
      },
    });
  } catch (error: unknown) {
    console.error('Error scanning ticket:', error);
    await logAction('error_scanning_ticket');
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

async function logAction(action: string) {
  const logEntry = `${new Date().toISOString()}: ${action}\n`;
  console.log(logEntry);
}

async function logData(data: object) {
  const logEntry = `${new Date().toISOString()}: ${JSON.stringify(data)}\n`;
  console.log(logEntry);
}