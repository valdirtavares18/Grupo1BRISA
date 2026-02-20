import { NextRequest, NextResponse } from 'next/server'
import { presenceService } from '@/services/presence.service'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { presenceLogId, profile } = body

    if (!presenceLogId || !profile) {
      return NextResponse.json(
        { error: 'ID da presença e perfil são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se perfil é válido
    const validProfiles = ['Ouvinte', 'Participante', 'Atleta']
    if (!validProfiles.includes(profile)) {
      return NextResponse.json(
        { error: 'Perfil inválido' },
        { status: 400 }
      )
    }

    // Buscar presença
    const { query } = await import('@/lib/db-sqlite')
    const presenceResult = await query(
      'SELECT * FROM "presence_logs" WHERE id = ?',
      [presenceLogId]
    )

    if (presenceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Presença não encontrada' },
        { status: 404 }
      )
    }

    const presence = presenceResult.rows[0]

    // Atualizar perfil
    await query(
      'UPDATE "presence_logs" SET "profile" = ? WHERE id = ?',
      [profile, presenceLogId]
    )

    // Se tiver endUserId, atualizar também
    if (presence.endUserId) {
      await presenceService.updatePresenceWithUser(presenceLogId, presence.endUserId, profile)
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}


