import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const paymentId = searchParams.get('payment_id')       // mpPaymentId
  const externalRef = searchParams.get('external_ref')   // externalReference

  if (!paymentId && !externalRef) {
    return NextResponse.json({ error: 'Provide payment_id or external_ref' }, { status: 400 })
  }

  
  const payment = await prisma.payment.findFirst({
    where: {
      userId: session.user.id,
      ...(paymentId ? { mpPaymentId: paymentId } : {}),
      ...(externalRef ? { externalReference: externalRef } : {})
    },
    include: {
      tickets: {
        include: {
          event: true,
          type: true
        }
      }
    }
  })

  if (!payment) return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 })

  return NextResponse.json({
    success: true,
    status: payment.status,
    paymentId: payment.mpPaymentId,
    externalReference: payment.externalReference,
    transactionAmount: Number(payment.amount),
    tickets: payment.tickets.map(t => ({
      id: t.id,
      qrCode: t.qrCode,
      event: { name: t.event.name },
      type: { code: t.type.code, label: t.type.label, price: Number(t.type.price) }
    }))
  })
}
