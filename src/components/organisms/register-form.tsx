/* eslint-disable */
'use client'

import { validateCPF, validatePhone } from '@/lib/utils'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import Link from 'next/link'
import { UserPlus, Mail, AlertCircle, Smartphone, Shield } from 'lucide-react'

type RegisterStep = 'cpf' | 'code'

export function RegisterForm() {
  const [step, setStep] = useState<RegisterStep>('cpf')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [searchingName, setSearchingName] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms')
  const router = useRouter()

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const fetchNameByCpf = async (cpfValue: string) => {
    const cleanCpf = cpfValue.replace(/\D/g, '')
    if (cleanCpf.length !== 11) return

    if (!validateCPF(cpfValue)) return

    setSearchingName(true)
    try {
      const res = await fetch(`/api/utils/cpf-lookup?cpf=${cleanCpf}`)
      if (res.ok) {
        const data = await res.json()
        if (data.name) {
          setFullName(data.name)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar nome:', error)
    } finally {
      setSearchingName(false)
    }
  }

  const handleCpfSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!cpf || !phone) {
      setError('CPF e telefone são obrigatórios')
      return
    }

    if (!validateCPF(cpf)) {
      setError('CPF inválido')
      return
    }

    if (!validatePhone(phone)) {
      setError('Telefone inválido')
      return
    }

    setSendingCode(true)

    try {
      // Enviar CPF e telefone para iniciar registro e receber código SMS
      const res = await fetch('/api/auth/register-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''),
          phone: phone.replace(/\D/g, ''),
          channel
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar código')
      }

      setCodeSent(true)
      setStep('code')

      // Mostrar código em desenvolvimento
      if (process.env.NODE_ENV === 'development' && data.code) {
        console.log(`📱 [DEV] Código de verificação para ${phone.replace(/\D/g, '')}: ${data.code}`)
        alert(`Código de verificação (DEV): ${data.code}`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSendingCode(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''),
          phone: phone.replace(/\D/g, ''),
          code,
          fullName
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      // Aguardar um pouco para garantir que o cookie seja processado
      await new Promise(resolve => setTimeout(resolve, 300))

      // Redirecionar
      window.location.replace('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-2xl border-0">
      <CardHeader className="space-y-2 pb-8 p-8">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6">
          {step === 'cpf' ? <UserPlus className="w-8 h-8 text-white" /> : <Shield className="w-8 h-8 text-white" />}
        </div>
        <CardTitle className="text-3xl sm:text-4xl lg:text-5xl">
          {step === 'cpf' ? 'Criar sua conta' : 'Verificação de Segurança'}
        </CardTitle>
        <CardDescription className="text-lg sm:text-xl">
          {step === 'cpf'
            ? 'Registre-se com seu CPF e telefone para receber o código de verificação'
            : `Enviamos um código para ${phone ? formatPhone(phone) : 'seu telefone'}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        {step === 'cpf' ? (
          <form onSubmit={handleCpfSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-base text-destructive">{error}</p>
              </div>
            )}

            <FormField label="CPF" required>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value)
                    setCpf(formatted)
                    if (formatted.replace(/\D/g, '').length === 11) {
                      fetchNameByCpf(formatted)
                    }
                  }}
                  required
                  disabled={sendingCode}
                  className="pl-12 h-14 text-lg"
                  maxLength={14}
                />
              </div>
            </FormField>

            <FormField label="Nome Completo" required>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={sendingCode}
                  className="pl-12 h-14 text-lg"
                />
                {searchingName && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </FormField>

            <FormField label="Telefone" required>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value)
                    setPhone(formatted)
                  }}
                  required
                  disabled={sendingCode}
                  className="pl-12 h-14 text-lg"
                  maxLength={15}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Você receberá um código de verificação
              </p>
            </FormField>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Receber código via
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${channel === 'sms' ? 'border-primary bg-primary/5 text-primary' : 'border-input hover:bg-muted'}`}>
                  <input
                    type="radio"
                    name="channel"
                    value="sms"
                    checked={channel === 'sms'}
                    onChange={() => setChannel('sms')}
                    className="sr-only"
                  />
                  <Smartphone className="w-4 h-4" />
                  <span>SMS</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${channel === 'whatsapp' ? 'border-green-500 bg-green-50 text-green-700' : 'border-input hover:bg-muted'}`}>
                  <input
                    type="radio"
                    name="channel"
                    value="whatsapp"
                    checked={channel === 'whatsapp'}
                    onChange={() => setChannel('whatsapp')}
                    className="sr-only"
                  />
                  <Shield className="w-4 h-4" />
                  <span>WhatsApp</span>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-lg" size="lg" disabled={sendingCode || !cpf || !phone}>
              {sendingCode ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                  Enviando código...
                </>
              ) : (
                <>
                  <Smartphone className="mr-3 h-6 w-6" />
                  Enviar código SMS
                </>
              )}
            </Button>

            <div className="text-center text-base text-muted-foreground pt-6 border-t">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Faça login
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-base text-destructive">{error}</p>
              </div>
            )}

            {codeSent && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-base text-green-900">Código enviado com sucesso! Verifique seu telefone.</p>
              </div>
            )}

            <FormField label="Código de Verificação" required>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  disabled={loading}
                  className="pl-12 text-center text-3xl tracking-widest h-16"
                  maxLength={6}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Digite o código de 6 dígitos enviado para seu telefone
              </p>
            </FormField>

            <Button type="submit" className="w-full h-14 text-lg" size="lg" disabled={loading || code.length !== 6}>
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="mr-3 h-6 w-6" />
                  Criar Conta
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-lg"
              onClick={() => {
                setStep('cpf')
                setCode('')
                setError('')
                setCodeSent(false)
              }}
            >
              Voltar
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}