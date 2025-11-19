'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { UserPlus, CreditCard, Phone, Lock, AlertCircle, CheckCircle2, Check } from 'lucide-react'
import { formatCPF } from '@/lib/utils'

interface RegisterWithPhoneFormProps {
  eventId?: string
  initialScanToken?: string
  organizationId?: string
  onSuccess?: () => void
}

export function RegisterWithPhoneForm({
  eventId,
  initialScanToken,
  organizationId,
  onSuccess,
}: RegisterWithPhoneFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptNotifications: false,
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [phoneToVerify, setPhoneToVerify] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (!formData.cpf || !formData.phone || !formData.password) {
      setError('Todos os campos são obrigatórios')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    if (!formData.acceptTerms) {
      setError('Você deve aceitar os termos de uso')
      return
    }

    const cleanCpf = formData.cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      setError('CPF deve ter 11 dígitos')
      return
    }

    setLoading(true)

    try {
      // Enviar código SMS
      const res = await fetch('/api/sms/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar código')
      }

      setPhoneToVerify(formData.phone)
      setStep('verify')

      // Em desenvolvimento, mostrar código no console
      if (data.code) {
        console.log('📱 Código de verificação:', data.code)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar código de verificação')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Código inválido. Digite o código de 6 dígitos')
      return
    }

    setLoading(true)

    try {
      // Verificar código
      const verifyRes = await fetch('/api/sms/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneToVerify,
          code: verificationCode,
        }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Código inválido')
      }

      // Registrar usuário
      const cleanCpf = formData.cpf.replace(/\D/g, '')

      const registerRes = await fetch('/api/auth/register-with-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cleanCpf,
          phone: phoneToVerify,
          password: formData.password,
          acceptTerms: formData.acceptTerms,
          acceptNotifications: formData.acceptNotifications,
          eventId,
          initialScanToken,
          organizationId,
        }),
      })

      const registerData = await registerRes.json()

      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Erro ao criar conta')
      }

      // Login automático
      if (registerData.token) {
        document.cookie = `token=${registerData.token}; path=/; max-age=${60 * 60 * 24 * 7}`
      }

      // Chamar callback ou redirecionar
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/user')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao verificar código e criar conta')
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  if (step === 'verify') {
    return (
      <Card className="shadow-2xl border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verificar Telefone</h2>
              <p className="text-muted-foreground">
                Digite o código de 6 dígitos enviado para
              </p>
              <p className="font-semibold text-primary mt-1">
                {formatPhone(phoneToVerify)}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <FormField label="Código de Verificação" required>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    disabled={loading}
                    className="pl-10 text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Verifique sua mensagem SMS e digite o código recebido
                </p>
              </FormField>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Verificar e Criar Conta
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep('register')}
                disabled={loading}
              >
                Voltar
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-2xl border-0">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">Criar Conta</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Registre-se para vincular sua presença
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSendCode} className="space-y-4">
            <FormField label="CPF" required>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="000.000.000-00"
                  value={formatCPF(formData.cpf)}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </FormField>

            <FormField label="Telefone" required>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formatPhone(formData.phone)}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Você receberá um código SMS para verificação
              </p>
            </FormField>

            <FormField label="Senha" required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </FormField>

            <FormField label="Confirmar Senha" required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </FormField>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  required
                />
                <span className="text-sm text-muted-foreground">
                  Aceito os{' '}
                  <a href="/termos" target="_blank" className="text-primary hover:underline font-semibold">
                    termos de uso
                  </a>{' '}
                  e{' '}
                  <a href="/privacidade" target="_blank" className="text-primary hover:underline font-semibold">
                    política de privacidade
                  </a>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptNotifications}
                  onChange={(e) => setFormData({ ...formData, acceptNotifications: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  Desejo receber notificações sobre eventos e promoções desta organização
                </span>
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Enviando código...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Enviar Código SMS
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

