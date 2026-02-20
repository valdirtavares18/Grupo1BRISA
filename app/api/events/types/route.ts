import { NextRequest, NextResponse } from 'next/server'
import { eventSearchService } from '@/services/event-search.service'
import { verifyToken } from '@/lib/auth'
import { UserRole } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const eventTypes = await eventSearchService.getEventTypes()
    return NextResponse.json(eventTypes)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar tipos de eventos' },
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
    if (!payload || (payload.role !== UserRole.ORG_ADMIN && payload.role !== UserRole.SUPER_ADMIN)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nome do tipo de evento é obrigatório' },
        { status: 400 }
      )
    }

    const eventType = await eventSearchService.createEventType(name)

    return NextResponse.json(eventType)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar tipo de evento' },
      { status: 400 }
    )
  }
}

