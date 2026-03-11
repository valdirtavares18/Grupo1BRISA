import { organizationService } from '@/services/organization.service'
import { eventService } from '@/services/event.service'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/atoms'
import { Logo } from '@/components/atoms'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Eye, Users, QrCode } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

export default async function OrganizationEventsPage({ params }: PageProps) {
  const organization = await organizationService.getOrganizationBySlug(params.slug)

  if (!organization || !organization.isActive) {
    notFound()
  }

  const events = await eventService.getEventsByOrganization(organization.id)

  const now = new Date()
  const activeEvents = events.filter(
    (e: any) => new Date(e.startDate) <= now && new Date(e.endDate) >= now && e.manuallyEnded !== 1
  )
  const upcomingEvents = events.filter((e: any) => new Date(e.startDate) > now)
  const pastEvents = events.filter(
    (e: any) => new Date(e.endDate) < now || e.manuallyEnded === 1
  )

  // Aplicar tema da organização
  const primaryColor = organization.theme?.primaryColor || '#001F3F'
  const logoUrl = organization.theme?.logoUrl
  const backgroundStyle = organization.theme?.backgroundStyle

  const themeStyle = backgroundStyle
    ? { background: backgroundStyle }
    : { background: primaryColor }

  return (
    <div className="min-h-screen" style={themeStyle}>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          {logoUrl ? (
            <div className="mb-6">
              <img
                src={logoUrl}
                alt={organization.name}
                className="h-16 mx-auto object-contain"
              />
            </div>
          ) : (
            <div className="mb-6 flex justify-center">
              <Logo className="scale-125 opacity-90" />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
            Eventos - {organization.name}
          </h1>
          <p className="text-white text-base sm:text-lg">
            Confira todos os nossos eventos
          </p>
        </div>

        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Eventos em Andamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map((event: any) => {
                const startDate = new Date(event.startDate)
                const endDate = new Date(event.endDate)
                return (
                  <Card
                    key={event.id}
                    className="border-0 shadow-md bg-white overflow-hidden transition"
                  >
                    <div className="h-2 bg-green-500" />
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2 flex-1">{event.title}</CardTitle>
                        <Badge className="bg-green-500 hover:bg-green-600 flex-shrink-0">
                          Ativo
                        </Badge>
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
                          {startDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} às{' '}
                          {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Até {endDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} às{' '}
                          {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                        </span>
                      </div>

                      {event.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {event.address}
                            {event.city && `, ${event.city}`}
                            {event.state && ` - ${event.state}`}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{event._count?.presenceLogs || 0} presenças</span>
                        </div>
                        {event.eventType && (
                          <Badge variant="secondary" className="text-xs">
                            {event.eventType}
                          </Badge>
                        )}
                      </div>

                      <Link href={`/event/${event.qrCodeToken}`} className="block">
                        <Button className="w-full" size="sm">
                          <QrCode className="w-4 h-4 mr-2" />
                          Registrar Presença
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Próximos Eventos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event: any) => {
                const startDate = new Date(event.startDate)
                return (
                  <Card
                    key={event.id}
                    className="border-0 shadow-md bg-white overflow-hidden transition"
                  >
                    <div className="h-2 bg-mustard" />
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2 flex-1">{event.title}</CardTitle>
                        <Badge className="bg-mustard text-ink flex-shrink-0">
                          Próximo
                        </Badge>
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
                          {startDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} às{' '}
                          {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                        </span>
                      </div>

                      {event.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {event.address}
                            {event.city && `, ${event.city}`}
                            {event.state && ` - ${event.state}`}
                          </span>
                        </div>
                      )}

                      {event.eventType && (
                        <Badge variant="secondary" className="text-xs w-fit">
                          {event.eventType}
                        </Badge>
                      )}

                      <Link href={`/event/${event.qrCodeToken}`} className="block">
                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Eventos Anteriores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.slice(0, 9).map((event: any) => {
                const startDate = new Date(event.startDate)
                return (
                  <Card
                    key={event.id}
                    className="border-0 shadow-md bg-white overflow-hidden transition opacity-75"
                  >
                    <div className="h-2 bg-gray-500" />
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2 flex-1">{event.title}</CardTitle>
                        <Badge variant="secondary" className="flex-shrink-0">
                          Encerrado
                        </Badge>
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
                        <span>{startDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{event._count?.presenceLogs || 0} presenças</span>
                        </div>
                        {event.eventType && (
                          <Badge variant="secondary" className="text-xs">
                            {event.eventType}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* No Events Message */}
        {events.length === 0 && (
          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum evento disponível</h3>
              <p className="text-muted-foreground">
                A organização ainda não cadastrou nenhum evento.
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}

