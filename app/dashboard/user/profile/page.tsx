'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/atoms'
import { Navbar } from '@/components/organisms/navbar'
import { FormField } from '@/components/molecules'
import { User, Mail, Phone, Camera, Save, AlertCircle, CheckCircle2, ArrowLeft, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UserProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpf: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          cpf: data.cpf || ''
        })
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName || null,
          email: formData.email || null,
          phone: formData.phone || null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setSuccess('Perfil atualizado com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      return
    }

    setLoadingDelete(true)
    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        alert('Conta excluída com sucesso')
        router.push('/')
      } else {
        const data = await res.json()
        throw new Error(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingDelete(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar userRole="USUÁRIO" />
      
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-3xl">
        <Link 
          href="/dashboard/user"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-900">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="CPF">
                  <Input
                    value={formData.cpf}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">O CPF não pode ser alterado</p>
                </FormField>

                <FormField label="Nome Completo">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Seu nome completo"
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                </FormField>

                <FormField label="Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                </FormField>

                <FormField label="Telefone">
                  <div className="relative">
                    <Phone className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                </FormField>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ao excluir sua conta, seus dados pessoais serão anonimizados e você não poderá mais acessar o sistema.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={loadingDelete}
              >
                {loadingDelete ? 'Excluindo...' : 'Excluir Minha Conta'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}