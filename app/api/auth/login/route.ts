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

    console.log('🔄 [API Login] Chamando authService.loginPlatformUser...')
    const result = await authService.loginPlatformUser(email, password)
    console.log('✅ [API Login] Login bem-sucedido:', result.user.role)

    const response = NextResponse.json(result)
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    
    console.log('🔵 [API Login] Cookie definido com sucesso')
    console.log('🔵 [API Login] Token:', result.token?.substring(0, 30) + '...')

    return response
  } catch (error: any) {
    console.log('❌ [API Login] Erro:', error.message)
    console.log('📚 [API Login] Stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login' },
      { status: 401 }
    )
  }
}
