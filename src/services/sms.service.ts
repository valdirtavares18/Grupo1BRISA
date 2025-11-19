import { query } from '@/lib/db-sqlite'

export class SMSService {
  /**
   * Gera código de verificação de 6 dígitos
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Envia código de verificação SMS
   * Em desenvolvimento: retorna código para teste (mock)
   * Em produção: integrar com Twilio ou outro serviço SMS
   */
  async sendVerificationCode(phone: string): Promise<{ success: boolean; code?: string; message: string }> {
    try {
      // Limpar telefone (remover caracteres não numéricos)
      const cleanPhone = phone.replace(/\D/g, '')

      if (cleanPhone.length < 10) {
        throw new Error('Telefone inválido')
      }

      // Gerar código
      const code = this.generateVerificationCode()

      // Definir expiração (15 minutos)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

      // Salvar no banco
      const id = require('crypto').randomUUID()

      // Deletar códigos antigos não verificados
      await query(
        'DELETE FROM phone_verifications WHERE phone = ? AND verified = 0 AND expiresAt < ?',
        [cleanPhone, new Date().toISOString()]
      )

      // Inserir novo código
      await query(
        'INSERT INTO phone_verifications (id, phone, code, verified, expiresAt) VALUES (?, ?, ?, ?, ?)',
        [id, cleanPhone, code, 0, expiresAt.toISOString()]
      )

      // Em desenvolvimento: retornar código no console e na resposta
      // Em produção: integrar com Twilio, Zenvia ou outro serviço SMS
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 [SMS DEV] Código de verificação para ${cleanPhone}: ${code}`)
        
        // Mock: em desenvolvimento, retornamos o código
        return {
          success: true,
          code, // Apenas em desenvolvimento
          message: 'Código enviado com sucesso (modo desenvolvimento)',
        }
      }

      // TODO: Integrar com serviço SMS real (ex: Twilio)
      // const twilio = require('twilio')
      // const client = twilio(accountSid, authToken)
      // await client.messages.create({
      //   body: `Seu código de verificação FLUXO PRESENTE é: ${code}`,
      //   from: '+1234567890',
      //   to: `+55${cleanPhone}`
      // })

      return {
        success: true,
        message: 'Código enviado com sucesso',
      }
    } catch (error: any) {
      console.error('Erro ao enviar código SMS:', error)
      return {
        success: false,
        message: error.message || 'Erro ao enviar código de verificação',
      }
    }
  }

  /**
   * Verifica código de verificação
   */
  async verifyCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const cleanPhone = phone.replace(/\D/g, '')
      const cleanCode = code.replace(/\D/g, '')

      // Buscar código mais recente não verificado
      const result = await query(
        'SELECT * FROM phone_verifications WHERE phone = ? AND code = ? AND verified = 0 ORDER BY createdAt DESC LIMIT 1',
        [cleanPhone, cleanCode]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Código inválido',
        }
      }

      const verification = result.rows[0]
      const expiresAt = new Date(verification.expiresAt)

      // Verificar se expirou
      if (new Date() > expiresAt) {
        return {
          success: false,
          message: 'Código expirado. Solicite um novo código.',
        }
      }

      // Marcar como verificado
      await query(
        'UPDATE phone_verifications SET verified = 1 WHERE id = ?',
        [verification.id]
      )

      return {
        success: true,
        message: 'Código verificado com sucesso',
      }
    } catch (error: any) {
      console.error('Erro ao verificar código SMS:', error)
      return {
        success: false,
        message: error.message || 'Erro ao verificar código',
      }
    }
  }

  /**
   * Verifica se telefone já foi verificado recentemente
   */
  async isPhoneVerified(phone: string): Promise<boolean> {
    try {
      const cleanPhone = phone.replace(/\D/g, '')

      const result = await query(
        'SELECT * FROM phone_verifications WHERE phone = ? AND verified = 1 ORDER BY createdAt DESC LIMIT 1',
        [cleanPhone]
      )

      if (result.rows.length === 0) {
        return false
      }

      // Considerar verificado se foi verificado nos últimos 30 dias
      const verification = result.rows[0]
      const verifiedAt = new Date(verification.createdAt)
      const daysSinceVerification = (Date.now() - verifiedAt.getTime()) / (1000 * 60 * 60 * 24)

      return daysSinceVerification <= 30
    } catch (error: any) {
      console.error('Erro ao verificar telefone:', error)
      return false
    }
  }
}

export const smsService = new SMSService()

