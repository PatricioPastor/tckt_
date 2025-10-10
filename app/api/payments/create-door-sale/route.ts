// app/api/payments/create-door-sale/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPaymentPreference } from "@/lib/mercadopago";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { eventId, buyerName, quantity = 1 } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 10" },
        { status: 400 }
      );
    }

    // 1. Validate event exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      select: { id: true, name: true, status: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found or invalid" },
        { status: 404 }
      );
    }

    if (event.status !== "published") {
      return NextResponse.json(
        { error: "Event is not available for ticket sales" },
        { status: 400 }
      );
    }

    // 2. Server-side price calculation (CRITICAL - prevents client manipulation)
    const BASE_PRICE = 30000;
    const APP_FEE_RATE = 0.08;
    const MP_FEE_RATE = 0.06;

    const appFee = BASE_PRICE * APP_FEE_RATE;
    const priceWithAppFee = BASE_PRICE + appFee;
    const pricePerTicket = Math.round((priceWithAppFee / (1 - MP_FEE_RATE)) * 100) / 100;
    const totalPrice = pricePerTicket * quantity;

    console.log("[Door Sale] Price calculation:", {
      basePrice: BASE_PRICE,
      appFee,
      priceWithAppFee,
      totalPrice,
    });

    // 3. Generate unique external reference
    const externalReference = `DOOR-SALE-${randomUUID()}`;

    // 4. Create Mercado Pago payment preference
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Build title based on buyer name and quantity
    const ticketTitle = buyerName
      ? `${quantity > 1 ? `${quantity} Entradas` : "Entrada"} en Puerta - ${buyerName}`
      : `${quantity > 1 ? `${quantity} Entradas` : "Entrada"} en Puerta - ${event.name}`;

    const preferenceData = {
      items: [
        {
          id: `door-sale-${event.id}`,
          title: ticketTitle,
          description: `${quantity} entrada(s) en puerta para ${event.name}`,
          category_id: "tickets",
          quantity: quantity,
          unit_price: pricePerTicket,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: `${baseUrl}/door-sale/success`,
        failure: `${baseUrl}/door-sale/failure`,
        pending: `${baseUrl}/door-sale/pending`,
      },
      auto_return: "approved" as const,
      external_reference: externalReference,
      notification_url: `${baseUrl}/api/payments/webhook`,
      statement_descriptor: "NoTrip Puerta",
      metadata: {
        type: "door-sale",
        event_id: event.id,
        base_price: BASE_PRICE,
        total_price: totalPrice,
        buyer_name: buyerName || null,
        quantity: quantity,
      },
    };

    console.log("[Door Sale] Creating MP preference:", {
      eventId: event.id,
      eventName: event.name,
      externalReference,
      totalPrice,
    });

    const result = await createPaymentPreference(preferenceData);

    if (!result.success) {
      console.error("[Door Sale] Failed to create preference:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to create payment preference" },
        { status: 500 }
      );
    }

    console.log("[Door Sale] Preference created successfully:", {
      preferenceId: result.data?.id,
      initPoint: result.data?.init_point,
    });

    return NextResponse.json({
      success: true,
      initPoint: result.data?.init_point,
      sandboxInitPoint: result.data?.sandbox_init_point,
      externalReference,
    });
  } catch (error) {
    console.error("[Door Sale] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
