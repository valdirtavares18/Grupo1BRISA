import { eventService } from '@/services/event.service'
import { presenceService } from '@/services/presence.service'
import { notFound } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/atoms'
import { RegisterClient } from './register-client'
import { ProfileSelectorClient } from './profile-selector-client'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Building2, UserPlus, CheckCircle2, Info, AlertCircle } from 'lucide-react'
import { verifyToken } from '@/lib/auth'

interface PageProps {
  params: { token: string }
}

export default async function EventPage({ params }: PageProps) {
  const event = await eventService.getEventByQrToken(params.token)

  if (!event) {
    notFound()
  }

  const now = new Date()
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)

  // Adicionar margem de tolerância de 15 minutos para início do evento
  const gracePeriodInMinutes = 15
  const startDateWithGrace = new Date(startDate.getTime() - (gracePeriodInMinutes * 60 * 1000))

  const isPastEvent = endDate < now
  const isBeforeEvent = startDateWithGrace > now
  const isActiveEvent = startDateWithGrace <= now && endDate >= now

  const headersList = headers()
  const ipAddress = headersList.get('x-forwarded-for') ||
    headersList.get('x-real-ip') ||
    'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  // Verificar se usuário está logado
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  let isLoggedIn = false
  let loggedInUserId: string | undefined = undefined
  let hasValidSession = false

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      hasValidSession = true
      if (payload.role === 'END_USER') {
        isLoggedIn = true
        loggedInUserId = payload.userId
      }
    }
  }

  let presenceResult = { success: false, message: '', alreadyRegistered: false, presenceLogId: null as string | null }
  let initialScanToken: string | undefined = undefined

  // Registrar presença se o evento estiver ativo
  if (isActiveEvent) {
    try {
      initialScanToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const presenceLog = await presenceService.logPresence({
        eventId: event.id,
        endUserId: loggedInUserId, // Se logado, vincula ao CPF automaticamente
        ipAddress,
        userAgent,
        initialScanToken,
      })

      presenceResult = {
        success: true,
        message: 'Presença registrada! Escolha seu perfil no evento.',
        alreadyRegistered: false,
        presenceLogId: presenceLog.id
      }
    } catch (error: any) {
      if (error.message.includes('já registrou presença')) {
        presenceResult = { success: false, message: 'Você já está cadastrado neste evento', alreadyRegistered: true, presenceLogId: null }
      } else {
        presenceResult = { success: false, message: error.message, alreadyRegistered: false, presenceLogId: null }
      }
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto py-8 lg:py-16">
        {/* Status Messages */}
        {isBeforeEvent && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 flex items-start gap-3">
            <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-white">
              <p className="font-semibold">Evento ainda não começou</p>
              <p className="text-sm text-white/80 mt-1">
                Volte no horário programado para registrar sua presença.
              </p>
            </div>
          </div>
        )}

        {isPastEvent && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-white">
              <p className="font-semibold">Evento encerrado</p>
              <p className="text-sm text-white/80 mt-1">
                O registro de presença não está mais disponível.
              </p>
            </div>
          </div>
        )}

        {isActiveEvent && presenceResult.success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/20 backdrop-blur-sm border border-green-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-white">
              <p className="font-semibold">Presença registrada!</p>
              <p className="text-sm text-white/80 mt-1">
                {isLoggedIn
                  ? 'Sua presença foi vinculada ao seu CPF.'
                  : 'Sua presença foi capturada. Faça login para vincular ao seu CPF.'}
              </p>
            </div>
          </div>
        )}

        {isActiveEvent && !presenceResult.success && presenceResult.alreadyRegistered && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-white">
              <p className="font-semibold">Você já está cadastrado!</p>
              <p className="text-sm text-white/80 mt-1">
                Sua presença neste evento já foi registrada anteriormente.
              </p>
            </div>
          </div>
        )}

        {isActiveEvent && !presenceResult.success && !presenceResult.alreadyRegistered && presenceResult.message && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-white">
              <p className="font-semibold">Erro ao registrar presença</p>
              <p className="text-sm text-white/80 mt-1">
                {presenceResult.message}
              </p>
            </div>
          </div>
        )}

        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Event Header with gradient */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <CardHeader className="pb-6">
            <div className="space-y-4">
              <div>
                <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-2">
                  {event.title}
                </CardTitle>
                {isPastEvent && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                    <Clock className="w-4 h-4" />
                    Evento Encerrado
                  </div>
                )}
              </div>

              {event.description && (
                <p className="text-muted-foreground text-base leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Event Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Início</p>
                    <p className="text-blue-700 mt-1">
                      {startDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-blue-600">
                      {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-purple-900">Término</p>
                    <p className="text-purple-700 mt-1">
                      {endDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long'
                      })}
                    </p>
                    <p className="text-sm text-purple-600">
                      {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reward Box */}
            {event.reward && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-2xl">🎁</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-yellow-900 mb-1">Sua Recompensa</p>
                    <p className="text-yellow-800 text-lg">{event.reward}</p>
                    <p className="text-xs text-yellow-700 mt-2 opacity-80">
                      Escaneie o QR Code e registre sua presença para garantir sua recompensa!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box - mensagem conforme estado de login */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                {hasValidSession ? (
                  isLoggedIn ? (
                    <>
                      <p className="font-semibold mb-1">Você está logado</p>
                      <p>
                        Quando o evento estiver no horário, sua presença será vinculada ao seu CPF automaticamente.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold mb-1">Você está logado como administrador</p>
                      <p>
                        Para registrar presença como participante neste evento, acesse com uma conta de participante (CPF) ou crie uma.
                      </p>
                    </>
                  )
                ) : (
                  <>
                    <p className="font-semibold mb-1">Complete seu registro</p>
                    <p>
                      Faça login ou crie uma conta para vincular sua presença ao seu CPF e receber
                      notificações de eventos futuros.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Actions - só mostrar login/cadastro se não tiver sessão válida */}
            {!isPastEvent && !hasValidSession && !presenceResult.success && (
              <div className="space-y-3">
                <Link href="/login" className="block">
                  <Button className="w-full" size="lg">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Fazer Login para Registro Completo
                  </Button>
                </Link>

                <Link href="/register" className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    Criar Nova Conta
                  </Button>
                </Link>
              </div>
            )}

            {/* Profile Selector - Mostrar após scan bem-sucedido */}
            {!isPastEvent && presenceResult.success && presenceResult.presenceLogId && (
              <div className="mt-6">
                <ProfileSelectorClient
                  presenceLogId={presenceResult.presenceLogId}
                  eventId={event.id}
                  onSuccess={() => {
                    // Recarregar página após sucesso
                    if (typeof window !== 'undefined') {
                      window.location.reload()
                    }
                  }}
                />
              </div>
            )}

            {!isPastEvent && isLoggedIn && presenceResult.success && !presenceResult.presenceLogId && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Presença registrada!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Sua presença foi registrada e vinculada ao seu CPF.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Register Form */}
            {!isPastEvent && !isLoggedIn && presenceResult.success && initialScanToken && !presenceResult.presenceLogId && (
              <RegisterClient
                eventId={event.id}
                organizationId={event.organizationId}
                initialScanToken={initialScanToken}
                isLoggedIn={isLoggedIn}
              />
            )}

            {/* Organization */}
            <div className="pt-6 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>Organizado por <strong>{event.organization.name}</strong></span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}