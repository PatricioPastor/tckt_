import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import prisma from '@/lib/prisma';
import { sendTicketConfirmationEmail, sendPaymentFailureEmail } from '@/lib/email';
import crypto from 'crypto';

// Initialize MercadoPago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const payment = new Payment(client);

export async function POST(req: NextRequest) {
  try {
    // Get raw body text for signature verification
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);
    
    // Verify the webhook signature from MercadoPago
    const signature = req.headers.get('x-signature');
    const requestId = req.headers.get('x-request-id');
    
    if (!verifyWebhookSignature(bodyText, signature, requestId)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    console.log('MercadoPago webhook received and verified:', body);
    
    // MercadoPago sends different types of notifications
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        return NextResponse.json({ error: 'No payment ID provided' }, { status: 400 });
      }
      
      // Get payment details from MercadoPago
      const paymentDetails = await payment.get({ id: paymentId });
      
      if (!paymentDetails) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      
      const externalReference = paymentDetails.external_reference;
      const status = paymentDetails.status || 'unknown';
      
      console.log(`Payment ${paymentId} status: ${status}, reference: ${externalReference}`);
      
      // Process the payment based on status
      await processPaymentStatus(paymentDetails, externalReference!, status);
      
      return NextResponse.json({ message: 'Webhook processed successfully' });
    }
    
    // Handle other notification types if needed
    return NextResponse.json({ message: 'Notification type not handled' });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

interface PaymentDetails {
  id: string;
  status?: string;
  external_reference?: string;
  transaction_amount?: number;
}

