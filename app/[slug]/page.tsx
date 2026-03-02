import { organizationService } from '@/services/organization.service'
import { eventService } from '@/services/event.service'
import { feedService } from '@/services/feed.service'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/atoms'
import { Logo } from '@/components/atoms'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ArrowRight, Eye, Users, MessageSquare, QrCode } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

export default async function OrganizationPage({ params }: PageProps) {
  const organization = await organizationService.getOrganizationBySlug(params.slug)

  if (!organization || !organization.isActive) {
    notFound()
  }

  const [events, feeds] = await Promise.all([
    eventService.getEventsByOrganization(organization.id),
    feedService.getFeedByOrganization(organization.id, true),
  ])

  const now = new Date()
  const activeEvents = events.filter(
    (e: any) => new Date(e.startDate) <= now && new Date(e.endDate) >= now && e.manuallyEnded !== 1
  )
  const upcomingEvents = events.filter(
    (e: any) => new Date(e.startDate) > now && e.manuallyEnded !== 1
  )

  // Aplicar tema da organização
  const primaryColor = organization.theme?.primaryColor || '#001F3F'
  const logoUrl = organization.theme?.logoUrl
  const backgroundStyle = organization.theme?.backgroundStyle

  const themeStyle = backgroundStyle
    ? { background: backgroundStyle }
    : {
      background: `linear-gradient(to-br, ${primaryColor}, ${primaryColor}dd, ${primaryColor})`,
    }

  return (
    <div className="min-h-screen" style={themeStyle}>
      {/* Header */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="text-center mb-12">
          {logoUrl ? (
            <div className="mb-6">
              <img
                src={logoUrl}
                alt={organization.name}
                className="h-20 sm:h-24 mx-auto object-contain drop-shadow-lg"
              />
            </div>
          ) : (
            <div className="mb-6 flex justify-center">
              <Logo className="scale-150 opacity-90" />
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {organization.name}
          </h1>
          <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto">
            Bem-vindo à nossa página oficial. Acompanhe nossos eventos e novidades.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link
            href={`/${params.slug}/events`}
            className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition shadow-lg flex items-center gap-2 font-semibold"
          >
            <Calendar className="w-5 h-5" />
            Eventos
          </Link>
          <Link
            href={`/${params.slug}/feed`}
            className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition shadow-lg flex items-center gap-2 font-semibold"
          >
            <MessageSquare className="w-5 h-5" />
            Feed
          </Link>
        </div>

        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
              Eventos em Andamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map((event: any) => {
                const startDate = new Date(event.startDate)
                return (
                  <Card
                    key={event.id}
                    className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden hover:shadow-3xl transition"
                  >
                    <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
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
                          {startDate.toLocaleDateString('pt-BR')} às{' '}
                          {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
              Próximos Eventos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.slice(0, 6).map((event: any) => {
                const startDate = new Date(event.startDate)
                return (
                  <Card
                    key={event.id}
                    className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden hover:shadow-3xl transition"
                  >
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2 flex-1">{event.title}</CardTitle>
                        <Badge className="bg-blue-500 hover:bg-blue-600 flex-shrink-0">
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
                          {startDate.toLocaleDateString('pt-BR')} às{' '}
                          {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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

                      <Link href={`/${params.slug}/events`} className="block">
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

            {upcomingEvents.length > 6 && (
              <div className="text-center mt-6">
                <Link href={`/${params.slug}/events`}>
                  <Button variant="outline" size="lg" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/30">
                    Ver Todos os Eventos
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Recent Feed Posts */}
        {feeds.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Últimas Publicações</h2>
              <Link
                href={`/${params.slug}/feed`}
                className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition text-sm font-semibold flex items-center gap-2"
              >
                Ver Todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feeds.slice(0, 4).map((feed: any) => (
                <Card
                  key={feed.id}
                  className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden hover:shadow-3xl transition"
                >
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{feed.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(feed.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {feed.imageUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img
                          src={feed.imageUrl}
                          alt={feed.title}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-3">{feed.content}</p>
                    <Link href={`/${params.slug}/feed`} className="inline-block mt-4">
                      <Button variant="ghost" size="sm">
                        Ler Mais
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Events Message */}
        {events.length === 0 && feeds.length === 0 && (
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo disponível</h3>
              <p className="text-muted-foreground">
                A organização ainda não publicou eventos ou conteúdo.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/80 text-sm mb-4">
            © 2025 {organization.name}. Todos os direitos reservados.
          </p>
          <Link
            href="/events/search"
            className="inline-block px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition text-sm font-semibold"
          >
            Buscar Eventos
          </Link>
        </div>
      </div>
    </div>
  )
}

