'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import Link from 'next/link'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('🔵 [LoginForm] Iniciando login com:', email)
    
    try {
      console.log('🔵 [LoginForm] Fazendo fetch para /api/auth/login')
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      console.log('🔵 [LoginForm] Resposta recebida:', res.status, res.statusText)
      console.log('🔵 [LoginForm] Headers da resposta:', Object.fromEntries(res.headers.entries()))
      
      const data = await res.json()
      console.log('🔵 [LoginForm] Data recebida:', data)

      if (!res.ok) {
        console.log('❌ [LoginForm] Erro na resposta:', data.error)
        throw new Error(data.error || 'Erro ao fazer login')
      }

      console.log('✅ [LoginForm] Login bem-sucedido, redirecionando...')
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
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email" error={error} required>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
