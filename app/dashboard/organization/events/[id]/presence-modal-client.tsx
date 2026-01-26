'use client'

import { useState } from 'react'
import { PresenceModal } from '@/components/organisms/presence-modal'
import { Button } from '@/components/atoms'
import { Users } from 'lucide-react'

interface PresenceModalClientProps {
  eventId: string
}

export function PresenceModalClient({ eventId }: PresenceModalClientProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Users className="w-4 h-4" />
        Ver Usuários para Brindes
      </Button>
      <PresenceModal
        eventId={eventId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}


