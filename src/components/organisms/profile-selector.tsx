'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/atoms'
import { User, Users, Trophy, CheckCircle2 } from 'lucide-react'

export type ProfileType = 'Ouvinte' | 'Participante' | 'Atleta'

interface ProfileSelectorProps {
  onSelect: (profile: ProfileType) => void
  selectedProfile?: ProfileType
  loading?: boolean
}

export function ProfileSelector({ onSelect, selectedProfile, loading }: ProfileSelectorProps) {
  const profiles: { type: ProfileType; icon: any; description: string }[] = [
    {
      type: 'Ouvinte',
      icon: User,
      description: 'Apenas assistindo o evento'
    },
    {
      type: 'Participante',
      icon: Users,
      description: 'Participando ativamente do evento'
    },
    {
      type: 'Atleta',
      icon: Trophy,
      description: 'Competindo no evento'
    }
  ]

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Escolha seu perfil no evento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {profiles.map((profile) => {
            const Icon = profile.icon
            const isSelected = selectedProfile === profile.type
            
            return (
              <button
                key={profile.type}
                type="button"
                onClick={() => onSelect(profile.type)}
                disabled={loading}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-primary bg-primary/10 shadow-md' 
                    : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base">{profile.type}</h3>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{profile.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


