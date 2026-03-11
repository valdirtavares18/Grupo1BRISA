import { query } from '@/lib/db-sqlite'
import { hashPassword, comparePassword, generateToken } from '@/lib/auth'
import { validateCPF } from '@/lib/utils'
import { randomUUID } from 'crypto'

export class AuthService {
  async loginPlatformUser(email: string, password: string) {
    const result = await query(
      'SELECT * FROM platform_users WHERE email = ?',
      [email]
    )

    const user = result.rows[0]

    if (!user || !user.isActive) {
      throw new Error('Credenciais inválidas')
    }

    const validPassword = await comparePassword(password, user.passwordHash)

    if (!validPassword) {
      throw new Error('Credenciais inválidas')
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || undefined,
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    }
  }

  async changePlatformUserPassword(userId: string, currentPassword: string, newPassword: string) {
    const result = await query('SELECT * FROM platform_users WHERE id = ?', [userId])
    const user = result.rows[0]

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const validPassword = await comparePassword(currentPassword, user.passwordHash)

    if (!validPassword) {
      throw new Error('Senha atual incorreta')
    }

    if (newPassword.length < 6) {
      throw new Error('A nova senha deve ter no mínimo 6 caracteres')
    }

    const newHash = await hashPassword(newPassword)

    await query(
      'UPDATE platform_users SET "passwordHash" = ? WHERE id = ?',
      [newHash, userId]
    )

    return { success: true }
  }

  async registerEndUser(cpf: string, password: string) {
    const cleanCpf = cpf.replace(/[^\d]/g, '')

    if (cleanCpf.length !== 11) {
      throw new Error('CPF deve ter exatamente 11 dígitos')
    }

    if (!validateCPF(cleanCpf)) {
      throw new Error('CPF inválido. Verifique os dígitos e tente novamente')
    }

    const existing = await query('SELECT * FROM end_users WHERE cpf = ?', [cleanCpf])

    if (existing.rows[0]) {
      throw new Error('Este CPF já está cadastrado')
    }

    if (password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres')
    }

    const passwordHash = await hashPassword(password)
    const id = randomUUID()
    const now = new Date().toISOString()

    await query(
      'INSERT INTO end_users (id, cpf, "passwordHash", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?)',
      [id, cleanCpf, passwordHash, now, now]
    )

    const result = await query(
      'SELECT * FROM end_users WHERE id = ?',
      [id]
    )
    const user = result.rows[0]

    const token = generateToken({
      userId: user.id,
      email: user.cpf,
      role: 'END_USER',
    })

    return {
      token,
      user: {
        id: user.id,
        cpf: user.cpf,
      },
    }
  }

  async loginEndUser(cpf: string, password: string) {
    const cleanCpf = cpf.replace(/[^\d]/g, '')

    const result = await query('SELECT * FROM end_users WHERE cpf = ?', [cleanCpf])
    const user = result.rows[0]

    if (!user) {
      throw new Error('CPF ou senha inválidos')
    }

    const validPassword = await comparePassword(password, user.passwordHash)
    if (!validPassword) {
      throw new Error('CPF ou senha inválidos')
    }

    const token = generateToken({
      userId: user.id,
      email: user.cpf,
      role: 'END_USER',
    })

    return {
      token,
      user: {
        id: user.id,
        cpf: user.cpf,
        fullName: user.fullName,
      },
    }
  }

  async getContactByCpf(cpf: string): Promise<{ email: string }> {
    const cleanCpf = cpf.replace(/[^\d]/g, '')
    const result = await query('SELECT email FROM end_users WHERE cpf = ?', [cleanCpf])

    if (result.rows.length === 0) {
      throw new Error('CPF não encontrado')
    }

    const email = (result.rows[0] as { email?: string }).email?.trim().toLowerCase()

    if (!email) {
      throw new Error('Email não cadastrado para este CPF')
    }

    return { email }
  }

