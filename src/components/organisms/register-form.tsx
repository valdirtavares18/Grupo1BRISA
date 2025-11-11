'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import Link from 'next/link'

export function RegisterForm() {
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application-blob' },
        body: JSON.stringify({ cpf, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Criar Conta</CardTitle>
        <CardDescription>
          Registre-se com seu CPF para começar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="CPF" error={error} required>
            <Input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>

          <FormField label="Senha" required>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>

          <FormField label="Confirmar Senha" required>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
