import { NextRequest, NextResponse } from 'next/server'
import { eventService } from '@/services/event.service'
import { verifyToken } from '@/lib/auth'
import { UserRole } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    if (payload.role === UserRole.ORG_ADMIN && payload.organizationId) {
      const events = await eventService.getEventsByOrganization(payload.organizationId)
      return NextResponse.json(events)
    }

    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || !payload.role) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar quem pode criar eventos
    let organizationId = payload.organizationId

    if (payload.role === UserRole.SUPER_ADMIN) {
      if (!body.organizationId) {
        return NextResponse.json({ error: 'ID da organização é obrigatório para Super Admin' }, { status: 400 })
      }
      organizationId = body.organizationId
    } else if (payload.role !== UserRole.ORG_ADMIN || !payload.organizationId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Converter strings de data para objetos Date
    const eventData: any = {
      organizationId,
      title: body.title,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      eventType: body.eventType,
      reward: body.reward,
    }

    const event = await eventService.createEvent(eventData)

    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
