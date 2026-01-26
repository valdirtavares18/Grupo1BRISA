import { NextRequest, NextResponse } from 'next/server'
import { presenceService } from '@/services/presence.service'
import { verifyToken } from '@/lib/auth'
import { UserRole } from '@/types'
import { query } from '@/lib/db-sqlite'

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
    if (!payload || (payload.role !== UserRole.ORG_ADMIN && payload.role !== UserRole.SUPER_ADMIN)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar apenas presenças com usuários identificados (endUserId não nulo)
    const result = await query(
      `SELECT pl.*, eu."fullName", eu.cpf, eu.phone, eu.email
       FROM "presence_logs" pl
       INNER JOIN "end_users" eu ON pl."endUserId" = eu.id
       WHERE pl."eventId" = ? AND pl."endUserId" IS NOT NULL
       ORDER BY pl."accessTimestamp" DESC`,
      [params.id]
    )

    return NextResponse.json(result.rows)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar presenças' },
      { status: 500 }
    )
  }
}


