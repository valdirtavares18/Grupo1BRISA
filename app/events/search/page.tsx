'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/atoms'
import { PublicLayout } from '@/components/organisms/public-layout'
import { Search, MapPin, Calendar, Filter, X, Users, Building2 } from 'lucide-react'
import { CityAutocomplete } from '@/components/molecules/city-autocomplete'
import Link from 'next/link'

interface Event {
  id: string
  qrCodeToken: string
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



  const fetchEventTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/events/types')
      if (res.ok) {
        const data = await res.json()
        setEventTypes(data)
      }
    } catch (err) {
      console.error('Erro ao buscar tipos de eventos:', err)
    }
  }, [])

  const searchEvents = useCallback(async () => {
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
  }, [filters])

  useEffect(() => {
    fetchEventTypes()
    searchEvents()
  }, [fetchEventTypes, searchEvents])

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



  const formatZipCode = (zipCode: string) => {
    const clean = zipCode.replace(/\D/g, '')
    if (clean.length <= 5) return clean
    return `${clean.substring(0, 5)}-${clean.substring(5, 8)}`
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white">
            Buscar Eventos
          </h1>
          <p className="text-xl sm:text-2xl text-[#C8CDD5] max-w-2xl mx-auto">
            Encontre eventos próximos a você e faça parte da experiência
          </p>
        </div>

        {/* Search Form */}
        <Card className="border-0 shadow-md bg-navy-light mb-8 border border-navy-border">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <CityAutocomplete
                    value={filters.city}
                    onChange={(city: string, state: string) => setFilters({ ...filters, city, state, zipCode: '' })}
                    className="h-14 text-lg bg-navy border-navy-border text-white placeholder:text-[#8B92A0] focus:border-mustard/50 focus:ring-mustard/20"
                  />
                </div>
                <div className="lg:w-48 relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#8B92A0]" />
                    <Input
                      type="text"
                      placeholder="CEP"
                      value={filters.zipCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 8) {
                          setFilters({ ...filters, zipCode: value, city: '', state: '' })
                        }
                      }}
                      className="pl-12 h-14 text-lg bg-navy border-navy-border text-white placeholder:text-[#8B92A0] focus:border-mustard/50 focus:ring-mustard/20"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="h-14 px-8 bg-mustard text-ink hover:bg-mustard-dark text-lg shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-navy-border border-t-white rounded-full animate-spin mr-2" />
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
              <div className="flex flex-wrap gap-3 items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-navy-border bg-transparent text-white hover:bg-navy-light hover:text-white"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros
                </Button>

                {(filters.city || filters.state || filters.zipCode || filters.eventType) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={clearFilters}
                    className="text-[#C8CDD5] hover:text-white hover:bg-navy-light"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Limpar Filtros
                  </Button>
                )}
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-navy-border">
                  <div>
                    <label className="text-base font-medium mb-2 block text-white">Estado</label>
                    <Input
                      type="text"
                      placeholder="Ex: SP, RJ"
                      value={filters.state}
                      onChange={(e) => setFilters({ ...filters, state: e.target.value.toUpperCase() })}
                      maxLength={2}
                      className="bg-navy border-navy-border text-white placeholder:text-[#8B92A0] focus:border-mustard/50"
                    />
                  </div>

                  <div>
                    <label className="text-base font-medium mb-2 block text-white">CEP</label>
                    <Input
                      type="text"
                      placeholder="00000-000"
                      value={formatZipCode(filters.zipCode)}
                      onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
                      maxLength={9}
                      className="bg-navy border-navy-border text-white placeholder:text-[#8B92A0] focus:border-mustard/50"
                    />
                  </div>

                  <div>
                    <label className="text-base font-medium mb-2 block text-white">Tipo de Evento</label>
                    <select
                      value={filters.eventType}
                      onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-navy-border bg-navy text-white text-base focus:border-mustard/50 focus:outline-none focus:ring-2 focus:ring-mustard/20"
                    >
                      <option value="" className="bg-slate-900">Todos os tipos</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type} className="bg-slate-900">
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
          <div className="mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-400/30 text-red-300">
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-navy-border border-t-mustard rounded-full animate-spin mx-auto mb-6" />
            <p className="text-xl text-[#8B92A0]">Buscando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <Card className="border-0 shadow-md bg-navy-light border border-navy-border">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-[#8B92A0]" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Nenhum evento encontrado</h3>
              <p className="text-lg text-[#8B92A0]">
                Tente ajustar os filtros de busca ou procure por outras localizações
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {events.length} {events.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
              </h2>
              <p className="text-[#8B92A0] text-lg">
                Explore os eventos disponíveis e encontre o que mais combina com você
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {events.map((event) => {
                const startDate = new Date(event.startDate)
                const now = new Date()
                const isUpcoming = startDate > now
                const isActive = new Date(event.startDate) <= now && new Date(event.endDate) >= now

                return (
                  <Card
                    key={event.id}
                    className="border-0 shadow-md bg-navy-light hover:bg-navy-light border border-navy-border hover:border-mustard/20 transition-all duration-300 group overflow-hidden"
                  >
                    {isActive && (
                      <div className="h-1.5 bg-green-500" />
                    )}
                    {isUpcoming && (
                      <div className="h-1.5 bg-mustard" />
                    )}

                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <CardTitle className="text-xl font-bold group-hover:text-mustard transition line-clamp-2 flex-1 text-white">
                          {event.title}
                        </CardTitle>
                        {isActive && (
                          <Badge className="bg-green-500 hover:bg-green-600 ml-3 flex-shrink-0 text-white border-0">
                            Ativo
                          </Badge>
                        )}
                        {isUpcoming && !isActive && (
                          <Badge className="bg-mustard hover:bg-mustard-dark ml-3 flex-shrink-0 text-ink border-0">
                            Em breve
                          </Badge>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-base text-[#8B92A0] line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 text-base text-[#C8CDD5]">
                        <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-mustard" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </div>
                          <div className="text-sm text-[#8B92A0]">
                            às {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {event.city && (
                        <div className="flex items-start gap-3 text-base text-[#C8CDD5]">
                          <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-mustard" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block truncate">
                              {event.address && `${event.address}, `}
                              {event.city}
                              {event.state && `, ${event.state}`}
                            </span>
                            {event.distance !== undefined && (
                              <span className="text-sm text-[#8B92A0]">
                                📍 {event.distance.toFixed(1)} km de distância
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {event.eventType && (
                        <div>
                          <Badge variant="secondary" className="bg-mustard/10 text-mustard border-mustard/20">
                            {event.eventType}
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-navy-border">
                        <div className="flex items-center gap-2 text-sm text-[#8B92A0]">
                          <Building2 className="w-4 h-4" />
                          <Link
                            href={`/${event.organizationSlug}`}
                            className="truncate max-w-[150px] hover:text-mustard transition-colors"
                          >
                            {event.organizationName}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#8B92A0]">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{event._count?.presenceLogs || 0}</span>
                        </div>
                      </div>

                      <Link href={`/event/${event.qrCodeToken}`} className="block pt-2">
                        <Button
                          variant="outline"
                          className="w-full border-navy-border bg-transparent text-white hover:bg-mustard/10 hover:border-mustard/20 hover:text-mustard"
                          size="lg"
                        >
                          Ver Detalhes
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  )
}

