import { eventService } from '@/services/event.service'
import { presenceService } from '@/services/presence.service'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/organisms/navbar'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { User, Calendar, Users, UserCheck, UserX, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: { id: string }
}

export default async function EventPresencesPage({ params }: PageProps) {
  const event = await eventService.getEventById(params.id)

  if (!event) {
    notFound()
  }

  const [presences, stats] = await Promise.all([
    presenceService.getPresenceLogsByEvent(params.id),
    presenceService.getPresenceStatsByEvent(params.id),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navbar userRole="ADMIN ORGANIZAÇÃO" />
      
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Link 
          href={`/dashboard/organization/events/${params.id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o evento</span>
        </Link>

        <PageHeader
          title={`Presenças - ${event.title}`}
          description={`${stats.total} registro(s) de presença capturados`}
          action={
            <a href={`/api/events/${params.id}/export`}>
              <div className="bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:bg-green-700 transition shadow-lg hover:shadow-xl flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                <span className="hidden sm:inline">Exportar CSV</span>
                <span className="sm:hidden">CSV</span>
              </div>
            </a>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total de Acessos</p>
                  <p className="text-3xl lg:text-4xl font-bold text-primary">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Identificados</p>
                  <p className="text-3xl lg:text-4xl font-bold text-green-600">{stats.identified}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Anônimos</p>
                  <p className="text-3xl lg:text-4xl font-bold text-orange-600">{stats.anonymous}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Presences List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Registros de Presença
            </CardTitle>
          </CardHeader>
          <CardContent>
            {presences.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Nenhuma presença registrada ainda
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {presences.map((presence) => (
                  <div
                    key={presence.id}
                    className="p-4 rounded-xl border-2 border-gray-100 hover:border-primary/30 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          presence.endUser 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base">
                            {presence.endUser?.fullName || 'Participante Anônimo'}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(presence.accessTimestamp).toLocaleString('pt-BR')}
                            </div>
                            {presence.endUser && (
                              <span className="text-xs text-muted-foreground">
                                • CPF: {presence.endUser.cpf}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={presence.endUser ? 'default' : 'secondary'}
                        className="w-fit"
                      >
                        {presence.endUser ? (
                          <><UserCheck className="w-3 h-3 mr-1" /> Identificado</>
                        ) : (
                          <><UserX className="w-3 h-3 mr-1" /> Anônimo</>
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}