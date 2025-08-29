import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import prisma from '@/lib/prisma'
import { sendTicketConfirmationEmail, sendPaymentFailureEmail } from '@/lib/email'
import crypto from 'crypto'
import { Prisma } from '@prisma/client'

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
const mpPayment = new Payment(client)

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text()
    const body = JSON.parse(bodyText)

    const signature = req.headers.get('x-signature')
    const requestId = req.headers.get('x-request-id')
    if (!verifyWebhookSignature(bodyText, signature, requestId)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (body.type !== 'payment') {
      return NextResponse.json({ message: 'Notification type not handled' })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ error: 'No payment ID' }, { status: 400 })

    const pd = await mpPayment.get({ id: paymentId })
    if (!pd) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    const externalReference = pd.external_reference ?? null
    const status = pd.status ?? 'unknown'

    await processPaymentStatus({
      mpPaymentId: String(pd.id),
      externalReference,
      status,
      amount: typeof pd.transaction_amount === 'number' ? pd.transaction_amount : null
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Webhook error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get('topic')
  const id = req.nextUrl.searchParams.get('id')
  if (topic === 'payment' && id) {
    try {
      const pd = await mpPayment.get({ id })
      await processPaymentStatus({
        mpPaymentId: String(pd.id),
        externalReference: pd.external_reference ?? null,
        status: pd.status ?? 'unknown',
        amount: typeof pd.transaction_amount === 'number' ? pd.transaction_amount : null
      })
      return NextResponse.json({ ok: true })
    } catch (e) {
      console.error('GET webhook error', e)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }
  return NextResponse.json({ message: 'Webhook alive' })
}

async function processPaymentStatus(args: {
  mpPaymentId: string
  externalReference: string | null
  status: string
  amount: number | null
}) {
  const { mpPaymentId, externalReference, status, amount } = args
  if (!externalReference) {
    console.error('Missing externalReference on webhook')
    return
  }

  // Encontrar el pago por externalReference
  const paymentRow = await prisma.payment.findUnique({
    where: { externalReference },
    include: {
      tickets: {
        include: {
          type: { select: { id: true, code: true, label: true, price: true } },
          owner: { select: { name: true, email: true } },
          event: { select: { name: true, date: true, location: true, id: true } }
        }
      }
    }
  })
  if (!paymentRow) {
    console.warn('Payment not found for externalReference', externalReference)
    return
  }

  const event = paymentRow.tickets[0]?.event
  const user = paymentRow.tickets[0]?.owner

  if (status === 'approved') {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentRow.id },
        data: {
          status: 'approved',
          mpPaymentId,
          amount: amount != null ? new Prisma.Decimal(amount) : paymentRow.amount
        }
      })

      await tx.ticket.updateMany({
        where: { paymentId: paymentRow.id },
        data: { status: 'paid' }
      })

      await tx.log.create({
        data: {
          userId: paymentRow.userId,
          action: 'payment_confirmed',
          details: {
            paymentId: mpPaymentId,
            externalReference,
            ticketIds: paymentRow.tickets.map(t => t.id),
            amount: amount ?? paymentRow.amount
          }
        }
      })
    })

    if (user && event) {
      const totalAmount = paymentRow.tickets.reduce(
        (sum, t) => sum + Number(t.type.price),
        0
      )
      await sendTicketConfirmationEmail({
        userEmail: user.email,
        userName: user.name || 'Usuario',
        eventName: event.name,
        eventDate: new Date(event.date).toLocaleString('es-AR', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        eventLocation: event.location ?? 'Por confirmar',
        tickets: paymentRow.tickets.map(t => ({
          id: t.id,
          name: t.type.label, // Usamos label para el nombre del ticket en el mail
          type: t.type.label,   // label para el mail
          code: t.code!,
          qrCode: t.qrCode
        })),
        totalAmount,
        orderReference: externalReference
      }).catch(err => console.warn('Email confirm failed', err))
    }
  } else if (['rejected', 'cancelled'].includes(status)) {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentRow.id },
        data: { status: status as any, mpPaymentId }
      })

      
      const pending = paymentRow.tickets.filter(t => t.status === 'pending')
      if (pending.length > 0) {
        await tx.ticket.deleteMany({
          where: { id: { in: pending.map(t => t.id) } }
        })

        const byTypeId: Record<number, number> = {}
        for (const t of pending) byTypeId[t.typeId] = (byTypeId[t.typeId] ?? 0) + 1

        for (const [typeId, qty] of Object.entries(byTypeId)) {
          await tx.ticketType.update({
            where: { id: Number(typeId) },
            data: { stockCurrent: { increment: qty } }
          })
        }
      }

      await tx.log.create({
        data: {
          userId: paymentRow.userId,
          action: 'payment_failed',
          details: {
            paymentId: mpPaymentId,
            externalReference,
            status,
            ticketCount: paymentRow.tickets.length
          }
        }
      })
    })

    if (user && event) {
      await sendPaymentFailureEmail(user.email, user.name || 'Usuario', event.name, externalReference)
        .catch(err => console.warn('Email failure failed', err))
    }
  } else {
    // Otros estados (pending/in_process) → solo reflejar
    await prisma.payment.update({
      where: { id: paymentRow.id },
      data: {
        status: (status === 'in_process' ? 'in_process' : 'pending'),
        mpPaymentId
      }
    })
  }
}

/** Verificación de firma MP (opcional en dev si no configurás el secreto) */
function verifyWebhookSignature(body: string, signature: string | null, requestId: string | null): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return true
  if (!signature || !requestId) return false

  try {
    const parts = signature.split(',')
    let ts = '', v1 = ''
    for (const p of parts) {
      const [k, v] = p.split('=')
      if (k.trim() === 'ts') ts = v
      if (k.trim() === 'v1') v1 = v
    }
    const dataId = JSON.parse(body).data?.id || ''
    const signedPayload = `id:${dataId};request-id:${requestId};ts:${ts};`
    const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}
