'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { UserPlus, CreditCard, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatCPF, validateCPF, validateEmail } from '@/lib/utils'

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
    fullName: '',
    email: '',
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [emailToVerify, setEmailToVerify] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.cpf || !formData.fullName || !formData.email) {
      setError('Todos os campos são obrigatórios')
      return
    }

    if (!validateCPF(formData.cpf)) {
      setError('CPF inválido')
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Email inválido')
      return
    }

    const cleanCpf = formData.cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      setError('CPF deve ter 11 dígitos')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/email/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar código')
      }

      setEmailToVerify(formData.email.trim().toLowerCase())
      setStep('verify')

      if (process.env.NODE_ENV === 'development' && data.code) {
        console.log('📧 Código de verificação:', data.code)
        alert(`Código (DEV): ${data.code}`)
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
      const cleanCpf = formData.cpf.replace(/\D/g, '')

      const registerRes = await fetch('/api/auth/register-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cpf: cleanCpf,
          email: emailToVerify,
          code: verificationCode,
          fullName: formData.fullName,
          eventId,
          initialScanToken,
          organizationId,
        }),
      })

      const registerData = await registerRes.json()

      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Erro ao criar conta')
      }

      if (registerData.token) {
        document.cookie = `token=${registerData.token}; path=/; max-age=${60 * 60 * 24 * 7}`
      }

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

  if (step === 'verify') {
    return (
      <Card className="shadow-md border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verificar Email</h2>
              <p className="text-muted-foreground">Digite o código de 6 dígitos enviado para</p>
              <p className="font-semibold text-primary mt-1">{emailToVerify}</p>
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                <p className="text-xs text-muted-foreground mt-1">Verifique seu email e digite o código recebido</p>
              </FormField>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-navy-border border-t-white rounded-full animate-spin mr-2" />
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
    <Card className="shadow-md border-0">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">Criar Conta</h2>
            <p className="text-sm text-muted-foreground mt-1">Registre-se para vincular sua presença</p>
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
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, '') })}
                  required
                  disabled={loading}
                  className="pl-10"
                  maxLength={14}
                />
              </div>
            </FormField>

            <FormField label="Nome Completo" required>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </FormField>

            <FormField label="Email" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Você receberá um código de verificação por email</p>
            </FormField>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-navy-border border-t-white rounded-full animate-spin mr-2" />
                  Enviando código...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Enviar código por email
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
