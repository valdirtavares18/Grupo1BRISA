'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { Navbar } from '@/components/organisms/navbar'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, FileText, AlertCircle, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  })

  useEffect(() => {
    fetchEvent()
  }, [])

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${params.id}`, {
        credentials: 'include'
      })

      if (res.ok) {
        const event = await res.json()
        const start = new Date(event.startDate)
        const end = new Date(event.endDate)

        setFormData({
          title: event.title,
          description: event.description || '',
          startDate: start.toISOString().split('T')[0],
          startTime: start.toTimeString().slice(0, 5),
          endDate: end.toISOString().split('T')[0],
          endTime: end.toTimeString().slice(0, 5),
        })
      }
    } catch (err) {
      console.error('Erro ao carregar evento:', err)
    } finally {
      setLoadingData(false)
    }
  }

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

      const res = await fetch(`/api/events/${params.id}`, {
        method: 'PUT',
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
        throw new Error(data.error || 'Erro ao atualizar evento')
      }

      router.push(`/dashboard/organization/events/${params.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
        <Navbar userRole="ADMIN ORGANIZAÇÃO" />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      <Navbar userRole="ADMIN ORGANIZAÇÃO" />
      
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-4xl">
        <Link 
          href={`/dashboard/organization/events/${params.id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o evento</span>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Editar Evento</h1>
          <p className="text-muted-foreground">Atualize as informações do evento</p>
        </div>

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
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}