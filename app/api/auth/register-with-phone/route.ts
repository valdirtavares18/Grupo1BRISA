import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      cpf,
      phone,
      password,
      acceptTerms,
      acceptNotifications,
      eventId,
      initialScanToken,
      organizationId,
    } = body

    if (!cpf || !phone || !password) {
      return NextResponse.json(
        { error: 'CPF, telefone e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { error: 'Você deve aceitar os termos de uso' },
        { status: 400 }
      )
    }

    const result = await authService.registerEndUserWithPhone({
      cpf,
      phone,
      password,
      acceptTerms,
      acceptNotifications: acceptNotifications || false,
      eventId,
      initialScanToken,
      organizationId,
    })

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

