import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'
import { emailService } from '@/services/email.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf, email, code } = body

    if (!cpf || !email) {
      return NextResponse.json(
        { error: 'CPF e email são obrigatórios' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Se não tiver código, é o primeiro passo (enviar email)
    if (!code) {
      const { query } = await import('@/lib/db-sqlite')
      const cleanCpf = cpf.replace(/[^\d]/g, '')

      // Verificar se CPF já existe
      const existing = await query('SELECT * FROM end_users WHERE cpf = ?', [cleanCpf])

      if (existing.rows[0]) {
        return NextResponse.json(
          { error: 'Este CPF já está cadastrado. Faça login.' },
          { status: 400 }
        )
      }

      // Verificar se email já está em uso
      const existingEmail = await query('SELECT * FROM end_users WHERE email = ?', [normalizedEmail])

      if (existingEmail.rows[0]) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 400 }
        )
      }

      // Enviar código por email
      const emailRes = await emailService.sendVerificationCode(normalizedEmail)

      if (!emailRes.success) {
        return NextResponse.json(
          { error: emailRes.message || 'Erro ao enviar código por email' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Código enviado com sucesso',
        code: process.env.NODE_ENV === 'development' ? emailRes.code : undefined,
      })
    }

    // Se tiver código, é o segundo passo (verificar e criar conta)

    // Verificar código por email
    const verificationResult = await emailService.verifyCode(normalizedEmail, code)

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.message },
        { status: 400 }
      )
    }

    // Criar conta com verificação por email
    const result = await authService.registerEndUserWithEmail(
      cpf.replace(/[^\d]/g, ''),
      normalizedEmail,
      body.fullName,
      {
        eventId: body.eventId,
        initialScanToken: body.initialScanToken,
        organizationId: body.organizationId,
      }
    )

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
