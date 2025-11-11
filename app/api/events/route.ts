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
    if (!payload || payload.role !== UserRole.ORG_ADMIN || !payload.organizationId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const event = await eventService.createEvent({
      organizationId: payload.organizationId,
      ...body,
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
