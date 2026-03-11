import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, email, code } = body

    if (!cpf || !email || !code) {
      return NextResponse.json(
        { error: 'CPF, email e código são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await authService.loginEndUserWithEmail(cpf, email, code)

    const response = NextResponse.json(result)
    
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login' },
      { status: 401 }
    )
  }
}


