import { eventService } from '@/services/event.service'
import { presenceService } from '@/services/presence.service'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/atoms'
import Link from 'next/link'

interface PageProps {
  params: { token: string }
}

export default async function EventPage({ params }: PageProps) {
  const event = await eventService.getEventByQrToken(params.token)

  if (!event) {
    notFound()
  }

  const headersList = headers()
  const ipAddress = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  const initialScanToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  await presenceService.logPresence({
    eventId: event.id,
    endUserId: undefined,
    ipAddress,
    userAgent,
    initialScanToken,
  })

  const isPastEvent = new Date(event.endDate) < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-3xl">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.description && (
              <p className="text-muted-foreground">{event.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Data de Início</p>
                <p className="text-muted-foreground">
                  {new Date(event.startDate).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="font-semibold">Data de Término</p>
                <p className="text-muted-foreground">
                  {new Date(event.endDate).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              {!isPastEvent && (
                <Link href="/auth/login" className="flex-1">
                  <Button className="w-full">Fazer Login para Registro Completo</Button>
                </Link>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              Organizado por {event.organization.name}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
