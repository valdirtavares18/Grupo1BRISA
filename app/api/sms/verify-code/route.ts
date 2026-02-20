import { NextRequest, NextResponse } from 'next/server'
import { smsService } from '@/services/sms.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Telefone e código são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await smsService.verifyCode(phone, code)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar código' },
      { status: 500 }
    )
  }
}

