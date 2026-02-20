import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'

export async function POST(request: NextRequest) {
  console.log('🚀 [API Login] Iniciando login...')

  try {
    const body = await request.json()
    console.log('📥 [API Login] Body recebido:', { email: body.email, hasPassword: !!body.password })

    const { email, password } = body

    if (!email || !password) {
      console.log('❌ [API Login] Email ou senha faltando')
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Tentar primeiro como platform user (email), depois como end user (CPF)
    let result
    try {
      console.log('🔄 [API Login] Tentando login como platform user...')
      result = await authService.loginPlatformUser(email, password)
      console.log('✅ [API Login] Login bem-sucedido como platform user:', result.user.role)
    } catch (platformError: any) {
      // Se falhar, tenta como end user (CPF)
      console.log('🔄 [API Login] Login como platform user falhou, tentando como end user (CPF)...')
      try {
        result = await authService.loginEndUser(email, password)
        console.log('✅ [API Login] Login bem-sucedido como end user')
      } catch (endUserError: any) {
        // Se ambos falharem, retorna erro
        console.log('❌ [API Login] Login falhou tanto como platform user quanto end user')
        throw new Error('Credenciais inválidas')
      }
    }

    const response = NextResponse.json(result)

    console.log('🔵 [API Login] Definindo cookie token...')
    console.log('🔵 [API Login] Token a ser salvo:', result.token?.substring(0, 30) + '...')
    console.log('🔵 [API Login] NODE_ENV:', process.env.NODE_ENV)

    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    console.log('🔵 [API Login] Cookie definido')
    console.log('🔵 [API Login] Set-Cookie header:', response.headers.get('set-cookie'))

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao realizar login' },
      { status: 401 }
    )
  }
}
