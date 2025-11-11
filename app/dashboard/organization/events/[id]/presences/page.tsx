import { eventService } from '@/services/event.service'
import { presenceService } from '@/services/presence.service'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { User, Calendar } from 'lucide-react'

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
    <div className="container mx-auto p-6">
      <PageHeader
        title={`Presenças - ${event.title}`}
        description={`${stats.total} registro(s) de presença`}
      />

      <div className="grid gap-4 mb-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Identificados</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.identified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Anônimos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.anonymous}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Presença</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {presences.map((presence) => (
              <div
                key={presence.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    {presence.endUser?.fullName || 'Anônimo'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(presence.accessTimestamp).toLocaleString('pt-BR')}
                  </p>
                  {presence.endUser && (
                    <p className="text-xs text-muted-foreground">
                      CPF: {presence.endUser.cpf}
                    </p>
                  )}
                </div>
                <Badge variant={presence.endUser ? 'default' : 'secondary'}>
                  {presence.endUser ? 'Identificado' : 'Anônimo'}
                </Badge>
              </div>
            ))}

            {presences.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma presença registrada ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
