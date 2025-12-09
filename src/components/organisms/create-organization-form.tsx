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
    <Card>
      <CardContent className="p-8 lg:p-10">
        <div className="mb-8 p-5 rounded-lg bg-white/15 border border-white/30 flex items-start gap-3">
          <Info className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
          <div className="text-base text-white">
            <p className="font-semibold mb-2 text-lg text-white">Organização White-Label</p>
            <p>Cada organização terá sua própria página personalizada com identidade visual única.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-5 rounded-lg bg-red-500/30 border-2 border-red-400/50 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-200 flex-shrink-0 mt-0.5" />
              <p className="text-base font-medium text-white">{error}</p>
            </div>
          )}

          <FormField label="Nome da Organização" required>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/70" />
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Empresa XYZ Ltda"
                required
                disabled={loading}
                className="pl-12 h-14 text-lg bg-white/20 border-2 border-white/40 text-white placeholder:text-white/60 focus:border-yellow-500 focus:ring-yellow-500 focus:ring-2"
              />
            </div>
          </FormField>

          <FormField label="Identificador (Slug)" required>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/70" />
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="empresa-xyz"
                required
                disabled={loading}
                className="pl-12 h-14 text-lg font-mono bg-white/20 border-2 border-white/40 text-white placeholder:text-white/60 focus:border-yellow-500 focus:ring-yellow-500 focus:ring-2"
              />
            </div>
            <p className="text-sm text-white/90 mt-3 flex items-start gap-2">
              <span className="mt-0.5 text-lg">💡</span>
              <span>Usado na URL: <code className="bg-white/20 px-3 py-1.5 rounded-lg border border-white/30 text-white font-mono text-sm">organizacao.plataforma.com/{formData.slug || 'slug'}</code></span>
            </p>
          </FormField>

          <FormField label="Cor Principal do Tema">
            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/70 pointer-events-none z-10" />
                <Input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-24 h-14 cursor-pointer pl-12 bg-white/20 border-2 border-white/40"
                  disabled={loading}
                />
              </div>
              <Input
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                placeholder="#001F3F"
                disabled={loading}
                className="flex-1 h-14 text-lg font-mono uppercase bg-white/20 border-2 border-white/40 text-white placeholder:text-white/60 focus:border-yellow-500 focus:ring-yellow-500 focus:ring-2"
              />
            </div>
            <div className="mt-4 p-4 rounded-lg border-2 border-white/40 bg-white/15">
              <p className="text-sm font-semibold text-white" style={{ color: formData.primaryColor }}>
                Prévia da cor selecionada
              </p>
            </div>
          </FormField>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-white/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="w-full sm:w-auto h-14 text-lg border-2 border-white/40 text-white hover:bg-white/25 bg-white/15 font-semibold"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:flex-1 h-14 text-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 font-semibold shadow-lg">
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Building2 className="w-6 h-6 mr-2" />
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