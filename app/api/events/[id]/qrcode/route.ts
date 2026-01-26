import { NextRequest, NextResponse } from 'next/server'
import { eventService } from '@/services/event.service'
import { verifyToken } from '@/lib/auth'
import { UserRole } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== UserRole.ORG_ADMIN) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const event = await eventService.getEventById(params.id)

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    const qrCodeUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/event/${event.qrCodeToken}`

    return NextResponse.json({
      qrCodeToken: event.qrCodeToken,
      qrCodeUrl,
      eventId: event.id,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
