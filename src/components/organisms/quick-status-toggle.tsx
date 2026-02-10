'use client'

import { useState } from 'react'
import { Button, Badge } from '@/components/atoms'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuickStatusToggleProps {
    organizationId: string
    initialStatus: boolean
}

export function QuickStatusToggle({ organizationId, initialStatus }: QuickStatusToggleProps) {
    const [isActive, setIsActive] = useState(initialStatus)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleToggle = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/organizations/${organizationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !isActive })
            })

            if (!res.ok) {
                throw new Error('Falha ao atualizar status')
            }

            setIsActive(!isActive)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Erro ao atualizar status da organização')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-white/70">Status da Organização</span>
                <div className="flex items-center gap-2 mt-1">
                    {isActive ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Ativa
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Inativa
                        </Badge>
                    )}
                </div>
            </div>

            <Button
                onClick={handleToggle}
                disabled={loading}
                variant={isActive ? "secondary" : "default"}
                size="sm"
                className={`h-9 px-4 rounded-lg font-bold transition-all ${isActive
                        ? 'bg-rose-500 hover:bg-rose-600 text-white border-none'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white border-none'
                    }`}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isActive ? (
                    'Desativar'
                ) : (
                    'Ativar'
                )}
            </Button>
        </div>
    )
}
