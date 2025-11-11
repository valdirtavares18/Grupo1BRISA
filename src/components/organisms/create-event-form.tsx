'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'

export function CreateEventForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const startDate = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDate = new Date(`${formData.endDate}T${formData.endTime}`)

      if (endDate <= startDate) {
        throw new Error('A data de término deve ser posterior à data de início')
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar evento')
      }

      router.push(`/dashboard/organization/events/${data.id}`)
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
          <FormField label="Título do Evento" error={error} required>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nome do evento"
              required
              disabled={loading}
            />
          </FormField>

          <FormField label="Descrição">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do evento"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
              disabled={loading}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Data de Início" required>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                disabled={loading}
              />
            </FormField>

            <FormField label="Hora de Início" required>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                disabled={loading}
              />
            </FormField>

            <FormField label="Data de Término" required>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                disabled={loading}
              />
            </FormField>

            <FormField label="Hora de Término" required>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                disabled={loading}
              />
            </FormField>
          </div>

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
              {loading ? 'Criando...' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
