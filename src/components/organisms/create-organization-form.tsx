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
    <Card className="bg-navy-light border-navy-border">
      <CardContent className="p-6 lg:p-8">
        <div className="mb-6 p-4 rounded-lg bg-navy-light border border-navy-border flex items-start gap-3">
          <Info className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white">
            <p className="font-semibold mb-1.5 text-base text-white">Organização White-Label</p>
            <p>Cada organização terá sua própria página personalizada com identidade visual única.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/30 border-2 border-red-400/50 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-white">{error}</p>
            </div>
          )}

          <FormField label="Nome da Organização" required>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C8CDD5]" />
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Empresa XYZ Ltda"
                required
                disabled={loading}
                className="pl-10 h-11 text-base bg-navy border-navy-border text-white placeholder:text-[#8B92A0] focus:border-mustard/50 focus:ring-mustard focus:ring-2"
              />
            </div>
          </FormField>

          <FormField label="Identificador (Slug)" required>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C8CDD5]" />
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="empresa-xyz"
                required
                disabled={loading}
                className="pl-10 h-11 text-base font-mono bg-navy border-navy-border text-white placeholder:text-[#8B92A0] focus:border-mustard/50 focus:ring-mustard focus:ring-2"
              />
            </div>
            <p className="text-sm text-white mt-2 flex items-start gap-2">
              <span className="mt-0.5">💡</span>
              <span>Usado na URL: <code className="bg-navy-light px-2 py-1 rounded-lg border border-navy-border text-white font-mono text-xs">organizacao.plataforma.com/{formData.slug || 'slug'}</code></span>
            </p>
          </FormField>

          <FormField label="Cor Principal do Tema">
            <div className="flex gap-3">
              <div className="relative flex-shrink-0">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C8CDD5] pointer-events-none z-10" />
                <Input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-20 h-11 cursor-pointer pl-10 bg-navy border-navy-border"
                  disabled={loading}
                />
              </div>
              <Input
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                placeholder="#001F3F"
                disabled={loading}
                className="flex-1 h-11 text-base font-mono uppercase bg-navy border-navy-border text-white placeholder:text-[#8B92A0] focus:border-mustard/50 focus:ring-mustard focus:ring-2"
              />
            </div>
            <div className="mt-3 p-3 rounded-lg border-2 border-navy-border bg-navy-light">
              <p className="text-sm font-semibold text-white" style={{ color: formData.primaryColor }}>
                Prévia da cor selecionada
              </p>
            </div>
          </FormField>

          <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t-2 border-navy-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="w-full sm:w-auto h-11 text-base border-2 border-navy-border text-white hover:bg-navy-light bg-navy-light font-semibold"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:flex-1 h-11 text-base bg-mustard text-ink font-semibold shadow-md">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-navy-border border-t-white rounded-full animate-spin mr-2" />
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