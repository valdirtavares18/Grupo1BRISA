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
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

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
    // Remove tudo que não é dígito
    const cleanCep = cep.replace(/\D/g, '')

    // Aplica a máscara 00000-000
    let formattedCep = cleanCep
    if (cleanCep.length > 5) {
      formattedCep = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`
    }

    setFormData({ ...formData, zipCode: formattedCep })

    if (cleanCep.length === 8) {
      setLoadingCep(true)
      try {
        const res = await fetch(`/api/viacep?cep=${cleanCep}`)
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setFormData({
              ...formData,
              zipCode: formattedCep, // Mantém formatado
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
      // Função helper para redimensionar imagem
      const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
              const canvas = document.createElement('canvas')
              const MAX_WIDTH = 800
              const MAX_HEIGHT = 800
              let width = img.width
              let height = img.height

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width
                  width = MAX_WIDTH
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height
                  height = MAX_HEIGHT
                }
              }

              canvas.width = width
              canvas.height = height
              const ctx = canvas.getContext('2d')
              ctx?.drawImage(img, 0, 0, width, height)

              // Comprimir para JPEG com qualidade 0.8
              resolve(canvas.toDataURL('image/jpeg', 0.8))
            }
            img.onerror = (err) => reject(err)
          }
          reader.onerror = (err) => reject(err)
        })
      }

      const base64 = await resizeImage(file)

      // Atualizar preview imediatamente
      setFormData({ ...formData, profilePhotoUrl: base64 })

      // Atualizar no backend
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData, // Mantém outros dados
          profilePhotoUrl: base64, // Atualiza foto
        }),
      })

      if (res.ok) {
        setSuccess('Foto atualizada com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar foto')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar imagem')
      // Reverter preview em caso de erro (opcional, mas boa prática)
      fetchProfile()
    } finally {
      setUploadingPhoto(false)
      // Limpar input para permitir selecionar a mesma foto novamente se desejar
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
    <div className={`p-4 lg:p-6 lg:py-8 max-w-3xl mx-auto dark:bg-gray-900 transition-colors duration-300 min-h-screen`}>
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
        <Card className="border-0 shadow-lg dark:bg-gray-800 transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
              <span className="sr-only">Alternar tema</span>
            </Button>
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
            <div className="mb-6 flex flex-col items-center gap-4 pb-6 border-b dark:border-gray-700">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-sm">
                {formData.profilePhotoUrl ? (
                  <AvatarImage src={formData.profilePhotoUrl} alt={formData.fullName || 'Usuário'} />
                ) : null}
                <AvatarFallback className="text-2xl bg-primary/10 text-primary dark:bg-gray-700 dark:text-gray-300">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
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
              <FormField label="CPF" className="text-gray-700 dark:text-gray-300">
                <Input
                  value={formatCPF(formData.cpf)}
                  disabled
                  className="bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400"
                />
                <p className="text-xs text-muted-foreground mt-1 dark:text-gray-500">O CPF não pode ser alterado</p>
              </FormField>

              <FormField label="Nome Completo" className="text-gray-700 dark:text-gray-300">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-gray-500" />
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Seu nome completo"
                    disabled={loading}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              </FormField>

              <FormField label="Email" className="text-gray-700 dark:text-gray-300">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-gray-500" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    disabled={loading}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              </FormField>

              <FormField label="Telefone" className="text-gray-700 dark:text-gray-300">
                <div className="relative">
                  <Phone className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 dark:text-gray-500" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    disabled={loading}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              </FormField>

              <FormField label="CEP" className="text-gray-700 dark:text-gray-300">
                <div className="relative">
                  <MapPin className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 dark:text-gray-500" />
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    disabled={loading || loadingCep}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    maxLength={9}
                  />
                  {loadingCep && (
                    <Loader2 className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 animate-spin dark:text-gray-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">
                  Digite o CEP para preencher automaticamente o endereço
                </p>
              </FormField>

              {formData.address && (
                <FormField label="Endereço" className="text-gray-700 dark:text-gray-300">
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, complemento"
                    disabled={loading}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </FormField>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.city && (
                  <FormField label="Cidade" className="text-gray-700 dark:text-gray-300">
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={loading}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </FormField>
                )}

                {formData.state && (
                  <FormField label="Estado" className="text-gray-700 dark:text-gray-300">
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      disabled={loading}
                      maxLength={2}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </FormField>
                )}
              </div>

              <FormField label="Biografia" className="text-gray-700 dark:text-gray-300">
                <div className="relative">
                  <FileText className="w-5 h-5 text-muted-foreground absolute left-3 top-3 dark:text-gray-500" />
                  <textarea
                    value={formData.biography}
                    onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                    placeholder="Conte um pouco sobre você..."
                    disabled={loading}
                    className="w-full min-h-[100px] px-10 py-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    maxLength={500}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">
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

        <Card className="border-0 shadow-lg border-red-200 dark:border-red-900/50 dark:bg-gray-800 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="w-5 h-5" />
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 dark:text-gray-400">
              Ao excluir sua conta, seus dados pessoais serão anonimizados e você não poderá mais acessar o sistema.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={loadingDelete}
              className="dark:bg-red-900/80 dark:hover:bg-red-900"
            >
              {loadingDelete ? 'Excluindo...' : 'Excluir Minha Conta'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}