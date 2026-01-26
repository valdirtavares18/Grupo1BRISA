import { query } from '@/lib/db-sqlite'
import { randomUUID } from 'crypto'

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
      const id = randomUUID()

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

      // Tentar enviar SMS real se Twilio estiver configurado
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
      const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

      if (twilioAccountSid && twilioAuthToken && twilioVerifyServiceSid) {
        try {
          // Importar Twilio dinamicamente
          const twilio = await import('twilio')
          const client = twilio.default(twilioAccountSid, twilioAuthToken)

          // Formatar telefone para formato internacional (+55 para Brasil)
          const formattedPhone = cleanPhone.startsWith('55') 
            ? `+${cleanPhone}` 
            : `+55${cleanPhone}`

          // Usar Twilio Verify (melhor para códigos de verificação)
          const verification = await client.verify.v2
            .services(twilioVerifyServiceSid)
            .verifications
            .create({ to: formattedPhone, channel: 'sms' })

          console.log(`📱 [SMS] Código enviado para ${formattedPhone} via Twilio Verify (SID: ${verification.sid})`)
          
          // Com Twilio Verify, não precisamos salvar o código manualmente
          // O Twilio gerencia isso. Mas vamos manter o código no banco para compatibilidade
          
          return {
            success: true,
            message: 'Código enviado com sucesso para seu telefone',
          }
        } catch (twilioError: any) {
          console.error('Erro ao enviar SMS via Twilio:', twilioError)
          // Se falhar, continuar com modo mock
        }
      }

      // Modo desenvolvimento/mock: mostrar código no console e alert
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 [SMS DEV] Código de verificação para ${cleanPhone}: ${code}`)
        
        return {
          success: true,
          code, // Apenas em desenvolvimento
          message: 'Código enviado com sucesso (modo desenvolvimento - configure Twilio para envio real)',
        }
      }

      // Se não tiver Twilio configurado e não estiver em dev, retornar erro
      return {
        success: false,
        message: 'Serviço SMS não configurado. Configure as variáveis TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_PHONE_NUMBER.',
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

      // Formatar telefone para formato internacional
      const formattedPhone = cleanPhone.startsWith('55') 
        ? `+${cleanPhone}` 
        : `+55${cleanPhone}`

      // Tentar verificar via Twilio Verify se estiver configurado
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
      const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

      if (twilioAccountSid && twilioAuthToken && twilioVerifyServiceSid) {
        try {
          const twilio = await import('twilio')
          const client = twilio.default(twilioAccountSid, twilioAuthToken)

          // Verificar código via Twilio Verify
          const verificationCheck = await client.verify.v2
            .services(twilioVerifyServiceSid)
            .verificationChecks
            .create({ to: formattedPhone, code: cleanCode })

          if (verificationCheck.status === 'approved') {
            // Marcar como verificado no nosso banco também
            const result = await query(
              'SELECT * FROM phone_verifications WHERE phone = ? AND verified = 0 ORDER BY createdAt DESC LIMIT 1',
              [cleanPhone]
            )
            
            if (result.rows.length > 0) {
              await query(
                'UPDATE phone_verifications SET verified = 1 WHERE id = ?',
                [result.rows[0].id]
              )
            }

            return {
              success: true,
              message: 'Código verificado com sucesso',
            }
          } else {
            return {
              success: false,
              message: 'Código inválido ou expirado',
            }
          }
        } catch (twilioError: any) {
          console.error('Erro ao verificar código via Twilio:', twilioError)
          // Se falhar, tentar método manual
        }
      }

      // Método manual (fallback ou quando Twilio não está configurado)
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

