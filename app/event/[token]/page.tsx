import { eventService } from '@/services/event.service'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/atoms'
import { EventRegisterClient } from './event-register-client'
import Link from 'next/link'
import { Calendar, Clock, Building2, Info, AlertCircle } from 'lucide-react'
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

  return (
    <div className="min-h-screen p-4 bg-navy">
      <div className="max-w-2xl mx-auto py-8 lg:py-16">
        {/* Status Messages */}
        {isBeforeEvent && (
          <div className="mb-6 p-4 rounded-xl bg-navy-light border border-mustard/20 flex items-start gap-3">
            <Clock className="w-6 h-6 text-mustard flex-shrink-0 mt-0.5" />
            <div className="text-white">
              <p className="font-semibold">Evento ainda não começou</p>
              <p className="text-sm text-[#C8CDD5] mt-1">
                Volte no horário programado para registrar sua presença.
              </p>
            </div>
          </div>
        )}

        {isPastEvent && (
          <div className="mb-6 p-4 rounded-xl bg-navy-light border border-navy-border flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-white">
              <p className="font-semibold">Evento encerrado</p>
              <p className="text-sm text-[#C8CDD5] mt-1">
                O registro de presença não está mais disponível.
              </p>
            </div>
          </div>
        )}

        <Card className="shadow-md border-0 overflow-hidden bg-navy-light border-navy-border">
          {/* Event Header */}
          <div className="h-2 bg-mustard" />

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
              <div className="p-4 rounded-xl bg-navy border border-navy-border">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-mustard mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white">Início</p>
                    <p className="text-[#C8CDD5] mt-1">
                      {startDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-mustard">
                      {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy border border-navy-border">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-mustard mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white">Término</p>
                    <p className="text-[#C8CDD5] mt-1">
                      {endDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long'
                      })}
                    </p>
                    <p className="text-sm text-mustard">
                      {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reward Box */}
            {event.reward && (
              <div className="p-4 rounded-xl bg-navy-light border-2 border-mustard/20 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-mustard flex items-center justify-center flex-shrink-0">
                    <span className="text-ink font-bold text-2xl">🎁</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-mustard mb-1">Sua Recompensa</p>
                    <p className="text-white text-lg">{event.reward}</p>
                    <p className="text-xs text-[#8B92A0] mt-2">
                      Registre sua presença para garantir sua recompensa!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box - mensagem conforme estado de login */}
            <div className="p-4 rounded-xl bg-navy border border-navy-border flex items-start gap-3">
              <Info className="w-5 h-5 text-mustard flex-shrink-0 mt-0.5" />
              <div className="text-sm text-white">
                {hasValidSession ? (
                  isLoggedIn ? (
                    <>
                      <p className="font-semibold mb-1">Você está logado</p>
                      <p>
                        Clique em "Registrar minha presença" para vincular sua presença ao seu CPF.
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

            {/* Registrar presença - só quando o evento está ativo */}
            {isActiveEvent && (
              <EventRegisterClient
                eventId={event.id}
                organizationId={event.organizationId}
                isLoggedIn={isLoggedIn}
              />
            )}

            {/* Login/Cadastro - opcional para vincular presença ao CPF */}
            {!isPastEvent && !hasValidSession && (
              <div className="space-y-3 pt-2">
                <p className="text-sm text-[#C8CDD5]">Já tem conta? Faça login para vincular sua presença ao CPF.</p>
                <div className="flex gap-3">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Fazer Login
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Criar Conta
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Organization */}
            <div className="pt-6 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>
                Organizado por{' '}
                <Link
                  href={`/${event.organization.slug}`}
                  className="font-semibold text-mustard hover:underline"
                >
                  {event.organization.name}
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}