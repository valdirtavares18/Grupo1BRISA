'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/atoms'
import { X, Users, UserCheck, UserX, Clock } from 'lucide-react'
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
}

export function PresenceModal({ eventId, isOpen, onClose }: PresenceModalProps) {
  const [presences, setPresences] = useState<PresenceUser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && eventId) {
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
            <div className="space-y-3">
              {presences.map((presence) => (
                <Card key={presence.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{presence.fullName || 'Sem nome'}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                            <span>CPF: {presence.cpf}</span>
                            {presence.phone && <span>• Tel: {presence.phone}</span>}
                            {presence.email && <span>• Email: {presence.email}</span>}
                            <span>• {new Date(presence.accessTimestamp).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      {presence.profile && (
                        <Badge variant="default" className="ml-2">
                          {presence.profile}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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


