import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { UserRole } from '@/types'
import { query } from '@/lib/db-sqlite'

export async function POST(
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
    if (!payload || (payload.role !== UserRole.ORG_ADMIN && payload.role !== UserRole.SUPER_ADMIN)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const eventId = params.id

    // Selecionar uma presença aleatória elegível (não sorteada antes)
    const eligible = await query(
      `SELECT pl.id, pl."eventId", pl."endUserId", pl."accessTimestamp", pl.profile,
              eu."fullName", eu.cpf, eu.phone, eu.email
       FROM "presence_logs" pl
       INNER JOIN "end_users" eu ON pl."endUserId" = eu.id
       WHERE pl."eventId" = ? AND pl."endUserId" IS NOT NULL
         AND (pl."prizeDrawnAt" IS NULL OR pl."prizeDrawnAt" = '')
       ORDER BY RANDOM()
       LIMIT 1`,
      [eventId]
    )

    if (!eligible.rows.length) {
      return NextResponse.json(
        { error: 'Não há participantes elegíveis para sortear' },
        { status: 400 }
      )
    }

    const drawn = eligible.rows[0]

    // Marcar como sorteado
    await query(
      `UPDATE "presence_logs" SET "prizeDrawnAt" = CURRENT_TIMESTAMP WHERE id = ?`,
      [drawn.id]
    )

    return NextResponse.json({
      id: drawn.id,
      fullName: drawn.fullName,
      cpf: drawn.cpf,
      phone: drawn.phone,
      email: drawn.email,
      profile: drawn.profile,
      accessTimestamp: drawn.accessTimestamp,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao sortear' },
      { status: 500 }
    )
  }
}
