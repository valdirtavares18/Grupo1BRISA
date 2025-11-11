import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface TokenPayload {
  userId: string
  email: string
  role: string
  organizationId?: string
}

export function generateToken(payload: TokenPayload): string {
  console.log('🔥 [generateToken] Gerando token com payload:', JSON.stringify(payload))
  console.log('🔥 [generateToken] JWT_SECRET:', JWT_SECRET)
  
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
  
  console.log('🔥 [generateToken] Token gerado:', token.substring(0, 30) + '...')
  return token
}

export function verifyToken(token: string): TokenPayload | null {
  console.log('🔥 [verifyToken] Verificando token...')
  console.log('🔥 [verifyToken] JWT_SECRET:', JWT_SECRET)
  console.log('🔥 [verifyToken] Token recebido:', token?.substring(0, 30) + '...')
  
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
    console.log('✅ [verifyToken] Token válido, payload:', JSON.stringify(payload))
    return payload
  } catch (error: any) {
    console.log('❌ [verifyToken] Erro ao verificar token:', error.message)
    console.log('❌ [verifyToken] Error name:', error.name)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
