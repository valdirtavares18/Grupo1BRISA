import { query } from '@/lib/db-sqlite'
import { randomUUID } from 'crypto'
import nodemailer from 'nodemailer'

// Criar tabela de verificação por email se não existir
const ensureTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS "email_verifications" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "verified" INTEGER NOT NULL DEFAULT 0,
      "expiresAt" TEXT NOT NULL,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await query(
    'CREATE INDEX IF NOT EXISTS "email_verifications_email_idx" ON "email_verifications"("email")'
  )
}

export class EmailService {
  /**
   * Gera código de verificação de 6 dígitos
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Envia código de verificação por email via Gmail SMTP.
   * Configure GMAIL_USER e GMAIL_APP_PASSWORD no ambiente.
   */
  async sendVerificationCode(email: string): Promise<{ success: boolean; code?: string; message: string }> {
    await ensureTable()

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return {
        success: false,
        message: 'Email inválido',
      }
    }

    try {
      const code = this.generateVerificationCode()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
      const now = new Date().toISOString()

      // Invalidar TODOS os códigos antigos (verificados ou não) desse email - só o mais recente vale
      await query(
        'DELETE FROM email_verifications WHERE email = ? AND verified = 0',
        [normalizedEmail]
      )

      const id = randomUUID()
      await query(
        'INSERT INTO email_verifications (id, email, code, verified, expiresAt, createdAt) VALUES (?, ?, ?, 0, ?, ?)',
        [id, normalizedEmail, code, expiresAt.toISOString(), now]
      )

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #001F3F;">Código de verificação</h2>
          <p>Use o código abaixo para concluir seu cadastro:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #001F3F;">${code}</p>
          <p style="color: #666; font-size: 14px;">Este código expira em 15 minutos.</p>
          <p style="color: #666; font-size: 12px;">Se você não solicitou este código, ignore este email.</p>
        </div>
      `

      const gmailUser = process.env.GMAIL_USER
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD
      if (gmailUser && gmailAppPassword) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: gmailUser, pass: gmailAppPassword },
          })
          await transporter.sendMail({
            from: `"BRISA" <${gmailUser}>`,
            to: normalizedEmail,
            subject: 'Código de verificação - BRISA',
            html: htmlContent,
          })
          return { success: true, message: 'Código enviado com sucesso para seu email' }
        } catch (err: any) {
          console.error('Erro ao enviar email via Gmail:', err)
          if (process.env.NODE_ENV === 'development') {
            console.log(`📧 [DEV] Gmail falhou, mas use o código: ${code}`)
            return {
              success: true,
              code,
              message: 'Gmail falhou - use o código no console para testar',
            }
          }
          return {
            success: false,
            message: err.message || 'Erro ao enviar email',
          }
        }
      }

      // Modo desenvolvimento: mostrar código no console
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 [EMAIL DEV] Código de verificação para ${normalizedEmail}: ${code}`)
        return {
          success: true,
          code,
          message: 'Código enviado (modo desenvolvimento)',
        }
      }

      return {
        success: false,
        message: 'Serviço de email não configurado. Configure GMAIL_USER e GMAIL_APP_PASSWORD no ambiente (em prod: variáveis do Vercel).',
      }
    } catch (error: any) {
      console.error('Erro ao enviar código por email:', error)
      return {
        success: false,
        message: error.message || 'Erro ao enviar código de verificação',
      }
    }
  }

  /**
   * Verifica código de verificação por email
   */
  async verifyCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    await ensureTable()

    const normalizedEmail = email.trim().toLowerCase()
    const cleanCode = String(code || '').trim().replace(/\D/g, '')

    const result = await query(
      'SELECT * FROM email_verifications WHERE email = ? AND code = ? AND verified = 0 ORDER BY createdAt DESC LIMIT 1',
      [normalizedEmail, cleanCode]
    )

    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'Código inválido',
      }
    }

    const verification = result.rows[0] as { id: string; expiresAt: string }
    const expiresAt = new Date(verification.expiresAt)

    if (new Date() > expiresAt) {
      return {
        success: false,
        message: 'Código expirado. Solicite um novo código.',
      }
    }

    await query(
      'UPDATE email_verifications SET verified = 1 WHERE id = ?',
      [verification.id]
    )

    return {
      success: true,
      message: 'Código verificado com sucesso',
    }
  }
}

export const emailService = new EmailService()
