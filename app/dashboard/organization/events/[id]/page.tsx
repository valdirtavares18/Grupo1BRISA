import { eventService } from '@/services/event.service'
import { notFound } from 'next/navigation'
import { QRCodeViewer } from '@/components/organisms/qr-code-viewer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import Link from 'next/link'

interface PageProps {
  params: { id: string }
}

export default async function EventDetailsPage({ params }: PageProps) {
  const event = await eventService.getEventById(params.id)

  if (!event) {
    notFound()
  }

  const qrCodeUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/event/${event.qrCodeToken}`

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title={event.title}
        description={event.description || 'Detalhes do evento'}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold">Data de Início</p>
              <p className="text-muted-foreground">
                {new Date(event.startDate).toLocaleString('pt-BR')}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">Data de Término</p>
              <p className="text-muted-foreground">
                {new Date(event.endDate).toLocaleString('pt-BR')}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">Presenças Registradas</p>
              <p className="text-muted-foreground">
                {event._count?.presenceLogs || 0} registro(s)
              </p>
            </div>

            <Link href={`/dashboard/organization/events/${event.id}/presences`}>
              <Badge variant="outline" className="cursor-pointer">
                Ver Presenças
              </Badge>
            </Link>
          </CardContent>
        </Card>

        <QRCodeViewer url={qrCodeUrl} eventTitle={event.title} />
      </div>
    </div>
  )
}
