'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { Calendar, Clock, FileText, AlertCircle, MapPin, Tag, Gift, Loader2 } from 'lucide-react'

interface CreateEventFormProps {
  organizationId?: string
}

export function CreateEventForm({ organizationId: propOrganizationId }: CreateEventFormProps) {
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
    reward: '',
  })
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [loadingCep, setLoadingCep] = useState(false)
  const [showNewTypeDialog, setShowNewTypeDialog] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [creatingType, setCreatingType] = useState(false)

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

  const handleCreateNewType = async () => {
    if (!newTypeName.trim()) {
      setError('Nome do tipo é obrigatório')
      return
    }

    setCreatingType(true)
    setError('')

    try {
      const res = await fetch('/api/events/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTypeName.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao criar tipo')
      }

      const newType = await res.json()
      setEventTypes([...eventTypes, newType.name])
      setFormData({ ...formData, eventType: newType.name })
      setNewTypeName('')
      setShowNewTypeDialog(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar tipo de evento')
    } finally {
      setCreatingType(false)
    }
  }

  const handleCepChange = async (value: string) => {
    const cleanCep = value.replace(/\D/g, '')
    const formatted = cleanCep.length > 5 ? `${cleanCep.substring(0, 5)}-${cleanCep.substring(5)}` : cleanCep

    setFormData({ ...formData, zipCode: formatted })

    // Buscar endereço quando CEP tiver 8 dígitos
    if (cleanCep.length === 8) {
      setLoadingCep(true)
      try {
        const res = await fetch(`/api/viacep?cep=${cleanCep}`)
        if (res.ok) {
          const addressData = await res.json()
          setFormData({
            ...formData,
            zipCode: formatted,
            address: addressData.address || '',
            city: addressData.city || '',
            state: addressData.state || '',
          })
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err)
      } finally {
        setLoadingCep(false)
      }
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
          organizationId: propOrganizationId,
          title: formData.title,
          description: formData.description || null,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state ? formData.state.toUpperCase() : null,
          zipCode: formData.zipCode.replace(/\D/g, '') || null,
          eventType: formData.eventType || null,
          reward: formData.reward || null,
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
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardContent className="p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-400/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          <FormField label="Título do Evento" required>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Workshop de Tecnologia 2025"
                required
                disabled={loading}
                className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-yellow-500 focus:ring-yellow-500"
              />
            </div>
          </FormField>

          <FormField label="Descrição">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva os detalhes do evento..."
              className="flex w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] resize-y"
              disabled={loading}
            />
          </FormField>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-white">
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
                    className="bg-white/10 border-white/30 text-white focus:border-yellow-500 focus:ring-yellow-500 [color-scheme:dark]"
                  />
                </FormField>

                <FormField label="Hora" required>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    disabled={loading}
                    className="bg-white/10 border-white/30 text-white focus:border-yellow-500 focus:ring-yellow-500 [color-scheme:dark]"
                  />
                </FormField>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-white">
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
                    className="bg-white/10 border-white/30 text-white focus:border-yellow-500 focus:ring-yellow-500 [color-scheme:dark]"
                  />
                </FormField>

                <FormField label="Hora" required>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    disabled={loading}
                    className="bg-white/10 border-white/30 text-white focus:border-yellow-500 focus:ring-yellow-500 [color-scheme:dark]"
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-white">
              <MapPin className="w-4 h-4" />
              Localização
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="CEP">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="00000-000"
                    value={formData.zipCode}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                    disabled={loading || loadingCep}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-yellow-500 focus:ring-yellow-500"
                  />
                  {loadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white/60" />
                  )}
                </div>
                {loadingCep && (
                  <p className="text-xs text-white/70 mt-1">Buscando endereço...</p>
                )}
              </FormField>

              <FormField label="Estado">
                <Input
                  type="text"
                  placeholder="Ex: SP, RJ"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  maxLength={2}
                  disabled={loading}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-yellow-500 focus:ring-yellow-500"
                />
              </FormField>

              <FormField label="Cidade">
                <Input
                  type="text"
                  placeholder="Nome da cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={loading}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-yellow-500 focus:ring-yellow-500"
                />
              </FormField>

              <FormField label="Endereço">
                <Input
                  type="text"
                  placeholder="Rua, número, complemento"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={loading}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-yellow-500 focus:ring-yellow-500"
                />
              </FormField>
            </div>
          </div>

          <FormField label="Tipo de Evento">
            <div className="space-y-2">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-white/30 bg-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 [color-scheme:dark]"
                  disabled={loading}
                >
                  <option value="">Selecione o tipo (opcional)</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type} className="bg-slate-800 text-white">
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewTypeDialog(true)}
                disabled={loading}
                className="w-full border-white/30 text-white hover:bg-white/20 bg-white/10"
              >
                <Tag className="w-4 h-4 mr-2" />
                Criar novo tipo
              </Button>
            </div>
          </FormField>

          {/* Dialog para criar novo tipo */}
          {showNewTypeDialog && (
            <div className="fixed inset-0 z-50 grid min-h-screen place-items-center bg-black/70 p-4 backdrop-blur-sm">
              <Card className="w-full max-w-md bg-slate-800/95 border-white/20 shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Criar Novo Tipo de Evento</h3>
                  <Input
                    type="text"
                    placeholder="Nome do tipo (ex: Cultura, Esporte)"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    disabled={creatingType}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateNewType()
                      }
                    }}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-yellow-500 focus:ring-yellow-500 [color-scheme:dark]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateNewType}
                      disabled={creatingType || !newTypeName.trim()}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700"
                    >
                      {creatingType ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        'Criar'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewTypeDialog(false)
                        setNewTypeName('')
                        setError('')
                      }}
                      disabled={creatingType}
                      className="border-white/30 text-white hover:bg-white/20 bg-white/10"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <FormField label="Recompensa">
            <div className="relative">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                placeholder="Ex: Certificado digital, Desconto de 10%, Brinde exclusivo..."
                disabled={loading}
                className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-yellow-500 focus:ring-yellow-500"
              />
            </div>
            <p className="text-xs text-white/70 mt-1">
              Recompensa que será exibida para quem escanear o QR Code deste evento
            </p>
          </FormField>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="w-full sm:w-auto border-white/30 text-white hover:bg-white/20 bg-white/10"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700">
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