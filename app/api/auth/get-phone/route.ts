import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf } = body

    if (!cpf) {
      return NextResponse.json(
        { error: 'CPF é obrigatório' },
        { status: 400 }
      )
    }

    const phone = await authService.getPhoneByCpf(cpf)

    return NextResponse.json({
      success: true,
      phone,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar telefone' },
      { status: 400 }
    )
  }
}


