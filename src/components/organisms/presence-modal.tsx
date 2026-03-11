'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Badge, Button } from '@/components/atoms'
import { X, Users, UserCheck, Gift } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

interface PresenceModalProps {
  eventId: string
  isOpen: boolean
  onClose: () => void
}

interface PresenceUser {
  id: string
  fullName: string
  cpf: string
  phone: string
  email: string
  profile: string
  accessTimestamp: string
  prizeDrawnAt?: string | null
}

export function PresenceModal({ eventId, isOpen, onClose }: PresenceModalProps) {
  const [presences, setPresences] = useState<PresenceUser[]>([])
  const [loading, setLoading] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [lastDrawn, setLastDrawn] = useState<PresenceUser | null>(null)
  const [drawError, setDrawError] = useState('')

  useEffect(() => {
    if (isOpen && eventId) {
      setLastDrawn(null)
      setDrawError('')
      fetchPresences()
    }
  }, [isOpen, eventId])

  const fetchPresences = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/presence/event/${eventId}/users`)
      if (res.ok) {
        const data = await res.json()
        setPresences(data)
      }
    } catch (err) {
      console.error('Erro ao buscar presenças:', err)
    } finally {
      setLoading(false)
    }
  }

  const eligibleCount = presences.filter((p) => !p.prizeDrawnAt).length

  const handleDraw = async () => {
    if (eligibleCount === 0) return
    setDrawing(true)
    setDrawError('')
    try {
      const res = await fetch(`/api/presence/event/${eventId}/draw`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok) {
        setLastDrawn(data)
        await fetchPresences()
      } else {
        setDrawError(data.error || 'Erro ao sortear')
      }
    } catch (err) {
      setDrawError('Erro ao sortear. Tente novamente.')
    } finally {
      setDrawing(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-md z-50 p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Usuários com Presença Confirmada
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando presenças...</p>
            </div>
          ) : presences.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Nenhuma presença confirmada ainda</p>
            </div>
          ) : (
            <>
              {/* Sorteador */}
              <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-base">Sortear brinde</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {eligibleCount} {eligibleCount === 1 ? 'participante elegível' : 'participantes elegíveis'}
                    </p>
                  </div>
                  <Button
                    onClick={handleDraw}
                    disabled={drawing || eligibleCount === 0}
                    className="gap-2"
                  >
                    {drawing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sorteando...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        Sortear
                      </>
                    )}
                  </Button>
                </div>
                {drawError && (
                  <p className="text-sm text-red-600 mt-2">{drawError}</p>
                )}
                {lastDrawn && (
                  <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-1">Ganhador sorteado:</p>
                    <p className="font-bold text-lg text-green-900">{lastDrawn.fullName}</p>
                    <div className="text-sm text-green-700 mt-1">
                      {lastDrawn.cpf && <span>CPF: {lastDrawn.cpf}</span>}
                      {lastDrawn.email && <span className="ml-2">• {lastDrawn.email}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de usuários */}
              <div className="space-y-3">
                {presences.map((presence) => {
                  const isDrawn = !!presence.prizeDrawnAt
                  return (
                    <Card
                      key={presence.id}
                      className={`border-0 shadow-sm ${isDrawn ? 'opacity-60' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <UserCheck className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{presence.fullName || 'Sem nome'}</p>
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                                <span>CPF: {presence.cpf}</span>
                                {presence.phone && <span>• Tel: {presence.phone}</span>}
                                {presence.email && <span>• Email: {presence.email}</span>}
                                <span>• {new Date(presence.accessTimestamp).toLocaleString('pt-BR')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            {isDrawn && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                Sorteado
                              </Badge>
                            )}
                            {presence.profile && !isDrawn && (
                              <Badge variant="default">
                                {presence.profile}
                              </Badge>
                            )}
                            {presence.profile && isDrawn && (
                              <Badge variant="outline">{presence.profile}</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <Button variant="outline">Fechar</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}


