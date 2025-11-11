import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { eventService } from '@/services/event.service'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function OrganizationDashboardPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/auth/login')
  }

  const payload = verifyToken(token)

  if (!payload || payload.role !== 'ORG_ADMIN' || !payload.organizationId) {
    redirect('/auth/login')
  }

  const events = await eventService.getEventsByOrganization(payload.organizationId)

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Dashboard Organização"
        description="Gerencie seus eventos"
        action={
          <Link
            href="/dashboard/organization/events/new"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Novo Evento
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {new Date(event.startDate).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Presenças: {event._count?.presenceLogs || 0}
                </p>
                <Link
                  href={`/dashboard/organization/events/${event.id}`}
                  className="text-primary hover:underline"
                >
                  Ver detalhes →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
