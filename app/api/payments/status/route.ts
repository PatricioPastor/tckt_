import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ 
    headers: await headers() 
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('payment_id');

  if (!paymentId) {
    return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
  }

  try {
    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        paymentId: paymentId,
        userId: session.user.id
      },
      include: {
        tickets: {
          include: {
            event: true,
            type: true
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    // Return payment status and ticket information
    return NextResponse.json({
      success: true,
      status: payment.status, // 'pending', 'approved', 'rejected'
      paymentId: payment.paymentId,
      transactionAmount: payment.amount,
      tickets: payment.tickets.map(ticket => ({
        id: ticket.id,
        qrCode: ticket.qrCode,
        event: {
          name: ticket.event.name
        },
        type: {
          type: ticket.type.type
        }
      }))
    });

  } catch (error: unknown) {
    console.error('Payment status check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check payment status' 
    }, { status: 500 });
  }
}