async function processPaymentStatus(paymentDetails: PaymentDetails, externalReference: string | null, status: string) {
  if (!externalReference) {
    console.error('No external reference found in payment');
    return;
  }
  
  try {
    // Parse external reference to get order info
    // Format: order_{userId}_{eventId}_{timestamp}
    const [, userId, eventId] = externalReference.split('_');
    
    if (!userId || !eventId) {
      console.error('Invalid external reference format:', externalReference);
      return;
    }
    
    // Find the pending tickets for this order
    const pendingTickets = await prisma.ticket.findMany({
      where: {
        ownerId: userId,
        eventId: parseInt(eventId),
        status: 'pending',
        createdAt: {
          // Look for tickets created in the last hour
          gte: new Date(Date.now() - 60 * 60 * 1000)
        }
      },
      include: {
        owner: {
          select: { name: true, email: true }
        },
        event: {
          select: { name: true, date: true, location: true }
        },
        type: {
          select: { type: true, price: true }
        }
      }
    });
    
    if (pendingTickets.length === 0) {
      console.log('No pending tickets found for reference:', externalReference);
      return;
    }
    
    const user = pendingTickets[0].owner;
    const event = pendingTickets[0].event;
    
    if (status === 'approved') {
      // Payment successful - confirm tickets
      await prisma.ticket.updateMany({
        where: {
          id: { in: pendingTickets.map(t => t.id) }
        },
        data: {
          status: 'paid'
        }
      });
      
      // Log successful payment
      await prisma.log.create({
        data: {
          userId,
          action: 'payment_confirmed',
          details: {
            paymentId: paymentDetails.id,
            externalReference,
            ticketIds: pendingTickets.map(t => t.id),
            amount: paymentDetails.transaction_amount
          }
        }
      });
      
      // Send confirmation email (if email service is configured)
      const totalAmount = pendingTickets.reduce((sum, ticket) => sum + +ticket.type.price, 0);
      
      const emailResult = await sendTicketConfirmationEmail({
        userEmail: user.email,
        userName: user.name || 'Usuario',
        eventName: event.name,
        eventDate: new Date(event.date).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        eventLocation: event.location || 'Por confirmar',
        tickets: pendingTickets.map(ticket => ({
          id: ticket.id,
          type: ticket.type.type,
          code: ticket.code!,
          qrCode: ticket.qrCode
        })),
        totalAmount,
        orderReference: externalReference
      });
      
      if (!emailResult.success) {
        console.warn('Email sending failed:', emailResult.error);
      }
      
      console.log(`Payment confirmed for ${pendingTickets.length} tickets`);
      
    } else if (status === 'rejected' || status === 'cancelled') {
      // Payment failed - cancel tickets and restore stock
      await prisma.$transaction(async (tx) => {
        // Delete the failed tickets
        await tx.ticket.deleteMany({
          where: {
            id: { in: pendingTickets.map(t => t.id) }
          }
        });
        
        // Restore stock for each ticket type
        const stockUpdates = pendingTickets.reduce((acc, ticket) => {
          const typeId = ticket.type.type;
          acc[typeId] = (acc[typeId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        for (const [ticketType, quantity] of Object.entries(stockUpdates)) {
          await tx.ticketType.updateMany({
            where: {
              eventId: parseInt(eventId),
              code: ticketType
            },
            data: {
              stockCurrent: {
                increment: quantity
              }
            }
          });
        }
        
        // Log failed payment
        await tx.log.create({
          data: {
            userId,
            action: 'payment_failed',
            details: {
              paymentId: paymentDetails.id,
              externalReference,
              status,
              ticketCount: pendingTickets.length
            }
          }
        });
      });
      
      // Send failure notification email (if configured)
      const failureEmailResult = await sendPaymentFailureEmail(
        user.email,
        user.name || 'Usuario',
        event.name,
        externalReference
      );
      
      if (!failureEmailResult.success) {
        console.warn('Failure email sending failed:', failureEmailResult.error);
      }
      
      console.log(`Payment failed for ${pendingTickets.length} tickets, stock restored`);
    }
    
  } catch (error) {
    console.error('Error processing payment status:', error);
    throw error;
  }
}

// Handle GET requests (MercadoPago sometimes sends GET for verification)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const topic = searchParams.get('topic');
  const id = searchParams.get('id');
  
  if (topic === 'payment' && id) {
    // This is a GET notification, treat it like POST
    try {
      const paymentDetails = await payment.get({ id });
      const externalReference = paymentDetails.external_reference;
      const status = paymentDetails.status || 'unknown';
      
      await processPaymentStatus(paymentDetails, externalReference!, status);
      
      return NextResponse.json({ message: 'GET webhook processed successfully' });
    } catch (error) {
      console.error('GET webhook processing error:', error);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
  }
  
  return NextResponse.json({ message: 'Webhook endpoint active' });
}

/**
 * Verifies MercadoPago webhook signature
 */
function verifyWebhookSignature(body: string, signature: string | null, requestId: string | null): boolean {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('MERCADOPAGO_WEBHOOK_SECRET not configured, skipping signature verification');
    return true; // Allow webhook in development if secret not configured
  }
  
  if (!signature || !requestId) {
    console.error('Missing signature or request ID headers');
    return false;
  }
  
  try {
    // MercadoPago signature format: ts=timestamp,v1=signature
    const parts = signature.split(',');
    let timestamp = '';
    let v1Signature = '';
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key.trim() === 'ts') {
        timestamp = value;
      } else if (key.trim() === 'v1') {
        v1Signature = value;
      }
    }
    
    if (!timestamp || !v1Signature) {
      console.error('Invalid signature format');
      return false;
    }
    
    // MercadoPago uses this exact format for the payload
    const dataId = JSON.parse(body).data?.id || '';
    const signedPayload = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
    
    // Generate HMAC SHA256 with the webhook secret
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');
    
    // Compare signatures
    const isValid = crypto.timingSafeEqual(
      Buffer.from(v1Signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
    
    if (!isValid) {
      console.error('Signature mismatch');
      console.error('Expected:', expectedSignature);
      console.error('Received:', v1Signature);
      console.error('Payload:', signedPayload);
      console.error('DataId:', dataId);
      console.error('RequestId:', requestId);
      console.error('Timestamp:', timestamp);
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}