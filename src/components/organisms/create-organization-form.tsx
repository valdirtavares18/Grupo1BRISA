'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'

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

    console.log('🔵 [CreateOrgForm] Document.cookie:', document.cookie)

    try {
      console.log('🔵 [CreateOrgForm] Enviando requisição para criar organização')
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
      
      console.log('🔵 [CreateOrgForm] Resposta recebida:', res.status)

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
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nome da Organização" error={error} required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome completo"
              required
              disabled={loading}
            />
          </FormField>

          <FormField label="Slug" required>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="identificador-unico"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Usado na URL da organização (apenas letras, números e hífens)
            </p>
          </FormField>

          <FormField label="Cor Principal">
            <div className="flex gap-2">
              <Input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-20 h-10"
                disabled={loading}
              />
              <Input
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                placeholder="#001F3F"
                disabled={loading}
              />
            </div>
          </FormField>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Criando...' : 'Criar Organização'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
