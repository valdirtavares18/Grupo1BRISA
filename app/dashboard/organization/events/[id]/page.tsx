import { eventService } from '@/services/event.service'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/organisms/navbar'
import { QRCodeViewer } from '@/components/organisms/qr-code-viewer'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import Link from 'next/link'
import { Calendar, Clock, Users, QrCode, Eye, Download, ArrowLeft } from 'lucide-react'

interface PageProps {
  params: { id: string }
}

export default async function EventDetailsPage({ params }: PageProps) {
  const event = await eventService.getEventById(params.id)

  if (!event) {
    notFound()
  }

  const qrCodeUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/event/${event.qrCodeToken}`

  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const now = new Date()
  const isActive = startDate <= now && endDate >= now
  const isUpcoming = startDate > now

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar userRole="ADMIN ORGANIZAÇÃO" />
      
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Link 
          href="/dashboard/organization"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para eventos</span>
        </Link>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h1 className="text-3xl lg:text-4xl font-bold">{event.title}</h1>
            {isActive && (
              <Badge className="bg-green-500 hover:bg-green-600 w-fit">
                <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                Evento Ativo
              </Badge>
            )}
            {isUpcoming && (
              <Badge className="bg-blue-500 hover:bg-blue-600 w-fit">
                Próximo Evento
              </Badge>
            )}
            {!isActive && !isUpcoming && (
              <Badge variant="secondary" className="w-fit">
                Evento Encerrado
              </Badge>
            )}
          </div>
          {event.description && (
            <p className="text-muted-foreground">{event.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Event Info */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informações do Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Data de Início</p>
                      <p className="text-blue-700 mt-1">
                        {startDate.toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900">Data de Término</p>
                      <p className="text-purple-700 mt-1">
                        {endDate.toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-purple-600 mt-1">
                        {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">Presenças Registradas</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">
                          {event._count?.presenceLogs || 0}
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/organization/events/${event.id}/presences`}>
                      <div className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 text-sm font-semibold">
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Ver Presenças</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code do Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QRCodeViewer url={qrCodeUrl} eventTitle={event.title} />
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs text-blue-900">
                    <strong>Dica:</strong> Baixe e imprima este QR Code para distribuir no evento. 
                    Ao escanear, os participantes registram presença automaticamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}