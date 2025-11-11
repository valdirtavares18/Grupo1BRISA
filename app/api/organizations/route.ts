import { NextRequest, NextResponse } from 'next/server'
import { organizationService } from '@/services/organization.service'
import { verifyToken } from '@/lib/auth'

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

console.log('🔥 [GLOBAL] app/api/organizations/route.ts carregado')

export async function POST(request: NextRequest) {
  console.log('🔥🔥🔥 [POST /organizations] FUNÇÃO CHAMADA!')
  try {
    console.log('🔵 [POST /organizations] ====== INICIO DA REQUISIÇÃO ======')
    console.log('🔵 [POST /organizations] URL:', request.url)
    console.log('🔵 [POST /organizations] Headers da requisição:', Object.fromEntries(request.headers.entries()))
    console.log('🔵 [POST /organizations] Cookie header:', request.headers.get('cookie'))
    console.log('🔵 [POST /organizations] Todos os cookies:', JSON.stringify(request.cookies.getAll()))
    
    const token = request.cookies.get('token')
    console.log('🔵 [POST /organizations] Objeto token:', token)
    console.log('🔵 [POST /organizations] Token value:', token?.value)
    console.log('🔵 [POST /organizations] Token recebido:', token?.value?.substring(0, 20) + '...')
    
    if (!token?.value) {
      console.log('❌ [POST /organizations] Token não fornecido - cookies:', request.cookies.getAll())
      console.log('🔵 [POST /organizations] Cookie header completo:', request.headers.get('cookie'))
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    console.log('🔵 [POST /organizations] Chamando verifyToken...')
    const payload = verifyToken(token.value)
    console.log('🔵 [POST /organizations] Payload decodificado:', JSON.stringify(payload))
    
    if (!payload) {
      console.log('❌ [POST /organizations] Token inválido - jwt.verify falhou')
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 403 }
      )
    }
    
    console.log('🔵 [POST /organizations] Role do usuário:', payload.role, 'Esperado: SUPER_ADMIN')
    
    if (payload.role !== 'SUPER_ADMIN') {
      console.log('❌ [POST /organizations] Usuário não é SUPER_ADMIN')
      return NextResponse.json(
        { error: 'Acesso negado - apenas super admin' },
        { status: 403 }
      )
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
