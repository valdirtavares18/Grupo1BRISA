'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/atoms'
import { Logo } from '@/components/atoms'
import { Search, MapPin, Calendar, Filter, X, Users, Building2 } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  eventType?: string
  organizationName: string
  organizationSlug: string
  distance?: number
  _count?: {
    presenceLogs: number
  }
}

export default function EventSearchPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    zipCode: '',
    eventType: '',
  })
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchEventTypes()
    searchEvents()
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

  const searchEvents = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (filters.city) params.append('city', filters.city)
      if (filters.state) params.append('state', filters.state)
      if (filters.zipCode) params.append('zipCode', filters.zipCode.replace(/\D/g, ''))
      if (filters.eventType) params.append('eventType', filters.eventType)

      const res = await fetch(`/api/events/search?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setEvents(data)
      } else {
        setError(data.error || 'Erro ao buscar eventos')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar eventos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchEvents()
  }

  const clearFilters = () => {
    setFilters({
      city: '',
      state: '',
      zipCode: '',
      eventType: '',
    })
  }

  useEffect(() => {
    if (filters.city || filters.state || filters.zipCode || filters.eventType) {
      searchEvents()
    }
  }, [filters])

  const formatZipCode = (zipCode: string) => {
    const clean = zipCode.replace(/\D/g, '')
    if (clean.length <= 5) return clean
    return `${clean.substring(0, 5)}-${clean.substring(5, 8)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="scale-110" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Buscar Eventos</h1>
          <p className="text-muted-foreground">
            Encontre eventos próximos a você
          </p>
        </div>

        {/* Search Form */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por cidade, estado ou CEP..."
                    value={filters.city || filters.state || filters.zipCode}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/\d/.test(value) && value.length <= 9) {
                        setFilters({ ...filters, zipCode: value, city: '', state: '' })
                      } else {
                        setFilters({ ...filters, city: value, zipCode: '' })
                      }
                    }}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>

                {(filters.city || filters.state || filters.zipCode || filters.eventType) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                )}
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Estado</label>
                    <Input
                      type="text"
                      placeholder="Ex: SP, RJ"
                      value={filters.state}
                      onChange={(e) => setFilters({ ...filters, state: e.target.value.toUpperCase() })}
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">CEP</label>
                    <Input
                      type="text"
                      placeholder="00000-000"
                      value={formatZipCode(filters.zipCode)}
                      onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
                      maxLength={9}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo de Evento</label>
                    <select
                      value={filters.eventType}
                      onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="">Todos os tipos</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Buscando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros de busca
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const startDate = new Date(event.startDate)
              const now = new Date()
              const isUpcoming = startDate > now
              const isActive = new Date(event.startDate) <= now && new Date(event.endDate) >= now

              return (
                <Card key={event.id} className="border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden">
                  {isActive && (
                    <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                  )}
                  {isUpcoming && (
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg group-hover:text-primary transition line-clamp-2 flex-1">
                        {event.title}
                      </CardTitle>
                      {isActive && (
                        <Badge className="bg-green-500 hover:bg-green-600 ml-2 flex-shrink-0">
                          Ativo
                        </Badge>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {startDate.toLocaleDateString('pt-BR')} às{' '}
                        {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {event.city && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {event.address && `${event.address}, `}
                          {event.city}
                          {event.state && `, ${event.state}`}
                        </span>
                      </div>
                    )}

                    {event.distance !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        📍 {event.distance.toFixed(1)} km de distância
                      </div>
                    )}

                    {event.eventType && (
                      <Badge variant="secondary" className="text-xs">
                        {event.eventType}
                      </Badge>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span className="truncate">{event.organizationName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{event._count?.presenceLogs || 0}</span>
                      </div>
                    </div>

                    <Link href={`/${event.organizationSlug}/events`} className="block">
                      <Button variant="outline" className="w-full" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

