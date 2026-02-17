import { NextRequest, NextResponse } from 'next/server'
import { smsService } from '@/services/sms.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, channel } = body
    const validChannel = channel === 'whatsapp' ? 'whatsapp' : 'sms'

    if (!phone) {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      )
    }

    const result = await smsService.sendVerificationCode(phone, validChannel)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    // Em desenvolvimento, retornar código para teste
    const response: any = {
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

