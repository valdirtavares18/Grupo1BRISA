import { NextRequest, NextResponse } from 'next/server'
import { endUserService } from '@/services/end-user.service'
import { verifyToken } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
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

    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Verificar se é SUPER_ADMIN ou ORG_ADMIN da organização
    if (payload.role === 'SUPER_ADMIN') {
      // Super admin pode ver usuários de qualquer organização
    } else if (payload.role === 'ORG_ADMIN' && payload.organizationId === params.id) {
      // Org admin só pode ver usuários da própria organização
    } else {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const endUsers = await endUserService.getEndUsersByOrganization(params.id)
    const stats = await endUserService.getEndUserStatsByOrganization(params.id)

    return NextResponse.json({
      users: endUsers,
      stats,
    })
  } catch (error: any) {
    console.error('Erro ao buscar usuários finais:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar usuários finais' },
      { status: 500 }
    )
  }
}

