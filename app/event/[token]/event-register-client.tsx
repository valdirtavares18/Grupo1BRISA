'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms'
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react'
import { ProfileSelectorClient } from './profile-selector-client'

interface EventRegisterClientProps {
  eventId: string
  organizationId: string
  isLoggedIn: boolean
}

export function EventRegisterClient({ eventId, organizationId, isLoggedIn }: EventRegisterClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    success: boolean
    presenceLogId?: string
    alreadyRegistered?: boolean
    message?: string
  } | null>(null)

  const handleRegisterPresence = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/presence/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409 || data.error?.includes('já registrou')) {
          setResult({ success: false, alreadyRegistered: true, message: data.error })
        } else {
          throw new Error(data.error || 'Erro ao registrar presença')
        }
        return
      }

      setResult({
        success: true,
        presenceLogId: data.id,
      })
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar presença')
    } finally {
      setLoading(false)
    }
  }

  // Já registrado
  if (result?.alreadyRegistered) {
    return (
      <div className="p-4 rounded-xl bg-navy border border-navy-border">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
          <p className="text-white font-semibold">Você já está cadastrado neste evento.</p>
        </div>
      </div>
    )
  }

  // Sucesso com presenceLogId - usuário logado (já vinculado)
  if (result?.success && result.presenceLogId && isLoggedIn) {
    return (
      <div className="p-4 rounded-xl bg-navy border border-navy-border">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
          <p className="text-white font-semibold">Presença registrada e vinculada ao seu CPF!</p>
        </div>
      </div>
    )
  }

  // Sucesso com presenceLogId - precisa escolher perfil (usuário não logado)
  if (result?.success && result.presenceLogId && !isLoggedIn) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <p className="text-green-200 font-semibold">Presença registrada! Escolha seu perfil:</p>
        </div>
        <ProfileSelectorClient presenceLogId={result.presenceLogId} eventId={eventId} />
      </div>
    )
  }

  // Botão para registrar
  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
          {error}
        </div>
      )}
      <Button
        onClick={handleRegisterPresence}
        className="w-full"
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Registrando...
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5 mr-2" />
            Registrar minha presença
          </>
        )}
      </Button>
    </div>
  )
}
