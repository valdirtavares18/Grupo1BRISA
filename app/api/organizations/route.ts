import { NextRequest, NextResponse } from 'next/server'
import { organizationService } from '@/services/organization.service'
import { verifyToken } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const organizations = await organizationService.getAllOrganizations()
    return NextResponse.json(organizations)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// console.log('🔥 [GLOBAL] app/api/organizations/route.ts carregado')

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')

    if (!token || !token.value) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    let payload
    try {
      payload = verifyToken(token.value)
    } catch (err) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    if (!payload || payload.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const organization = await organizationService.createOrganization(body)

    return NextResponse.json(organization, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
