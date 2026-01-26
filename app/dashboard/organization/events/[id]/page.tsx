import { eventService } from '@/services/event.service'
import { notFound } from 'next/navigation'
import { QRCodeViewer } from '@/components/organisms/qr-code-viewer'
import { CloseEventButton } from '@/components/organisms/close-event-button'
import { DuplicateEventButton } from '@/components/organisms/duplicate-event-button'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import Link from 'next/link'
import { Calendar, Clock, Users, QrCode, Eye, Download, ArrowLeft, Edit, Gift } from 'lucide-react'
import { Button } from '@/components/atoms'
import { query } from '@/lib/db-sqlite'
import { randomUUID } from 'crypto'
import dynamic from 'next/dynamic'

const PresenceModalClient = dynamic(() => import('./presence-modal-client').then(mod => ({ default: mod.PresenceModalClient })), { ssr: false })

interface PageProps {
  params: { id: string }
}

export default async function EventDetailsPage({ params }: PageProps) {
  const event = await eventService.getEventById(params.id)

  if (!event) {
    notFound()
  }

  // Garantir que qrCodeToken existe, caso contrário gerar um novo
  let qrCodeToken = event.qrCodeToken
  if (!qrCodeToken || qrCodeToken.trim() === '') {
    qrCodeToken = randomUUID()
    // Atualizar no banco
    await query(
      'UPDATE "Event" SET "qrCodeToken" = ? WHERE id = ?',
      [qrCodeToken, event.id]
    )
  }

  // Construir URL absoluta
  const baseUrl = process.env.NEXTAUTH_URL || 
                  process.env.NEXT_PUBLIC_APP_URL || 
                  'http://localhost:3000'
  const qrCodeUrl = `${baseUrl}/event/${qrCodeToken}`

  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const now = new Date()
  const isActive = startDate <= now && endDate >= now
  const isUpcoming = startDate > now

  return (
    <div className="p-4 lg:p-6 lg:py-8">
        <Link 
          href="/dashboard/organization"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para eventos</span>
        </Link>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">{event.title}</h1>
            {isActive && (
              <Badge className="bg-slate-500 hover:bg-slate-600 w-fit text-white">
                Evento Ativo
              </Badge>
            )}
            {isUpcoming && (
              <Badge className="bg-slate-500 hover:bg-slate-600 w-fit text-white">
                Próximo Evento
              </Badge>
            )}
            {!isActive && !isUpcoming && (
              <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-700 border border-slate-200">
                Evento Encerrado
              </Badge>
            )}
          </div>
          {event.description && (
            <p className="text-white/80">{event.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Event Info */}
          <div className="space-y-6">
            <Card className="hover:bg-white/15 hover:shadow-2xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5" />
                  Informações do Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-white/10 border border-white/20">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-white/60 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Data de Início</p>
                      <p className="text-white/90 mt-1">
                        {startDate.toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-white/80 mt-1">
                        {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/10 border border-white/20">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-white/60 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Data de Término</p>
                      <p className="text-white/90 mt-1">
                        {endDate.toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-white/80 mt-1">
                        {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/10 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm font-semibold text-white">Presenças Registradas</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {event._count?.presenceLogs || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/organization/events/${event.id}/presences`}>
                        <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 transition flex items-center gap-2 text-sm font-semibold">
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Ver Presenças</span>
                        </div>
                      </Link>
                      <PresenceModalClient eventId={event.id} />
                    </div>
                  </div>
                </div>

                {event.reward && (
                  <div className="p-4 rounded-lg bg-white/10 border border-white/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">Recompensa</p>
                        <p className="text-white/90">{event.reward}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={`/dashboard/organization/events/${event.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Evento
                      </Button>
                    </Link>
                    <a href={`/api/events/${event.id}/export`} className="flex-1">
                      <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar CSV
                      </Button>
                    </a>
                  </div>
                  <DuplicateEventButton eventId={event.id} />
                  <CloseEventButton 
                    eventId={event.id} 
                    eventTitle={event.title}
                    isClosed={event.manuallyEnded === 1}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code */}
          <div className="space-y-6">
            <Card className="hover:bg-white/15 hover:shadow-2xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <QrCode className="w-5 h-5" />
                  QR Code do Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QRCodeViewer url={qrCodeUrl} eventTitle={event.title} />
                <div className="mt-4 p-3 rounded-lg bg-white/10 border border-white/20">
                  <p className="text-xs text-white/90">
                    <strong>Dica:</strong> Baixe e imprima este QR Code para distribuir no evento. 
                    Ao escanear, os participantes registram presença automaticamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  )
}