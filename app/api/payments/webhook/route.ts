// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import prisma from "@/lib/prisma";

import crypto from "crypto";
import { PaymentStatus, TicketStatus } from "@/app/generated/prisma";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});
const mpPayment = new Payment(client);

// --- Helpers ---
function mapMpToPaymentStatus(mp: string | null | undefined): PaymentStatus {
  switch (mp) {
    case "approved":
      return PaymentStatus.approved;
    case "rejected":
      return PaymentStatus.rejected;
    case "cancelled":
      return PaymentStatus.cancelled;
    case "in_process":
      return PaymentStatus.in_process;
    case "refunded":
      return PaymentStatus.refunded;
    default:
      return PaymentStatus.pending;
  }
}

function mapMpToTicketStatus(mp: string | null | undefined): TicketStatus {
  switch (mp) {
    case "approved":
      return TicketStatus.paid;
    case "rejected":
    case "cancelled":
    case "refunded":
      return TicketStatus.pending; // Mantener como pending para que puedan volver a intentar
    default:
      return TicketStatus.pending;
  }
}

function verifyWebhookSignature(
  body: string,
  signature: string | null,
  requestId: string | null
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // desactivado en dev si no hay secreto
  if (!signature || !requestId) return false;

  try {
    const parts = signature.split(",");
    let ts = "",
      v1 = "";
    for (const p of parts) {
      const [k, v] = p.split("=");
      if (k.trim() === "ts") ts = v;
      if (k.trim() === "v1") v1 = v;
    }
    const dataId = JSON.parse(body).data?.id || "";
    const signedPayload = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(v1, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

async function handleDoorSalePayment(pd: any, extRef: string) {
  console.log(`[Webhook Door Sale] Processing door sale payment, extRef: ${extRef}`);

  // Extract metadata
  const metadata = pd.metadata || {};
  const eventId = metadata.event_id ? parseInt(metadata.event_id) : null;
  const quantity = metadata.quantity ? parseInt(metadata.quantity) : 1;

  if (!eventId) {
    console.error(`[Webhook Door Sale] Missing event_id in metadata`);
    throw new Error("Missing event_id in payment metadata");
  }

  // Extract payer information
  const payerEmail = pd.payer?.email;
  const payerName = pd.payer?.first_name
    ? `${pd.payer.first_name} ${pd.payer.last_name || ''}`.trim()
    : pd.payer?.email?.split('@')[0] || 'Guest User';

  if (!payerEmail) {
    console.error(`[Webhook Door Sale] Missing payer email`);
    throw new Error("Missing payer email");
  }

  console.log(`[Webhook Door Sale] Payer info:`, { payerEmail, payerName, eventId });

  const paymentStatus = mapMpToPaymentStatus(pd.status);
  const ticketStatus = mapMpToTicketStatus(pd.status);

  // Only process approved payments for door sales
  if (pd.status !== 'approved') {
    console.log(`[Webhook Door Sale] Payment not approved (status: ${pd.status}), skipping user/ticket creation`);
    return {
      ok: true,
      paymentStatus,
      ticketStatus,
      externalReference: extRef,
      mpPaymentId: String(pd.id),
      message: "Payment not approved yet"
    };
  }

  // Find or create the ticketType for door sales
  const ticketType = await prisma.ticketType.findFirst({
    where: {
      eventId: eventId,
      code: 'DOOR-SALE'
    }
  });

  if (!ticketType) {
    console.error(`[Webhook Door Sale] DOOR-SALE ticket type not found for event ${eventId}`);
    throw new Error(`DOOR-SALE ticket type not found for event ${eventId}`);
  }

  // Transaction: Find or create user, create payment, create ticket
  const result = await prisma.$transaction(async (tx) => {
    // 1. Find or create user
    const user = await tx.user.upsert({
      where: { email: payerEmail },
      update: {}, // No updates if user exists
      create: {
        id: crypto.randomUUID(),
        email: payerEmail,
        name: payerName,
        emailVerified: true,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`[Webhook Door Sale] User upserted: ${user.id} (${user.email})`);

    // 2. Create payment record
    const payment = await tx.payment.create({
      data: {
        userId: user.id,
        eventId: eventId,
        status: paymentStatus,
        amount: pd.transaction_amount,
        currency: pd.currency_id || 'ARS',
        provider: 'mercadopago',
        externalReference: extRef,
        mpPaymentId: String(pd.id),
        payerEmail: payerEmail,
        payerName: payerName,
      },
    });

    console.log(`[Webhook Door Sale] Payment created: ${payment.id}`);

    // 3. Create tickets with unique QR codes (based on quantity)
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const qrCode = `DOOR-${crypto.randomUUID()}`;
      const ticketCode = `DOOR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const ticket = await tx.ticket.create({
        data: {
          eventId: eventId,
          ownerId: user.id,
          typeId: ticketType.id,
          paymentId: payment.id,
          qrCode: qrCode,
          code: ticketCode,
          status: ticketStatus,
        },
      });

      tickets.push(ticket);
      console.log(`[Webhook Door Sale] Ticket ${i + 1}/${quantity} created: ${ticket.id} with QR: ${qrCode}`);
    }

    // 4. Log the action
    await tx.log.create({
      data: {
        userId: user.id,
        action: 'door_sale_completed',
        details: {
          paymentId: String(pd.id),
          externalReference: extRef,
          mpStatus: pd.status,
          localPaymentStatus: paymentStatus,
          localTicketStatus: ticketStatus,
          ticketIds: tickets.map(t => t.id),
          ticketCount: tickets.length,
          eventId: eventId,
          amount: pd.transaction_amount,
        },
      },
    });

    return {
      user,
      payment,
      tickets,
    };
  });

  console.log(`[Webhook Door Sale] Door sale completed successfully for user ${result.user.email}, ${result.tickets.length} ticket(s) created`);

  return {
    ok: true,
    paymentStatus,
    ticketStatus,
    externalReference: extRef,
    mpPaymentId: String(pd.id),
    userId: result.user.id,
    ticketIds: result.tickets.map(t => t.id),
    ticketCount: result.tickets.length,
  };
}

async function updateFromPaymentId(paymentId: string) {
  console.log(`[Webhook] Processing payment ID: ${paymentId}`);

  try {
    // 1) Traer pago desde MP
    const pd = await mpPayment.get({ id: paymentId });
    if (!pd) {
      console.error(`[Webhook] MP payment not found: ${paymentId}`);
      throw new Error("MP payment not found");
    }

    const extRef = pd.external_reference ?? null;
    if (!extRef) {
      console.error(`[Webhook] Missing external_reference for payment: ${paymentId}`);
      throw new Error("Missing external_reference");
    }

    console.log(`[Webhook] Found MP payment: ${paymentId}, status: ${pd.status}, extRef: ${extRef}`);

    // Check if this is a door-sale payment
    const isDoorSale = extRef.startsWith('DOOR-SALE-');

    if (isDoorSale) {
      console.log(`[Webhook] Detected door-sale payment`);
      return await handleDoorSalePayment(pd, extRef);
    }

    // Regular payment flow (existing implementation)
    const paymentStatus = mapMpToPaymentStatus(pd.status);
    const ticketStatus = mapMpToTicketStatus(pd.status);

    console.log(`Processing payment ${paymentId}: MP status '${pd.status}' -> Payment: '${paymentStatus}', Tickets: '${ticketStatus}'`);

    // 2) Buscar fila local por externalReference
    const paymentRow = await prisma.payment.findUnique({
      where: { externalReference: extRef },
      include: {
        tickets: {
          select: { id: true, status: true }
        },
        user: {
          select: { email: true, name: true }
        },
        event: {
          select: { name: true }
        }
      },
    });

    if (!paymentRow) {
      console.error(`[Webhook] Local payment not found for external_reference: ${extRef}`);
      throw new Error(`Local payment not found for external_reference: ${extRef}`);
    }

    console.log(`[Webhook] Found local payment: ${paymentRow.id}, current status: ${paymentRow.status}, tickets: ${paymentRow.tickets.length}`);

    // 3) Actualizar payment + tickets con tipos correctos
    await prisma.$transaction(async (tx) => {
      // Actualizar payment
      await tx.payment.update({
        where: { id: paymentRow.id },
        data: {
          status: paymentStatus,
          mpPaymentId: String(pd.id),
        },
      });

      // Actualizar tickets asociados
      await tx.ticket.updateMany({
        where: { paymentId: paymentRow.id },
        data: {
          status: ticketStatus,
        },
      });

      // Log de auditoria
      await tx.log.create({
        data: {
          userId: paymentRow.userId,
          action: paymentStatus === PaymentStatus.approved ? 'payment_approved' : 'payment_failed',
          details: {
            paymentId: String(pd.id),
            externalReference: extRef,
            mpStatus: pd.status,
            localPaymentStatus: paymentStatus,
            localTicketStatus: ticketStatus,
            ticketCount: paymentRow.tickets.length,
            amount: pd.transaction_amount
          }
        }
      });
    });

    console.log(`[Webhook] Payment ${paymentId} processed successfully. Status: ${paymentStatus}, Tickets updated: ${paymentRow.tickets.length}`);

    return {
      ok: true,
      paymentStatus,
      ticketStatus,
      externalReference: extRef,
      ticketsUpdated: paymentRow.tickets.length,
      mpPaymentId: String(pd.id)
    };
  } catch (error) {
    console.error(`[Webhook] Error processing payment ${paymentId}:`, error);
    throw error;
  }
}

// --- Handlers ---
export async function POST(req: NextRequest) {
  console.log(`[Webhook] POST received`);
  
  try {
    const bodyText = await req.text();
    const sig = req.headers.get("x-signature");
    const reqId = req.headers.get("x-request-id");
    
    console.log(`[Webhook] Signature present: ${!!sig}, RequestId present: ${!!reqId}`);
    
    if (!verifyWebhookSignature(bodyText, sig, reqId)) {
      console.warn(`[Webhook] Invalid signature - rejecting`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = bodyText ? JSON.parse(bodyText) : {};
    const paymentId =
      body?.data?.id ||
      req.nextUrl.searchParams.get("id"); // por si querés probar rápido con ?id=

    console.log(`[Webhook] Body type: ${body?.type}, Payment ID: ${paymentId}`);

    if (!paymentId) {
      console.error(`[Webhook] Missing payment ID in request`);
      return NextResponse.json({ error: "Missing payment id" }, { status: 400 });
    }

    // Solo procesar notificaciones de tipo payment
    if (body?.type && body.type !== 'payment') {
      console.log(`[Webhook] Ignoring non-payment notification: ${body.type}`);
      return NextResponse.json({ message: "Non-payment notification ignored" });
    }

    const result = await updateFromPaymentId(String(paymentId));
    console.log(`[Webhook] Successfully processed payment: ${paymentId}`);
    return NextResponse.json(result);
  } catch (e) {
    console.error(`[Webhook] POST error:`, e);
    return NextResponse.json({ 
      error: "Internal error", 
      message: e instanceof Error ? e.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // atajo de testeo: /api/payments/webhook?id=123
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    console.log(`[Webhook] GET health check`);
    return NextResponse.json({ 
      message: "Webhook alive", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV 
    });
  }
  
  console.log(`[Webhook] GET test with payment ID: ${id}`);
  try {
    const result = await updateFromPaymentId(id);
    return NextResponse.json(result);
  } catch (e) {
    console.error(`[Webhook] GET error for ID ${id}:`, e);
    return NextResponse.json({ 
      error: "Processing failed", 
      paymentId: id,
      message: e instanceof Error ? e.message : "Unknown error"
    }, { status: 500 });
  }
}
