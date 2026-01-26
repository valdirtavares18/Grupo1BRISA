'use client'

import { useState } from 'react'
import { ProfileSelector, ProfileType } from '@/components/organisms/profile-selector'
import { Button } from '@/components/atoms'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface ProfileSelectorClientProps {
  presenceLogId: string
  eventId: string
  onSuccess: () => void
}

export function ProfileSelectorClient({ presenceLogId, eventId, onSuccess }: ProfileSelectorClientProps) {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | undefined>()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleConfirm = async () => {
    if (!selectedProfile) return

    setLoading(true)
    try {
      const res = await fetch('/api/presence/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presenceLogId,
          profile: selectedProfile
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar perfil')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar perfil')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-6 rounded-xl bg-green-50 border-2 border-green-200 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-900 mb-1">Perfil registrado!</h3>
        <p className="text-sm text-green-700">Sua presença foi confirmada com sucesso.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ProfileSelector
        onSelect={setSelectedProfile}
        selectedProfile={selectedProfile}
        loading={loading}
      />
      
      {selectedProfile && (
        <Button
          onClick={handleConfirm}
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Confirmar Presença
            </>
          )}
        </Button>
      )}
    </div>
  )
}


