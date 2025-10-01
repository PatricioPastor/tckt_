// app/api/payments/process/route.ts - Process direct card payments with MercadoPago
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { PaymentStatus, TicketStatus } from '@/app/generated/prisma';


const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});
const mpPayment = new Payment(client);

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, token, installments, issuerId, paymentMethodId } = await req.json();

    // Validar que el payment exista y pertenezca al usuario
    
    const paymentRecord = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        tickets: true,
        event: true,
        user: true
      }
    });

    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (paymentRecord.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (paymentRecord.status === 'approved') {
      return NextResponse.json({ error: 'Payment already processed' }, { status: 400 });
    }

    // Crear el pago en MercadoPago
    const paymentData = {
      transaction_amount: Number(paymentRecord.amount),
      token,
      installments: Number(installments),
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email: paymentRecord.payerEmail || paymentRecord.user.email,
        identification: paymentRecord.user.dni ? {
          type: 'DNI',
          number: paymentRecord.user.dni
        } : undefined
      },
      external_reference: paymentRecord.externalReference,
      description: `${paymentRecord.event.name} - ${paymentRecord.tickets.length} tickets`,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/webhook`,
      statement_descriptor: 'NoTrip Tickets',
    };

    console.log('[Process Payment] Creating MP payment:', {
      amount: paymentData.transaction_amount,
      externalReference: paymentData.external_reference,
      ticketCount: paymentRecord.tickets.length
    });

    const mpResponse = await mpPayment.create({ body: paymentData });

    console.log('[Process Payment] MP Response:', {
      id: mpResponse.id,
      status: mpResponse.status,
      status_detail: mpResponse.status_detail
    });

    // Mapear status de MP
    const mapStatus = (status: string | null | undefined): PaymentStatus => {
      switch (status) {
        case 'approved': return PaymentStatus.approved;
        case 'rejected': return PaymentStatus.rejected;
        case 'cancelled': return PaymentStatus.cancelled;
        case 'in_process': return PaymentStatus.in_process;
        case 'refunded': return PaymentStatus.refunded;
        default: return PaymentStatus.pending;
      }
    };

    const newStatus = mapStatus(mpResponse.status);
    const ticketStatus = mpResponse.status === 'approved' ? TicketStatus.paid : TicketStatus.pending;

    // Actualizar payment y tickets
    
    await prisma.$transaction(async (tx:any) => {
      await tx.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: newStatus,
          mpPaymentId: String(mpResponse.id),
        }
      });

      if (mpResponse.status === 'approved') {
        await tx.ticket.updateMany({
          where: { paymentId: paymentRecord.id },
          data: { status: ticketStatus }
        });
      }

      await tx.log.create({
        data: {
          userId: session.user.id,
          action: mpResponse.status === 'approved' ? 'payment_approved' : 'payment_processed',
          details: {
            paymentId: String(mpResponse.id),
            status: mpResponse.status,
            status_detail: mpResponse.status_detail,
            amount: mpResponse.transaction_amount,
            externalReference: paymentRecord.externalReference
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      status: mpResponse.status,
      status_detail: mpResponse.status_detail,
      payment_id: mpResponse.id,
      external_reference: paymentRecord.externalReference
    });

  } catch (error: unknown) {
    console.error('[Process Payment] Error:', error);

    // MercadoPago errores específicos
    if (error && typeof error === 'object' && 'cause' in error) {
      const cause = error.cause as { message?: string; cause?: unknown };
      console.error('[Process Payment] MP Error details:', cause);
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed'
    }, { status: 500 });
  }
}