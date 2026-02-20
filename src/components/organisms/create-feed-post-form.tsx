'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { MessageSquare, AlertCircle, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react'

interface CreateFeedPostFormProps {
  organizationId: string
  initialData?: {
    id?: string
    title?: string
    content?: string
    imageUrl?: string
    published?: boolean
  }
}

export function CreateFeedPostForm({
  organizationId,
  initialData,
}: CreateFeedPostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    imageUrl: initialData?.imageUrl || '',
    published: initialData?.published !== undefined ? initialData.published : true,
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const url = initialData?.id
        ? `/api/organizations/${organizationId}/feed/${initialData.id}`
        : `/api/organizations/${organizationId}/feed`

      const method = initialData?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar post')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/organization/feed')
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingImage(true)
    setError('')

    try {
      // Converter para base64 (em produção, fazer upload para storage)
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData({ ...formData, imageUrl: base64 })
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload da imagem')
      setUploadingImage(false)
    }
  }

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                Post {initialData?.id ? 'atualizado' : 'criado'} com sucesso!
              </p>
            </div>
          )}

          <FormField label="Título" required>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título do post"
              required
              disabled={loading}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-yellow-500 focus:ring-yellow-500"
            />
          </FormField>

          <FormField label="Conteúdo" required>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Escreva o conteúdo do post..."
              required
              disabled={loading}
              className="w-full min-h-[200px] px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <p className="text-xs text-white/60 mt-1">
              {formData.content.length} caracteres
            </p>
          </FormField>

          <FormField label="Imagem">
            {formData.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden border">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <label htmlFor="image-upload" className="cursor-pointer">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading || uploadingImage}
              />
              <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/30 rounded-lg hover:border-white/50 transition">
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white/70" />
                    <span className="text-sm text-white/70">Enviando imagem...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 text-white/70" />
                    <span className="text-sm text-white/70">
                      {formData.imageUrl ? 'Alterar Imagem' : 'Adicionar Imagem'}
                    </span>
                  </>
                )}
              </div>
            </label>
            <p className="text-xs text-white/60 mt-1">
              Máximo 5MB. Formatos: JPG, PNG
            </p>
          </FormField>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              disabled={loading}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="published" className="text-sm font-medium text-white">
              Publicar imediatamente
            </label>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading || uploadingImage}>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5 mr-2" />
                {initialData?.id ? 'Atualizar Post' : 'Criar Post'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

