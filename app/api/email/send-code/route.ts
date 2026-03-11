import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/services/email.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const result = await emailService.sendVerificationCode(email.trim().toLowerCase())

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    const response: Record<string, unknown> = {
      success: true,
      message: result.message,
    }

    if (process.env.NODE_ENV === 'development' && result.code) {
      response.code = result.code
    }

    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar código' },
      { status: 500 }
    )
  }
}
