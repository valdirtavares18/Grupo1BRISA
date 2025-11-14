'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { Building2, Palette, AlertCircle, Save } from 'lucide-react'

interface EditOrganizationFormProps {
  organization: any
}

export function EditOrganizationForm({ organization }: EditOrganizationFormProps) {
  const [name, setName] = useState(organization.name)
  const [slug, setSlug] = useState(organization.slug)
  const [isActive, setIsActive] = useState(organization.isActive === 1)
  const [primaryColor, setPrimaryColor] = useState(organization.theme?.primaryColor || '#001F3F')
  const [logoUrl, setLogoUrl] = useState(organization.theme?.logoUrl || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/organizations/${organization.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          slug,
          isActive,
          theme: {
            primaryColor,
            logoUrl: logoUrl || null
          }
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar organização')
      }

      alert('Organização atualizada com sucesso!')
      router.push(`/dashboard/admin/organizations/${organization.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Informações da Organização
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Dados Básicos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Dados Básicos
            </h3>

            <FormField label="Nome da Organização" required>
              <Input
                placeholder="Ex: Prefeitura Municipal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </FormField>

            <FormField 
              label="Slug (URL)" 
              required
              hint="Usado na URL pública. Apenas letras minúsculas, números e hífens."
            >
              <Input
                placeholder="Ex: prefeitura-municipal"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL pública: <code className="bg-gray-100 px-1 rounded">/{slug}</code>
              </p>
            </FormField>

            <FormField label="Status">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">
                  {isActive ? '✅ Organização Ativa' : '⛔ Organização Inativa'}
                </span>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                {isActive 
                  ? 'A organização está ativa e pode ser acessada normalmente.' 
                  : 'A organização está inativa. Administradores não poderão fazer login.'}
              </p>
            </FormField>
          </div>

          {/* Tema */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Personalização (White-Label)
            </h3>

            <FormField 
              label="Cor Primária" 
              hint="Cor principal usada na interface da organização"
            >
              <div className="flex gap-3 items-center">
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={loading}
                  className="w-20 h-12 cursor-pointer"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={loading}
                  placeholder="#001F3F"
                  className="flex-1"
                />
              </div>
            </FormField>

            <FormField 
              label="URL do Logo" 
              hint="Link direto para a imagem do logo (opcional)"
            >
              <Input
                type="url"
                placeholder="https://exemplo.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                disabled={loading}
              />
            </FormField>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


