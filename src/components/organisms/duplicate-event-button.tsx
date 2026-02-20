'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms'
import { Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DuplicateEventButtonProps {
  eventId: string
}

export function DuplicateEventButton({ eventId }: DuplicateEventButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDuplicate = async () => {
    if (!confirm('Deseja duplicar este evento? Uma cópia será criada com data 7 dias à frente.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      const newEvent = await res.json()
      alert('Evento duplicado com sucesso!')
      router.push(`/dashboard/organization/events/${newEvent.id}`)
    } catch (err: any) {
      alert(err.message || 'Erro ao duplicar evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      className="w-full"
      onClick={handleDuplicate}
      disabled={loading}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin mr-2" />
          Duplicando...
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          Duplicar Evento
        </>
      )}
    </Button>
  )
}

