import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const eventId = searchParams.get('eventId')

    if (!code) {
      return NextResponse.json(
        { error: 'Código de referido requerido' },
        { status: 400 }
      )
    }

    // Buscar el producerMember con ese código de referido (case-insensitive)
    const rrpp = await prisma.producerMember.findFirst({
      where: {
        referralCode: {
          equals: code,
          mode: 'insensitive',
        },
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
        producer: {
          select: {
            company_name: true,
            is_active: true,
          },
        },
        rrppAssignments: eventId
          ? {
              where: {
                eventId: parseInt(eventId),
              },
            }
          : undefined,
      },
    })

    if (!rrpp) {
      return NextResponse.json(
        { error: 'Código de referido inválido', valid: false },
        { status: 404 }
      )
    }

    // Validar que el RRPP esté activo
    if (!rrpp.isActive || !rrpp.producer.is_active) {
      return NextResponse.json(
        { error: 'Código de referido no disponible', valid: false },
        { status: 403 }
      )
    }

    // Validar que sea rol RRPP
    if (rrpp.role !== 'rrpp') {
      return NextResponse.json(
        { error: 'Código de referido inválido', valid: false },
        { status: 403 }
      )
    }

    // Si se especificó eventId, validar que tenga asignación
    if (eventId && rrpp.rrppAssignments?.length === 0) {
      return NextResponse.json(
        {
          error: 'Este RRPP no está asignado a este evento',
          valid: false,
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      valid: true,
      rrpp: {
        id: rrpp.id,
        name: rrpp.user.name,
        username: rrpp.user.username,
        code: rrpp.referralCode,
        commissionRate: rrpp.rrppAssignments?.[0]?.commissionRate?.toString(),
      },
    })
  } catch (error) {
    console.error('Error validating referral code:', error)
    return NextResponse.json(
      { error: 'Error al validar código de referido', valid: false },
      { status: 500 }
    )
  }
}
