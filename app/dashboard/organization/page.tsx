import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { eventService } from '@/services/event.service'
import { endUserService } from '@/services/end-user.service'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Plus, Users, MapPin, Clock, Eye, TrendingUp, UserCheck, MessageSquare } from 'lucide-react'

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

  const [events, userStats] = await Promise.all([
    eventService.getEventsByOrganization(payload.organizationId),
    endUserService.getEndUserStatsByOrganization(payload.organizationId),
  ])

  const now = new Date()
  const upcomingEvents = events.filter((e: any) => new Date(e.startDate) > now)
  const pastEvents = events.filter((e: any) => new Date(e.endDate) < now)
  const activeEvents = events.filter((e: any) => new Date(e.startDate) <= now && new Date(e.endDate) >= now)

  const totalPresences = events.reduce((sum: number, event: any) => sum + (event._count?.presenceLogs || 0), 0)

  return (
    <div className="p-4 lg:p-6 lg:py-8">
      <PageHeader
        title="Seus Eventos"
        description="Gerencie e acompanhe todos os seus eventos"
        action={
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/dashboard/organization/feed">
              <div className="border border-navy-border bg-navy-light text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-navy-light transition flex items-center gap-2 font-medium">
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">Feed</span>
              </div>
            </Link>
            <Link href="/dashboard/organization/users">
              <div className="border border-navy-border bg-navy-light text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-navy-light transition flex items-center gap-2 font-medium">
                <UserCheck className="w-5 h-5" />
                <span className="hidden sm:inline">Usuários</span>
              </div>
            </Link>
            <Link href="/dashboard/organization/events/new">
              <div className="bg-mustard text-ink px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition flex items-center gap-2 font-medium">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Novo Evento</span>
                <span className="sm:hidden">Novo</span>
              </div>
            </Link>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
        <Card className="bg-navy-light border-navy-border hover:bg-navy-light hover:scale-[1.02] hover:shadow-md transition-all">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs lg:text-sm font-medium text-[#C8CDD5]">Total</p>
                <div className="w-10 h-10 rounded-lg bg-mustard flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{events.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-light border-navy-border hover:bg-navy-light hover:scale-[1.02] hover:shadow-md transition-all">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs lg:text-sm font-medium text-[#C8CDD5]">Ativos</p>
                <div className="w-10 h-10 rounded-lg bg-mustard flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{activeEvents.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-light border-navy-border hover:bg-navy-light hover:scale-[1.02] hover:shadow-md transition-all">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs lg:text-sm font-medium text-[#C8CDD5]">Próximos</p>
                <div className="w-10 h-10 rounded-lg bg-mustard flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{upcomingEvents.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-light border-navy-border hover:bg-navy-light hover:scale-[1.02] hover:shadow-md transition-all">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs lg:text-sm font-medium text-[#C8CDD5]">Presenças</p>
                <div className="w-10 h-10 rounded-lg bg-mustard flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{totalPresences}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Summary Card */}
      <Card className="mb-8 bg-navy-light border-navy-border hover:bg-navy-light hover:scale-[1.01] hover:shadow-md transition-all">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1 text-white">Usuários Finais</h3>
              <p className="text-sm text-[#C8CDD5]">
                {userStats.total} {userStats.total === 1 ? 'participante único' : 'participantes únicos'} nos seus eventos
              </p>
            </div>
            <Link href="/dashboard/organization/users">
              <div className="inline-flex items-center gap-2 border border-navy-border bg-navy-light text-white px-6 py-3 rounded-lg hover:bg-navy-light transition font-medium">
                <UserCheck className="w-5 h-5" />
                Ver Todos os Usuários
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      {events.length === 0 ? (
        <Card className="bg-navy-light border-navy-border">
          <CardContent className="p-8 lg:p-12 text-center">
            <Calendar className="w-16 h-16 text-[#8B92A0] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Nenhum evento cadastrado</h3>
            <p className="text-[#C8CDD5] mb-6">
              Crie seu primeiro evento e comece a captar dados do seu público
            </p>
            <Link href="/dashboard/organization/events/new">
              <div className="inline-flex items-center gap-2 bg-mustard text-ink px-6 py-3 rounded-lg transition font-medium">
                <Plus className="w-5 h-5" />
                Criar Primeiro Evento
              </div>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {events.map((event: any) => {
            const startDate = new Date(event.startDate)
            const endDate = new Date(event.endDate)
            const isActive = startDate <= now && endDate >= now
            const isUpcoming = startDate > now

            return (
              <Card key={event.id} className="bg-navy-light border-navy-border hover:bg-navy-light hover:scale-[1.02] hover:shadow-md transition-all group overflow-hidden">

                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg text-white line-clamp-2">
                      {event.title}
                    </CardTitle>
                    {isActive && (
                      <span className="flex-shrink-0 px-2 py-1 rounded-full bg-navy-light text-white text-xs font-semibold border border-navy-border">
                        Ativo
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="flex-shrink-0 px-2 py-1 rounded-full bg-navy-light text-[#C8CDD5] text-xs font-semibold border border-navy-border">
                        Próximo
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-[#C8CDD5]">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-[#8B92A0]" />
                    <span className="truncate">
                      {new Date(event.startDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#C8CDD5]">
                    <Users className="w-4 h-4 flex-shrink-0 text-[#8B92A0]" />
                    <span>{event._count?.presenceLogs || 0} presença(s)</span>
                  </div>

                  <Link
                    href={`/dashboard/organization/events/${event.id}`}
                    className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-2 rounded-lg bg-mustard text-ink transition-all font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mustard focus-visible:ring-offset-2"
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
  )
}