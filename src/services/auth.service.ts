import { query } from '@/lib/db-sqlite'
import { hashPassword, comparePassword, generateToken } from '@/lib/auth'
import { validateCPF } from '@/lib/utils'

export class AuthService {
  async loginPlatformUser(email: string, password: string) {
    console.log('🔵 [AuthService] Login iniciado para:', email)
    
    console.log('🔷 [AuthService] Buscando usuário no banco...')
    const result = await query(
      'SELECT * FROM platform_users WHERE email = $1',
      [email]
    )

    const user = result.rows[0]
    console.log('🔷 [AuthService] Usuário encontrado:', user ? 'Sim - ' + user.email : 'Não')
    
    if (!user || !user.isActive) {
      console.log('❌ [AuthService] Usuário não existe ou está inativo')
      throw new Error('Credenciais inválidas')
    }

    console.log('🔷 [AuthService] Verificando senha...')
    const validPassword = await comparePassword(password, user.passwordHash)
    console.log('🔷 [AuthService] Senha válida:', validPassword)
    
    if (!validPassword) {
      console.log('❌ [AuthService] Senha incorreta')
      throw new Error('Credenciais inválidas')
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id || undefined,
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
      },
    }
  }

  async registerEndUser(cpf: string, password: string) {
    const cleanCpf = cpf.replace(/[^\d]/g, '')

    if (!validateCPF(cleanCpf)) {
      throw new Error('CPF inválido')
    }

    const existing = await query('SELECT * FROM end_users WHERE cpf = $1', [cleanCpf])

    if (existing.rows[0]) {
      throw new Error('Este CPF já está cadastrado')
    }

    if (password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres')
    }

    const passwordHash = await hashPassword(password)

    const result = await query(
      'INSERT INTO end_users (id, cpf, "passwordHash") VALUES (gen_random_uuid()::text, $1, $2) RETURNING *',
      [cleanCpf, passwordHash]
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

    const result = await query('SELECT * FROM end_users WHERE cpf = $1', [cleanCpf])
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
}

export const authService = new AuthService()
