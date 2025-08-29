// app/api/tickets/buy/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import QRCode from 'qrcode'
import { headers } from 'next/headers'
import { TicketStatus, Prisma } from '@prisma/client'
import { createPaymentPreference } from '@/lib/mercadopago'
import { Decimal } from '@prisma/client/runtime/library'

const APP_FEE_RATE = 0.08;                       // 8% tuyo
const MP_FEE_RATE = Number(process.env.MP_FEE_RATE ?? '0.06');   // Comisión MP (6% por defecto)
const IIBB_RATE   = Number(process.env.IIBB_RATE ?? '0.025');    // IIBB La Pampa (2,5%)

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Solo rol user
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })
  if (!user || user.role !== 'user') {
    return NextResponse.json({ error: 'Forbidden - Only user role can buy' }, { status: 403 })
  }

  const { eventId, selections } = await req.json() as {
    eventId: number
    selections: Array<{ code: string; quantity: number }>
  }

  if (!eventId || !Array.isArray(selections) || selections.length === 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Validaciones básicas de payload
  for (const s of selections) {
    if (!s?.code || !Number.isInteger(s.quantity) || s.quantity <= 0) {
      return NextResponse.json({ error: `Invalid selection: ${JSON.stringify(s)}` }, { status: 400 })
    }
  }
  // evitar códigos duplicados en el mismo request
  const codes = selections.map(s => s.code)
  const dup = codes.find((c, i) => codes.indexOf(c) !== i)
  if (dup) return NextResponse.json({ error: `Duplicated ticket code: ${dup}` }, { status: 400 })

  try {
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          ticketTypes: {
            select: {
              id: true, code: true, label: true,
              price: true, stockCurrent: true, userMaxPerType: true
            }
          }
        }
      })
      if (!event) throw new Error('Event not found')

      // Datos del payer
      const userInfo = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, dni: true }
      })
      if (!userInfo) throw new Error('User not found')

      const ticketsToCreate: Array<{
        eventId: number
        ownerId: string
        typeId: number
        qrCode: string
        code: string
        status: TicketStatus
        createdAt: Date
      }> = []
      const paymentItems: Array<{ id: string; title: string; quantity: number; unit_price: number }> = []
      let totalAmount = 0

      for (const sel of selections) {
        const tt = event.ticketTypes.find(t => t.code === sel.code)
        if (!tt) throw new Error(`Ticket type not found: ${sel.code}`)


        // Límite por usuario (contando existentes)
        const existingUserTickets = await tx.ticket.count({
          where: { ownerId: session.user.id, typeId: tt.id }
        })
        if (existingUserTickets + sel.quantity > tt.userMaxPerType) {
          throw new Error(`User limit exceeded for ${tt.label}`)
        }

        // Reserva de stock (atómico)
        const updated = await tx.ticketType.updateMany({
          where: {
            id: tt.id,
            eventId,
            stockCurrent: { gte: sel.quantity }
          },
          data: { stockCurrent: { decrement: sel.quantity } }
        })
        if (updated.count === 0) {
          throw new Error(`Insufficient stock for ${tt.label}`)
        }


        
        const base = Number(tt.price);
        const withFee = round2(base * (1 + APP_FEE_RATE));
        const withFeeAndMp = round2(withFee * (1 + MP_FEE_RATE));
        const finalUnit = round2(withFeeAndMp * (1 + IIBB_RATE));

        paymentItems.push({
          id: `ticket_${tt.id}`,
          title: `${event.name} - ${tt.label}`,
          quantity: sel.quantity,
          unit_price: finalUnit
        });
        totalAmount += finalUnit * sel.quantity;

        // Crear QRs (pendiente hasta pago)
        for (let i = 0; i < sel.quantity; i++) {
          const qrData = `ticket_${eventId}_${tt.id}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
          const qrCode = await QRCode.toDataURL(qrData)
          ticketsToCreate.push({
            eventId,
            ownerId: session.user.id,
            typeId: tt.id,
            qrCode,
            code: qrData,
            status: 'pending',
            createdAt: new Date()
          })
        }
      }

      const externalReference = `order_${session.user.id}_${eventId}_${Date.now()}`
      let paymentRecord = null;
      let createdTickets: { id: number }[] = [];

      // Crear payment record si hay monto a pagar
      if (totalAmount > 0) {
        paymentRecord = await tx.payment.create({
          data: {
            userId: session.user.id,
            eventId,
            status: 'pending',
            amount: new Prisma.Decimal(totalAmount),
            currency: 'ARS',
            provider: 'mercadopago',
            externalReference,
            payerEmail: userInfo.email,
            payerName: userInfo.name,
          }
        });
      }

      // Insertar tickets PENDING con paymentId si corresponde
      if (ticketsToCreate.length > 0) {
        const ticketsData = ticketsToCreate.map(ticket => ({
          ...ticket,
          paymentId: paymentRecord?.id || null
        }));
        
        await tx.ticket.createMany({ data: ticketsData });

        // Obtener IDs creados (últimos segundos)
        createdTickets = await tx.ticket.findMany({
          where: {
            ownerId: session.user.id,
            eventId,
            status: 'pending',
            createdAt: { gte: new Date(Date.now() - 10_000) }
          },
          select: { id: true }
        });
      }

      await tx.log.create({
        data: {
          userId: session.user.id,
          action: 'payment_initiated',
          details: { 
            eventId, 
            ticketCount: ticketsToCreate.length, 
            totalAmount, 
            externalReference,
            paymentId: paymentRecord?.id 
          }
        }
      })

      return { 
        createdTickets, 
        paymentItems, 
        userInfo, 
        event, 
        externalReference, 
        totalAmount,
        paymentRecord 
      }
    })

    // Si no hay monto (por si llega algo gratis acá), devolvemos éxito sin MP
    if (result.totalAmount <= 0) {
      return NextResponse.json({
        success: true,
        data: null,
        ticketCount: result.createdTickets.length,
        totalAmount: 0,
        message: 'No payment required'
      }, { status: 200 })
    }

    // Crear preferencia de pago en MercadoPago
    const paymentPreference = await createPaymentPreference({
      items: result.paymentItems,
      payer: {
        name: result.userInfo.name?.split(' ')[0] || 'Usuario',
        surname: result.userInfo.name?.split(' ').slice(1).join(' ') || '',
        email: result.userInfo.email,
        identification: result.userInfo.dni
          ? { type: 'DNI', number: result.userInfo.dni }
          : undefined
      },
      external_reference: result.externalReference
      // notification_url: 'https://tusitio.com/api/mp/webhook'  // cuando lo tengas
    })

    if (!paymentPreference.success) {
      console.error('MercadoPago preference creation failed:', paymentPreference.error)
      console.error('Payment items:', result.paymentItems)
      console.error('User info:', result.userInfo)
      return NextResponse.json({ error: 'Payment setup failed: ' + paymentPreference.error }, { status: 500 })
    }

    // Actualizar payment record con preferenceId de MercadoPago
    if (result.paymentRecord) {
      await prisma.payment.update({
        where: { id: result.paymentRecord.id },
        data: { 
          mpPreferenceId: paymentPreference.data!.id 
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: paymentPreference.data,
      ticketCount: result.createdTickets.length,
      totalAmount: result.totalAmount,
      paymentId: result.paymentRecord?.id,
      externalReference: result.externalReference
    }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : 'Buy failed'
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}
