'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms'
import { XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CloseEventButtonProps {
  eventId: string
  eventTitle: string
  isClosed: boolean
}

export function CloseEventButton({ eventId, eventTitle, isClosed }: CloseEventButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleClose = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/close`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      alert('Evento encerrado com sucesso!')
      router.refresh()
      setShowConfirm(false)
    } catch (err: any) {
      alert(err.message || 'Erro ao encerrar evento')
    } finally {
      setLoading(false)
    }
  }

  if (isClosed) {
    return (
      <Button variant="secondary" disabled className="w-full">
        <XCircle className="w-4 h-4 mr-2" />
        Evento Encerrado
      </Button>
    )
  }

  return (
    <>
      <Button 
        variant="destructive" 
        className="w-full"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        <XCircle className="w-4 h-4 mr-2" />
        Encerrar Evento
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Confirmar Encerramento</h3>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja encerrar o evento <strong>{eventTitle}</strong>? 
              Após o encerramento, não será mais possível registrar novas presenças.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleClose}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Encerrando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

