'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Logo } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import Link from 'next/link'
import { LogIn, Mail, Lock, AlertCircle, Shield } from 'lucide-react'

type LoginStep = 'cpf' | 'code' | 'admin'
type UserType = 'end_user' | 'admin'

export function LoginForm() {
  const [userType, setUserType] = useState<UserType>('end_user')
  const [step, setStep] = useState<LoginStep>('cpf')
  const [cpf, setCpf] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const router = useRouter()

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  const handleCpfSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const email = contactEmail.trim().toLowerCase()
    if (!cpf || !email) {
      setError('CPF e email são obrigatórios')
      return
    }

    setSendingCode(true)

    try {
      const contactRes = await fetch('/api/auth/get-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf }),
      })

      const contactData = await parseJson(contactRes)

      if (!contactRes.ok) {
        throw new Error(contactData.error || 'CPF não encontrado ou email não cadastrado')
      }

      const storedEmail = (contactData.email || '').trim().toLowerCase()
      if (email !== storedEmail) {
        throw new Error('Email não corresponde ao CPF cadastrado')
      }

      const emailRes = await fetch('/api/email/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const emailData = await parseJson(emailRes)
      if (!emailRes.ok) throw new Error(emailData.error || 'Erro ao enviar código')

      setCodeSent(true)
      setStep('code')

      if (process.env.NODE_ENV === 'development' && emailData.code) {
        console.log(`📧 [DEV] Código para ${email}: ${emailData.code}`)
        alert(`Código de verificação (DEV): ${emailData.code}`)
      }
    } catch (err) {
      setErrorFriendly(err)
    } finally {
      setSendingCode(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cpf, email: contactEmail.trim().toLowerCase(), code }),
      })

      const data = await parseJson(res)

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }

      // Aguardar um pouco para garantir que o cookie seja processado
      await new Promise(resolve => setTimeout(resolve, 300))

      // Redirecionar
      window.location.replace('/dashboard')
    } catch (err) {
      setErrorFriendly(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await parseJson(res)

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }

      // Aguardar um pouco para garantir que o cookie seja processado
      await new Promise(resolve => setTimeout(resolve, 300))

      // Redirecionar
      window.location.replace('/dashboard')
    } catch (err) {
      setErrorFriendly(err)
    } finally {
      setLoading(false)
    }
  }

  const parseJson = async (res: Response) => {
    const text = await res.text()
    if (!text.trim() || text.trimStart().startsWith('<')) {
      throw new Error('Resposta inválida do servidor. Tente novamente.')
    }
    try {
      return JSON.parse(text)
    } catch {
      throw new Error('Resposta inválida do servidor. Tente novamente.')
    }
  }

  const setErrorFriendly = (err: unknown) => {
    const msg = err instanceof Error ? err.message : 'Erro inesperado.'
    const friendly = /JSON|Unexpected token|<!DOCTYPE/i.test(msg)
      ? 'Resposta inválida do servidor. Tente novamente.'
      : msg
    setError(friendly)
  }

  return (
    <Card className="shadow-md border border-slate-200">
      <CardHeader className="space-y-1.5 pb-6 pt-10 px-6 text-center">
        <CardTitle className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 dark:text-gray-100">
          {userType === 'admin'
            ? 'Login Administrativo'
            : step === 'cpf'
              ? 'Bem-vindo de volta'
              : 'Verificação de Segurança'}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
          {userType === 'admin'
            ? 'Entre com seu email e senha de administrador'
            : step === 'cpf'
              ? 'Entre com seu CPF e email para receber o código'
              : `Enviamos um código para ${contactEmail || 'seu email'}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {/* Toggle entre usuário final e admin */}
        {(step === 'cpf' || step === 'admin') && (
          <div className="mb-4 flex gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => {
                setUserType('end_user')
                setStep('cpf')
                setError('')
              }}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${userType === 'end_user'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Participante
            </button>
            <button
              type="button"
              onClick={() => {
                setUserType('admin')
                setStep('admin')
                setError('')
              }}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${userType === 'admin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Profissional
            </button>
          </div>
        )}

        {/* Formulário de Admin */}
        {userType === 'admin' && step === 'admin' ? (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <FormField label="Email" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 h-11 text-base"
                />
              </div>
            </FormField>

            <FormField label="Senha" required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 h-11 text-base"
                />
              </div>
            </FormField>

            <Button type="submit" className="w-full h-11 text-base" size="lg" disabled={loading || !email || !password}>
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Entrar como Administrador
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setUserType('end_user')
                setStep('cpf')
                setEmail('')
                setPassword('')
                setError('')
              }}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition"
            >
              Sou participante (CPF + Email)
            </button>
          </form>
        ) : (
          <>
            {step === 'cpf' ? (
              <form onSubmit={handleCpfSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <FormField label="CPF" required>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value)
                        setCpf(formatted)
                      }}
                      required
                      disabled={sendingCode}
                      className="pl-10 h-11 text-base"
                      maxLength={14}
                    />
                  </div>
                </FormField>

                <FormField label="Email" required>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                      disabled={sendingCode}
                      className="pl-10 h-11 text-base"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                    Informe o email cadastrado no seu CPF
                  </p>
                </FormField>

                <Button type="submit" className="w-full h-11 text-base" size="lg" disabled={sendingCode || !cpf || !contactEmail}>
                  {sendingCode ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Enviando código...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Enviar código por email
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                  Não tem uma conta?{' '}
                  <Link href="/register" className="text-primary font-semibold hover:underline">
                    Cadastre-se gratuitamente
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {codeSent && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-900">Código enviado com sucesso! Verifique seu email.</p>
                  </div>
                )}

                <FormField label="Código de Verificação" required>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      disabled={loading}
                      className="pl-10 text-center text-2xl tracking-widest h-12"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Digite o código de 6 dígitos enviado para seu email
                  </p>
                </FormField>

                <Button type="submit" className="w-full h-11 text-base" size="lg" disabled={loading || code.length !== 6}>
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Entrar
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-base"
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
          </>
        )}
      </CardContent>
    </Card>
  )
}