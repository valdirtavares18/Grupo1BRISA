import { query } from '@/lib/db-sqlite'
import { validateEmail } from '@/lib/utils'
import { hashPassword, comparePassword } from '@/lib/auth'

export class UserService {
  async updateProfile(userId: string, data: {
    fullName?: string
    phone?: string
    email?: string
    profilePhotoUrl?: string
    zipCode?: string
    biography?: string
  }) {
    // Validar email se fornecido
    if (data.email && !validateEmail(data.email)) {
      throw new Error('Email inválido. Use o formato: nome@dominio.com')
    }

    // Verificar se o email já está em uso por outro usuário
    if (data.email) {
      const existing = await query(
        'SELECT * FROM end_users WHERE email = ? AND id != ?',
        [data.email, userId]
      )

      if (existing.rows.length > 0) {
        throw new Error('Este email já está em uso')
      }
    }

    const updates = []
    const values = []

    if (data.fullName !== undefined) {
      updates.push('"fullName" = ?')
      values.push(data.fullName)
    }

    if (data.phone !== undefined) {
      updates.push('phone = ?')
      values.push(data.phone)
    }

    if (data.email !== undefined) {
      updates.push('email = ?')
      values.push(data.email)
    }

    if (data.profilePhotoUrl !== undefined) {
      updates.push('"profilePhotoUrl" = ?')
      values.push(data.profilePhotoUrl)
    }

    if (data.zipCode !== undefined) {
      updates.push('"zipCode" = ?')
      values.push(data.zipCode)
    }

    if (data.biography !== undefined) {
      updates.push('biography = ?')
      values.push(data.biography)
    }

    if (updates.length > 0) {
      values.push(userId)
      await query(
        `UPDATE end_users SET ${updates.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      )
    }

    const result = await query('SELECT * FROM end_users WHERE id = ?', [userId])
    return result.rows[0]
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const userResult = await query('SELECT * FROM end_users WHERE id = ?', [userId])

    if (userResult.rows.length === 0) {
      throw new Error('Usuário não encontrado')
    }

    const user = userResult.rows[0] as any

    // Verificar senha atual
    const valid = await comparePassword(currentPassword, user.passwordHash)
    if (!valid) {
      throw new Error('Senha atual incorreta')
    }

    // Validar nova senha
    if (!newPassword || newPassword.length < 6) {
      throw new Error('A nova senha deve ter no mínimo 6 caracteres')
    }

    if (newPassword === currentPassword) {
      throw new Error('A nova senha deve ser diferente da senha atual')
    }

    const newHash = await hashPassword(newPassword)

    await query(
      'UPDATE end_users SET "passwordHash" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ?',
      [newHash, userId]
    )

    return { success: true }
  }

  async getUserHistory(userId: string) {
    const result = await query(
      `SELECT pl.*, e.title as eventTitle, e.description as eventDescription, 
              e.startDate, e.endDate, o.name as organizationName, pl.profile
       FROM presence_logs pl
       INNER JOIN "Event" e ON pl."eventId" = e.id
       INNER JOIN "Organization" o ON e."organizationId" = o.id
       WHERE pl."endUserId" = ?
       ORDER BY pl."accessTimestamp" DESC`,
      [userId]
    )

    return result.rows
  }

  async deleteAccount(userId: string) {
    // Soft delete - manter dados para estatísticas mas marcar como deletado
    // Anonimizar dados pessoais
    await query(
      `UPDATE end_users SET 
        "fullName" = 'Usuário Removido',
        phone = NULL,
        email = NULL,
        "profilePhotoUrl" = NULL,
        "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [userId]
    )

    // Atualizar senha para valor aleatório (impedir login)
    const randomHash = await hashPassword(require('crypto').randomUUID())
    await query(
      'UPDATE end_users SET "passwordHash" = ? WHERE id = ?',
      [randomHash, userId]
    )

    return { success: true }
  }
}

export const userService = new UserService()
