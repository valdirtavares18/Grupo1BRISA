import { NextRequest, NextResponse } from 'next/server'
import { passwordResetService } from '@/services/password-reset.service'

export async function POST(request: NextRequest) {
  try {
    const { cpf } = await request.json()

    if (!cpf) {
      return NextResponse.json(
        { error: 'CPF é obrigatório' },
        { status: 400 }
      )
    }

    const result = await passwordResetService.requestPasswordReset(cpf)
    
    // Em produção, enviaria email. Por enquanto, retorna o token
    return NextResponse.json({
      message: 'Link de recuperação gerado',
      resetToken: result.resetToken,
      userId: result.userId,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

