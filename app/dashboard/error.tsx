'use client'

import { useEffect } from 'react'
import { Button } from '@/components/atoms'
import { AlertCircle } from 'lucide-react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4 text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold">Algo deu errado!</h2>
                <p className="text-muted-foreground">
                    Encontramos um erro inesperado ao carregar esta página.
                </p>
                <div className="flex gap-2 mt-2">
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Recarregar Página
                    </Button>
                    <Button onClick={() => reset()}>
                        Tentar Novamente
                    </Button>
                </div>
            </div>
        </div>
    )
}
