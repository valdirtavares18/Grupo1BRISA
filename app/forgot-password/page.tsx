'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { CreditCard, ArrowLeft, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cpf, setCpf] = useState('')
  const [resetData, setResetData] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setResetData(data)
      setStep('reset')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: resetData.userId,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      window.location.href = '/login'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-blue-800 to-primary">
      <div className="container mx-auto px-4 py-6">
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao login</span>
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="space-y-1 pb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl">
                {step === 'request' ? 'Recuperar Senha' : 'Nova Senha'}
              </CardTitle>
              <CardDescription className="text-base">
                {step === 'request' 
                  ? 'Informe seu CPF para receber instruções' 
                  : 'Defina sua nova senha de acesso'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'request' ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <FormField label="CPF" required>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10"
                      />
                    </div>
                  </FormField>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      'Recuperar Senha'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-900">
                      CPF validado! Defina sua nova senha abaixo.
                    </p>
                  </div>

                  <FormField label="Nova Senha" required>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </FormField>

                  <FormField label="Confirmar Senha" required>
                    <Input
                      type="password"
                      placeholder="Confirme sua nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </FormField>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      'Redefinir Senha'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

