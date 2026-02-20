import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'

function getErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : ''
  if (/NODE_MODULE_VERSION|better_sqlite3|better-sqlite3|re-compil|reinstall/i.test(raw)) {
    return 'Módulo do banco de dados incompatível com esta versão do Node.js. No terminal, execute: npm rebuild better-sqlite3'
  }
  return raw || 'Erro ao buscar telefone'
}

export async function POST(request: NextRequest) {
  try {
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
    } catch (err) {
      const msg = getErrorMessage(err)
      console.error('[get-phone]', err)
      return NextResponse.json(
        { error: msg },
        { status: 400 }
      )
    }
  } catch (outer) {
    console.error('[get-phone] outer', outer)
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}



