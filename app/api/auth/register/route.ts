import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, password } = body

    if (!cpf || !password) {
      return NextResponse.json(
        { error: 'CPF e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await authService.registerEndUser(cpf, password)

    const response = NextResponse.json(result)
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar conta' },
      { status: 400 }
    )
  }
}
