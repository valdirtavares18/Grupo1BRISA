import { NextRequest, NextResponse } from 'next/server'
import { feedService } from '@/services/feed.service'
import { verifyToken } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const publishedOnly = searchParams.get('published') === 'true'

    const feeds = await feedService.getFeedByOrganization(params.id, publishedOnly)

    return NextResponse.json(feeds)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar feed' },
      { status: 500 }
    )
  }
}

export async function POST(
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
      const feedPost = await feedService.createFeedPost({
        organizationId: params.id,
        title: body.title,
        content: body.content,
        imageUrl: body.imageUrl,
        published: body.published !== undefined ? body.published : true,
      })

      return NextResponse.json(feedPost, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Acesso negado' },
      { status: 403 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar post' },
      { status: 400 }
    )
  }
}

