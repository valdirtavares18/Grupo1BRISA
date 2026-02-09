'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Avatar, AvatarImage, AvatarFallback } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { User, Mail, Phone, Camera, Save, AlertCircle, CheckCircle2, ArrowLeft, Trash2, MapPin, FileText, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCPF } from '@/lib/utils'

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
    cpf: '',
    zipCode: '',
    address: '',
    city: '',
    state: '',
    biography: '',
    profilePhotoUrl: '',
  })
  const [loadingCep, setLoadingCep] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          cpf: data.cpf || '',
          zipCode: data.zipCode || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          biography: data.biography || '',
          profilePhotoUrl: data.profilePhotoUrl || '',
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
          phone: formData.phone || null,
          zipCode: formData.zipCode || null,
          biography: formData.biography || null,
          profilePhotoUrl: formData.profilePhotoUrl || null,
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

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    setFormData({ ...formData, zipCode: cleanCep })

    if (cleanCep.length === 8) {
      setLoadingCep(true)
      try {
        const res = await fetch(`/api/viacep?cep=${cleanCep}`)
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setFormData({
              ...formData,
              zipCode: data.zipCode,
              address: data.address,
              city: data.city,
              state: data.state,
            })
          }
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err)
      } finally {
        setLoadingCep(false)
      }
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida')
      return
    }

    setUploadingPhoto(true)
    setError('')

    try {
      // Converter para base64 (para simplificar, em produção usar upload para S3 ou similar)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string

        // Salvar como URL base64 (em produção, fazer upload para storage)
        setFormData({ ...formData, profilePhotoUrl: base64 })

        // Atualizar no backend
        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            profilePhotoUrl: base64,
          }),
        })

        if (res.ok) {
          setSuccess('Foto atualizada com sucesso!')
          setTimeout(() => setSuccess(''), 3000)
        }
      }
      reader.readAsDataURL(file)
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload da foto')
    } finally {
      setUploadingPhoto(false)
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
    <div className="p-4 lg:p-6 lg:py-8 max-w-3xl mx-auto">
      <Link
        href="/dashboard/user"
        className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar</span>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-white">Meu Perfil</h1>
        <p className="text-white/80">Gerencie suas informações pessoais</p>
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
              <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-900">{success}</p>
              </div>
            )}

            {/* Foto de Perfil */}
            <div className="mb-6 flex flex-col items-center gap-4 pb-6 border-b">
              <Avatar className="w-24 h-24">
                {formData.profilePhotoUrl ? (
                  <AvatarImage src={formData.profilePhotoUrl} alt={formData.fullName || 'Usuário'} />
                ) : null}
                <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                  ref={fileInputRef}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.profilePhotoUrl ? 'Alterar Foto' : 'Adicionar Foto'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Máximo 5MB. Formatos: JPG, PNG
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="CPF">
                <Input
                  value={formatCPF(formData.cpf)}
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

              <FormField label="CEP">
                <div className="relative">
                  <MapPin className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    disabled={loading || loadingCep}
                    className="pl-10"
                    maxLength={9}
                  />
                  {loadingCep && (
                    <Loader2 className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Digite o CEP para preencher automaticamente o endereço
                </p>
              </FormField>

              {formData.address && (
                <FormField label="Endereço">
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, complemento"
                    disabled={loading}
                  />
                </FormField>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.city && (
                  <FormField label="Cidade">
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={loading}
                    />
                  </FormField>
                )}

                {formData.state && (
                  <FormField label="Estado">
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      disabled={loading}
                      maxLength={2}
                    />
                  </FormField>
                )}
              </div>

              <FormField label="Biografia">
                <div className="relative">
                  <FileText className="w-5 h-5 text-muted-foreground absolute left-3 top-3" />
                  <textarea
                    value={formData.biography}
                    onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                    placeholder="Conte um pouco sobre você..."
                    disabled={loading}
                    className="w-full min-h-[100px] px-10 py-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={500}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.biography.length}/500 caracteres
                </p>
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
  )
}