  async loginEndUserWithEmail(cpf: string, email: string, code: string) {
    const cleanCpf = cpf.replace(/[^\d]/g, '')
    const normalizedEmail = email.trim().toLowerCase()

    const userResult = await query('SELECT * FROM end_users WHERE cpf = ?', [cleanCpf])
    const user = userResult.rows[0] as { id: string; cpf: string; fullName?: string; email?: string } | undefined

    if (!user) {
      throw new Error('CPF não encontrado')
    }

    if (user.email !== normalizedEmail) {
      throw new Error('Email não corresponde ao CPF cadastrado')
    }

    const emailService = (await import('@/services/email.service')).emailService
    const verifyResult = await emailService.verifyCode(normalizedEmail, code)

    if (!verifyResult.success) {
      throw new Error(verifyResult.message || 'Código inválido')
    }

    const token = generateToken({
      userId: user.id,
      email: normalizedEmail,
      role: 'END_USER',
    })

    return {
      token,
      user: {
        id: user.id,
        cpf: user.cpf,
        fullName: user.fullName,
        email: user.email,
      },
    }
  }

  async registerEndUserWithEmail(
    cpf: string,
    email: string,
    fullName?: string,
    opts?: { eventId?: string; initialScanToken?: string; organizationId?: string }
  ) {
    const cleanCpf = cpf.replace(/[^\d]/g, '')

    if (cleanCpf.length !== 11) {
      throw new Error('CPF deve ter exatamente 11 dígitos')
    }

    if (!validateCPF(cleanCpf)) {
      throw new Error('CPF inválido. Verifique os dígitos e tente novamente')
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new Error('Email inválido')
    }

    // Verificar se CPF já existe
    const existing = await query('SELECT * FROM end_users WHERE cpf = ?', [cleanCpf])

    if (existing.rows[0]) {
      throw new Error('Este CPF já está cadastrado')
    }

    // Verificar se email já está em uso
    const existingEmail = await query('SELECT * FROM end_users WHERE email = ?', [normalizedEmail])

    if (existingEmail.rows[0]) {
      throw new Error('Este email já está cadastrado')
    }

    // Criar usuário com email verificado (sem senha - autenticação via código)
    const id = randomUUID()
    const passwordHash = await hashPassword(randomUUID())
    const now = new Date().toISOString()

    const updates = ['id', 'cpf', '"passwordHash"', 'email', '"createdAt"', '"updatedAt"']
    const values = [id, cleanCpf, passwordHash, normalizedEmail, now, now]

    if (fullName) {
      updates.push('"fullName"')
      values.push(fullName)
    }

    const placeholders = values.map(() => '?').join(', ')
    await query(
      `INSERT INTO end_users (${updates.join(', ')}) VALUES (${placeholders})`,
      values
    )

    // Associar presença ao evento se fornecido
    if (opts?.initialScanToken && opts?.eventId) {
      try {
        const presenceResult = await query(
          'SELECT id FROM presence_logs WHERE "initialScanToken" = ? AND "eventId" = ? LIMIT 1',
          [opts.initialScanToken, opts.eventId]
        )
        if (presenceResult.rows.length > 0) {
          const presenceService = (await import('@/services/presence.service')).presenceService
          await presenceService.updatePresenceWithUser(presenceResult.rows[0].id, id)
        }
      } catch (error) {
        console.error('Erro ao associar presença:', error)
      }
    }

    const token = generateToken({
      userId: id,
      email: normalizedEmail,
      role: 'END_USER',
    })

    return {
      token,
      user: {
        id,
        cpf: cleanCpf,
        email: normalizedEmail,
        fullName,
      },
    }
  }

  async registerEndUser2FA(cpf: string, phone: string, fullName?: string) {
    const cleanCpf = cpf.replace(/[^\d]/g, '')
    const cleanPhone = phone.replace(/\D/g, '')

    if (cleanCpf.length !== 11) {
      throw new Error('CPF deve ter exatamente 11 dígitos')
    }

    if (!validateCPF(cleanCpf)) {
      throw new Error('CPF inválido. Verifique os dígitos e tente novamente')
    }

    if (cleanPhone.length < 10) {
      throw new Error('Telefone inválido')
    }

    // Verificar se CPF já existe
    const existing = await query('SELECT * FROM end_users WHERE cpf = ?', [cleanCpf])

    if (existing.rows[0]) {
      throw new Error('Este CPF já está cadastrado')
    }

    // Verificar se telefone já está em uso
    const existingPhone = await query('SELECT * FROM end_users WHERE phone = ?', [cleanPhone])

    if (existingPhone.rows[0]) {
      throw new Error('Este telefone já está cadastrado')
    }

    // Criar usuário sem senha (autenticação via SMS)
    const id = randomUUID()
    // Gerar um hash vazio ou usar o próprio CPF como "senha" (não será usado)
    const passwordHash = await hashPassword(randomUUID()) // Hash aleatório, não será usado
    const now = new Date().toISOString()

    const updates = ['id', 'cpf', '"passwordHash"', 'phone', '"phoneVerified"', '"createdAt"', '"updatedAt"']
    const values = [id, cleanCpf, passwordHash, cleanPhone, 1, now, now]
    const placeholders = ['?', '?', '?', '?', '?', '?', '?']

    if (fullName) {
      updates.push('"fullName"')
      values.push(fullName)
      placeholders.push('?')
    }

    await query(
      `INSERT INTO end_users (${updates.join(', ')}) VALUES (${placeholders.join(', ')})`,
      values
    )

    const token = generateToken({
      userId: id,
      email: cleanCpf,
      role: 'END_USER',
    })

    return {
      token,
      user: {
        id,
        cpf: cleanCpf,
        phone: cleanPhone,
        fullName,
      },
    }
  }

