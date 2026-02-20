import { NextRequest, NextResponse } from 'next/server'
import { viaCEPService } from '@/services/viacep.service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cep = searchParams.get('cep')

    if (!cep) {
      return NextResponse.json(
        { error: 'CEP é obrigatório' },
        { status: 400 }
      )
    }

    const address = await viaCEPService.getAddressByCep(cep)

    if (!address) {
      return NextResponse.json(
        { error: 'CEP não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(address)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar CEP' },
      { status: 500 }
    )
  }
}

