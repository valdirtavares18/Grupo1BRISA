import { query } from '@/lib/db-sqlite'
import { hashPassword } from '@/lib/auth'

export class PasswordResetService {
  async requestPasswordReset(cpf: string) {
    const cleanCpf = cpf.replace(/[^\d]/g, '')
    
    const result = await query(
      'SELECT * FROM "end_users" WHERE cpf = ?',
      [cleanCpf]
    )

    if (result.rows.length === 0) {
      throw new Error('Usuário não encontrado')
    }

    const user = result.rows[0]
    const resetToken = require('crypto').randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Em produção, salvar o token em uma tabela password_resets
    // Por enquanto, retornamos o token diretamente
    
    return {
      resetToken,
      userId: user.id,
      email: user.email,
      expiresAt,
    }
  }

  async resetPassword(userId: string, newPassword: string) {
    if (newPassword.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres')
    }

    const newHash = await hashPassword(newPassword)

    await query(
      'UPDATE "end_users" SET "passwordHash" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ?',
      [newHash, userId]
    )

    return { success: true }
  }
}

export const passwordResetService = new PasswordResetService()

