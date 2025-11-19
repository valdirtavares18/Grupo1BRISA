'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { Calendar, Clock, FileText, AlertCircle, MapPin, Tag } from 'lucide-react'

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
    address: '',
    city: '',
    state: '',
    zipCode: '',
    eventType: '',
  })
  const [eventTypes, setEventTypes] = useState<string[]>([])

  useEffect(() => {
    fetchEventTypes()
  }, [])

  const fetchEventTypes = async () => {
    try {
      const res = await fetch('/api/events/types')
      if (res.ok) {
        const data = await res.json()
        setEventTypes(data)
      }
    } catch (err) {
      console.error('Erro ao buscar tipos de eventos:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      
      const startDate = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDate = new Date(`${formData.endDate}T${formData.endTime}`)

      const eventDate = new Date(formData.startDate)
      eventDate.setHours(0, 0, 0, 0)

      if (eventDate < now) {
        throw new Error('A data do evento deve ser igual ou posterior à data atual')
      }

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
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state ? formData.state.toUpperCase() : null,
          zipCode: formData.zipCode.replace(/\D/g, '') || null,
          eventType: formData.eventType || null,
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
    <Card className="border-0 shadow-xl">
      <CardContent className="p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <FormField label="Título do Evento" required>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Workshop de Tecnologia 2025"
                required
                disabled={loading}
                className="pl-10"
              />
            </div>
          </FormField>

          <FormField label="Descrição">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva os detalhes do evento..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] resize-y"
              disabled={loading}
            />
          </FormField>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data e Hora de Início
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Data" required>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    disabled={loading}
                  />
                </FormField>

                <FormField label="Hora" required>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    disabled={loading}
                  />
                </FormField>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Data e Hora de Término
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Data" required>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    disabled={loading}
                  />
                </FormField>

                <FormField label="Hora" required>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    disabled={loading}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Localização
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="CEP">
                <Input
                  type="text"
                  placeholder="00000-000"
                  value={formData.zipCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    if (value.length <= 8) {
                      const formatted = value.length > 5 ? `${value.substring(0, 5)}-${value.substring(5)}` : value
                      setFormData({ ...formData, zipCode: formatted })
                    }
                  }}
                  maxLength={9}
                  disabled={loading}
                />
              </FormField>

              <FormField label="Estado">
                <Input
                  type="text"
                  placeholder="Ex: SP, RJ"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  maxLength={2}
                  disabled={loading}
                />
              </FormField>

              <FormField label="Cidade">
                <Input
                  type="text"
                  placeholder="Nome da cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={loading}
                />
              </FormField>

              <FormField label="Endereço">
                <Input
                  type="text"
                  placeholder="Rua, número, complemento"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={loading}
                />
              </FormField>
            </div>
          </div>

          <FormField label="Tipo de Evento">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              >
                <option value="">Selecione o tipo (opcional)</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Você também pode digitar um novo tipo
            </p>
            {formData.eventType && !eventTypes.includes(formData.eventType) && (
              <Input
                type="text"
                placeholder="Digite o tipo de evento"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                disabled={loading}
                className="mt-2"
              />
            )}
          </FormField>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                'Criar Evento'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}