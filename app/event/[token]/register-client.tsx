'use client'

import { useState, useEffect } from 'react'
import { RegisterWithPhoneForm } from '@/components/organisms/register-with-phone-form'
import { Card, CardContent } from '@/components/atoms'
import { CheckCircle2 } from 'lucide-react'

interface RegisterClientProps {
  eventId: string
  organizationId: string
  initialScanToken?: string
  isLoggedIn: boolean
}

export function RegisterClient({
  eventId,
  organizationId,
  initialScanToken,
  isLoggedIn,
}: RegisterClientProps) {
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  useEffect(() => {
    // Se não está logado e tem initialScanToken, mostrar formulário
    if (!isLoggedIn && initialScanToken) {
      setShowRegisterForm(true)
    }
  }, [isLoggedIn, initialScanToken])

  if (isLoggedIn) {
    return null
  }

  if (registrationSuccess) {
    return (
      <Card className="shadow-md border-0 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-900 mb-2">
                Registro Concluído!
              </h3>
              <p className="text-sm text-green-700">
                Sua conta foi criada e sua presença foi vinculada com sucesso.
                Redirecionando...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!showRegisterForm) {
    return null
  }

  return (
    <div className="mt-6">
      <RegisterWithPhoneForm
        eventId={eventId}
        organizationId={organizationId}
        initialScanToken={initialScanToken}
        onSuccess={() => {
          setRegistrationSuccess(true)
          setTimeout(() => {
            window.location.href = '/dashboard/user'
          }, 2000)
        }}
      />
    </div>
  )
}

