import { NextRequest, NextResponse } from 'next/server'
import { organizationService } from '@/services/organization.service'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organization = await organizationService.getOrganizationById(params.id)

    if (!organization) {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(organization)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    
    const organization = await organizationService.updateOrganization(params.id, body)
    
    return NextResponse.json(organization)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await organizationService.deleteOrganization(params.id)
    
    return NextResponse.json({ message: 'Organização excluída com sucesso' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
