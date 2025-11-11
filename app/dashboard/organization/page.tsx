import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { Navbar } from '@/components/organisms/navbar'
import { eventService } from '@/services/event.service'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Plus, Users, MapPin, Clock, Eye, TrendingUp } from 'lucide-react'

export default async function OrganizationDashboardPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = verifyToken(token)

  if (!payload || payload.role !== 'ORG_ADMIN' || !payload.organizationId) {
    redirect('/login')
  }

  const events = await eventService.getEventsByOrganization(payload.organizationId)
  
  const now = new Date()
  const upcomingEvents = events.filter(e => new Date(e.startDate) > now)
  const pastEvents = events.filter(e => new Date(e.endDate) < now)
  const activeEvents = events.filter(e => new Date(e.startDate) <= now && new Date(e.endDate) >= now)

  const totalPresences = events.reduce((sum, event) => sum + (event._count?.presenceLogs || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      <Navbar userRole="ADMIN ORGANIZAÇÃO" userName={payload.email} />
      
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <PageHeader
          title="Seus Eventos"
          description="Gerencie e acompanhe todos os seus eventos"
          action={
            <Link href="/dashboard/organization/events/new">
              <div className="bg-primary text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:bg-primary/90 transition shadow-lg hover:shadow-xl flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Novo Evento</span>
                <span className="sm:hidden">Novo</span>
              </div>
            </Link>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs lg:text-sm font-medium text-muted-foreground">Total</p>
                  <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold">{events.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs lg:text-sm font-medium text-muted-foreground">Ativos</p>
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-green-600">{activeEvents.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs lg:text-sm font-medium text-muted-foreground">Próximos</p>
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-blue-600">{upcomingEvents.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs lg:text-sm font-medium text-muted-foreground">Presenças</p>
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-purple-600">{totalPresences}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 lg:p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum evento cadastrado</h3>
              <p className="text-muted-foreground mb-6">
                Crie seu primeiro evento e comece a captar dados do seu público
              </p>
              <Link href="/dashboard/organization/events/new">
                <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition">
                  <Plus className="w-5 h-5" />
                  Criar Primeiro Evento
                </div>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {events.map((event) => {
              const startDate = new Date(event.startDate)
              const endDate = new Date(event.endDate)
              const isActive = startDate <= now && endDate >= now
              const isUpcoming = startDate > now

              return (
                <Card key={event.id} className="border-0 shadow-lg hover:shadow-xl transition-all group overflow-hidden">
                  {isActive && (
                    <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                  )}
                  {isUpcoming && (
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                  )}
                  {!isActive && !isUpcoming && (
                    <div className="h-1 bg-gradient-to-r from-gray-400 to-gray-500" />
                  )}
                  
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg group-hover:text-primary transition line-clamp-2">
                        {event.title}
                      </CardTitle>
                      {isActive && (
                        <span className="flex-shrink-0 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          Ativo
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="flex-shrink-0 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          Próximo
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(event.startDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>{event._count?.presenceLogs || 0} presença(s)</span>
                    </div>

                    <Link
                      href={`/dashboard/organization/events/${event.id}`}
                      className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
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