import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { eventService } from '@/services/event.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'ORG_ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const duplicatedEvent = await eventService.duplicateEvent(params.id)

    return NextResponse.json(duplicatedEvent)
  } catch (error: any) {
    console.error('Erro ao duplicar evento:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