  async registerEndUserWithPhone(data: {
    cpf: string
    phone: string
    password: string
    acceptTerms: boolean
    acceptNotifications: boolean
    eventId?: string
    initialScanToken?: string
    organizationId?: string
  }) {
    const cleanCpf = data.cpf.replace(/[^\d]/g, '')
    const cleanPhone = data.phone.replace(/\D/g, '')

    if (cleanCpf.length !== 11) {
      throw new Error('CPF deve ter exatamente 11 dígitos')
    }

    if (!validateCPF(cleanCpf)) {
      throw new Error('CPF inválido. Verifique os dígitos e tente novamente')
    }

    if (cleanPhone.length < 10) {
      throw new Error('Telefone inválido')
    }

    if (data.password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres')
    }

    if (!data.acceptTerms) {
      throw new Error('Você deve aceitar os termos de uso')
    }

    // Verificar se telefone já foi verificado
    const phoneVerified = await query(
      'SELECT * FROM phone_verifications WHERE phone = ? AND verified = 1 ORDER BY createdAt DESC LIMIT 1',
      [cleanPhone]
    )

    if (phoneVerified.rows.length === 0) {
      throw new Error('Telefone não verificado. Verifique seu número primeiro.')
    }

    // Verificar se CPF já existe
    const existing = await query('SELECT * FROM end_users WHERE cpf = ?', [cleanCpf])

    if (existing.rows[0]) {
      throw new Error('Este CPF já está cadastrado')
    }

    // Verificar se telefone já está em uso
    const existingPhone = await query('SELECT * FROM end_users WHERE phone = ?', [cleanPhone])

    if (existingPhone.rows[0]) {
      throw new Error('Este telefone já está cadastrado')
    }

    const passwordHash = await hashPassword(data.password)
    const id = randomUUID()

    // Criar usuário
    const now = new Date().toISOString()
    await query(
      'INSERT INTO end_users (id, cpf, "passwordHash", phone, "phoneVerified", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, cleanCpf, passwordHash, cleanPhone, 1, now, now]
    )

    // Salvar consentimentos
    const consentService = (await import('@/services/consent.service')).consentService

    // Consentimento de termos de uso
    await consentService.saveConsent(id, 'TRACKING_PURPOSE', data.acceptTerms)

    // Consentimento de notificações da organização
    if (data.organizationId && data.acceptNotifications) {
      await consentService.saveConsent(id, 'EMAIL_MARKETING', true)
      await consentService.saveConsent(id, 'WHATSAPP_MARKETING', true)
    }

    // Associar presença se tiver initialScanToken
    if (data.initialScanToken && data.eventId) {
      try {
        const presenceService = (await import('@/services/presence.service')).presenceService
        const presenceResult = await query(
          'SELECT id FROM presence_logs WHERE "initialScanToken" = ? AND "eventId" = ? LIMIT 1',
          [data.initialScanToken, data.eventId]
        )

        if (presenceResult.rows.length > 0) {
          await presenceService.updatePresenceWithUser(presenceResult.rows[0].id, id)
        }
      } catch (error) {
        console.error('Erro ao associar presença:', error)
        // Não falhar o registro se não conseguir associar presença
      }
    }

    const token = generateToken({
      userId: id,
      email: cleanCpf,
      role: 'END_USER',
    })

    return {
      token,
      user: {
        id,
        cpf: cleanCpf,
        phone: cleanPhone,
      },
    }
  }
}

export const authService = new AuthService()
