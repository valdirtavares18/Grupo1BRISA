import { NextRequest, NextResponse } from 'next/server'
import { validateCPF } from '@/lib/utils'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const cpf = searchParams.get('cpf')

    if (!cpf) {
        return NextResponse.json({ error: 'CPF é obrigatório' }, { status: 400 })
    }

    const cleanCpf = cpf.replace(/\D/g, '')

    if (!validateCPF(cleanCpf)) {
        return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
    }

    // Simulação de busca em banco de dados ou API externa
    // Para testar, vamos retornar um nome fixo + os últimos dígitos do CPF
    const mockName = `Visitante Brisa ${cleanCpf.slice(-4)}`

    return NextResponse.json({
        name: mockName,
        found: true
    })
}
