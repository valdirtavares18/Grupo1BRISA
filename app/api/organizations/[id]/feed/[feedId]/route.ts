import { NextRequest, NextResponse } from 'next/server'
import { feedService } from '@/services/feed.service'
import { verifyToken } from '@/lib/auth'

interface RouteParams {
  params: { id: string; feedId: string }
}

export async function PUT(
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

    // Verificar se é ORG_ADMIN da organização ou SUPER_ADMIN
    if (
      payload.role === 'SUPER_ADMIN' ||
      (payload.role === 'ORG_ADMIN' && payload.organizationId === params.id)
    ) {
      const body = await request.json()
      const feedPost = await feedService.updateFeedPost(params.feedId, body)

      return NextResponse.json(feedPost)
    }

    return NextResponse.json(
      { error: 'Acesso negado' },
      { status: 403 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar post' },
      { status: 400 }
    )
  }
}

export async function DELETE(
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

    // Verificar se é ORG_ADMIN da organização ou SUPER_ADMIN
    if (
      payload.role === 'SUPER_ADMIN' ||
      (payload.role === 'ORG_ADMIN' && payload.organizationId === params.id)
    ) {
      await feedService.deleteFeedPost(params.feedId)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Acesso negado' },
      { status: 403 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir post' },
      { status: 400 }
    )
  }
}

