import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth'; // Better Auth config
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers:  await headers() });
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const offset = (page - 1) * limit;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const role = user.role;


  let whereClause: { ownerId?: string; eventId?: { in: number[] } } = {};

  // Role-based filtering
  if (role === 'user') {
    // For regular users, only show their own tickets
    whereClause = { ownerId: session.user.id };
  } else if (role === 'rrpp' || role === 'qr_scanner') {
    // For RRPP or scanner roles, show tickets for their assigned events
    const assignedEvents = await prisma.rrppAssignment.findMany({
      where: { rrppUserId: session.user.id },
      select: { eventId: true },
    });
    whereClause = { eventId: { in: assignedEvents.map(a => a.eventId) } };
  } 
  // For superadmin/head_producer we don't filter by anything - they see all tickets

  try {
    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        event: true,
        type: true,
        owner: { select: { username: true, role: true } }, // Partial user data
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.ticket.count({ where: whereClause });
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      message: tickets.length > 0 ? 'Tickets retrieved' : 'No tickets found',
      data: tickets,
      pagination: { page, limit, total, pages },
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error', data: [] }, { status: 500 });
  }
}