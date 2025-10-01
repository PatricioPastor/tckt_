// app/api/payments/preference/route.ts - Create MercadoPago Checkout Pro preference
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { createPaymentPreference } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Obtener información del payment y tickets
    
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            dni: true,
            username: true
          }
        },
        event: {
          select: {
            name: true,
            id: true
          }
        },
        tickets: {
          include: {
            type: {
              select: {
                label: true,
                code: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (payment.status === 'approved') {
      return NextResponse.json({ error: 'Payment already approved' }, { status: 400 });
    }

    // Agrupar tickets por tipo para crear items
    const ticketsByType = new Map<number, { label: string; quantity: number; code: string }>();

    for (const ticket of payment.tickets) {
      const existing = ticketsByType.get(ticket.typeId);
      if (existing) {
        existing.quantity++;
      } else {
        ticketsByType.set(ticket.typeId, {
          label: ticket.type.label,
          code: ticket.type.code,
          quantity: 1
        });
      }
    }

    // Calcular precio unitario por tipo (total del payment / cantidad de tickets)
    const totalTickets = payment.tickets.length;
    const unitPrice = Number(payment.amount) / totalTickets;

    // Crear items para la preferencia
    const items = Array.from(ticketsByType.entries()).map(([typeId, data]) => ({
      id: `ticket_type_${typeId}`,
      title: `${payment.event.name} - ${data.label}`,
      description: `Entrada ${data.label} para ${payment.event.name}`,
      category_id: 'tickets',
      quantity: data.quantity,
      unit_price: Number(unitPrice.toFixed(2)),
      currency_id: 'ARS'
    }));

    // Preparar datos del comprador
    const [firstName, ...lastNameParts] = (payment.user.name || '').split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const preferenceData = {
      items,
      payer: {
        name: firstName,
        surname: lastName,
        email: session.user.email,
        identification: payment.user.dni ? {
          type: 'DNI',
          number: payment.user.dni
        } : undefined
      },
      external_reference: payment.externalReference,
      metadata: {
        payment_id: payment.id,
        event_id: payment.event.id,
        user_id: payment.userId
      }
    };

    console.log('[Preference] Creating preference for payment:', {
      paymentId: payment.id,
      externalReference: payment.externalReference,
      amount: payment.amount,
      ticketCount: payment.tickets.length
    });

    const result = await createPaymentPreference(preferenceData);

    if (!result.success) {
      console.error('[Preference] Failed to create preference:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Actualizar payment con preferenceId
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        mpPreferenceId: result.data?.id
      }
    });

    await prisma.log.create({
      data: {
        userId: session.user.id,
        action: 'preference_created',
        details: {
          paymentId: payment.id,
          preferenceId: result.data?.id,
          externalReference: payment.externalReference
        }
      }
    });

    console.log('[Preference] Preference created successfully:', {
      preferenceId: result.data?.id,
      initPoint: result.data?.init_point
    });

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('[Preference] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create preference'
    }, { status: 500 });
  }
}