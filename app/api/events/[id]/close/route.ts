import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db-sqlite'

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

    // Verificar se o evento existe
    const eventResult = await query(
      'SELECT * FROM "Event" WHERE id = ?',
      [params.id]
    )

    if (eventResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    const event = eventResult.rows[0]

    // Verificar se já está encerrado
    if (event.manuallyEnded === 1) {
      return NextResponse.json(
        { error: 'Evento já está encerrado' },
        { status: 400 }
      )
    }

    // Encerrar evento
    await query(
      'UPDATE "Event" SET "manuallyEnded" = 1 WHERE id = ?',
      [params.id]
    )

    return NextResponse.json({
      message: 'Evento encerrado com sucesso',
      eventId: params.id
    })
  } catch (error: any) {
    console.error('Erro ao encerrar evento:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

