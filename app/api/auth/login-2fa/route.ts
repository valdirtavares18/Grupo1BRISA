import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, phone, code } = body

    if (!cpf || !phone || !code) {
      return NextResponse.json(
        { error: 'CPF, telefone e código são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await authService.loginEndUserWithPhone(cpf, phone, code)

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


