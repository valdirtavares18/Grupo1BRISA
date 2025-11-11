'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { Building2, Hash, Palette, AlertCircle, Info } from 'lucide-react'

export function CreateOrganizationForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    primaryColor: '#001F3F',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
          theme: {
            primaryColor: formData.primaryColor,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar organização')
      }

      router.push('/dashboard/admin')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardContent className="p-6 lg:p-8">
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Organização White-Label</p>
            <p>Cada organização terá sua própria página personalizada com identidade visual única.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <FormField label="Nome da Organização" required>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Empresa XYZ Ltda"
                required
                disabled={loading}
                className="pl-10"
              />
            </div>
          </FormField>

          <FormField label="Identificador (Slug)" required>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="empresa-xyz"
                required
                disabled={loading}
                className="pl-10 font-mono text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
              <span className="mt-0.5">💡</span>
              Usado na URL: <code className="bg-gray-100 px-1 rounded">organizacao.plataforma.com/{formData.slug || 'slug'}</code>
            </p>
          </FormField>

          <FormField label="Cor Principal do Tema">
            <div className="flex gap-3">
              <div className="relative flex-shrink-0">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-20 h-12 cursor-pointer pl-10"
                  disabled={loading}
                />
              </div>
              <Input
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                placeholder="#001F3F"
                disabled={loading}
                className="font-mono uppercase"
              />
            </div>
            <div className="mt-3 p-3 rounded-lg border-2" style={{ backgroundColor: formData.primaryColor + '10', borderColor: formData.primaryColor + '30' }}>
              <p className="text-xs font-semibold" style={{ color: formData.primaryColor }}>
                Prévia da cor selecionada
              </p>
            </div>
          </FormField>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:flex-1">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Building2 className="w-5 h-5 mr-2" />
                  Criar Organização
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}