import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'
import { smsService } from '@/services/sms.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, phone, code } = body

    if (!cpf || !phone) {
      return NextResponse.json(
        { error: 'CPF e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Se não tiver código, é o primeiro passo (enviar SMS)
    if (!code) {
      // Verificar se CPF já existe
      const { query } = await import('@/lib/db-sqlite')
      const cleanCpf = cpf.replace(/[^\d]/g, '')
      const existing = await query('SELECT * FROM end_users WHERE cpf = ?', [cleanCpf])

      if (existing.rows[0]) {
        return NextResponse.json(
          { error: 'Este CPF já está cadastrado. Faça login.' },
          { status: 400 }
        )
      }

      // Verificar se telefone já está em uso
      const cleanPhone = phone.replace(/\D/g, '')
      const existingPhone = await query('SELECT * FROM end_users WHERE phone = ?', [cleanPhone])

      if (existingPhone.rows[0]) {
        return NextResponse.json(
          { error: 'Este telefone já está cadastrado' },
          { status: 400 }
        )
      }

      // Enviar código SMS
      const smsRes = await smsService.sendVerificationCode(cleanPhone)
      
      if (!smsRes.success) {
        return NextResponse.json(
          { error: smsRes.message || 'Erro ao enviar código SMS' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Código enviado com sucesso',
        code: process.env.NODE_ENV === 'development' ? smsRes.code : undefined // Mostrar código em dev
      })
    }

    // Se tiver código, é o segundo passo (verificar e criar conta)

    const cleanPhone = phone.replace(/\D/g, '')
    
    // Verificar código SMS
    const verificationResult = await smsService.verifyCode(cleanPhone, code)

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.message },
        { status: 400 }
      )
    }

    // Criar conta sem senha (2FA)
    const result = await authService.registerEndUser2FA(cpf, cleanPhone)

    const response = NextResponse.json(result)
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao registrar usuário' },
      { status: 400 }
    )
  }
}

