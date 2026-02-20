'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteEventButtonProps {
    eventId: string
    eventTitle: string
}

export function DeleteEventButton({ eventId, eventTitle }: DeleteEventButtonProps) {
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/events/${eventId}/delete`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Erro ao excluir evento')
            }

            alert('Evento excluído com sucesso!')
            router.push('/dashboard/organization')
            router.refresh()
        } catch (err: any) {
            alert(err.message || 'Erro ao excluir evento')
        } finally {
            setLoading(false)
            setShowConfirm(false)
        }
    }

    return (
        <>
            <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowConfirm(true)}
                disabled={loading}
            >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Evento
            </Button>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full text-zinc-900">
                        <h3 className="text-lg font-bold mb-2">Excluir Evento?</h3>
                        <p className="text-zinc-600 mb-6">
                            Tem certeza que deseja excluir o evento <strong>{eventTitle}</strong>?
                            <br /><br />
                            <span className="text-red-600 font-semibold">Esta ação é irreversível e apagará todos os dados associados, incluindo presenças.</span>
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
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                        Excluindo...
                                    </>
                                ) : (
                                    'Confirmar Exclusão'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
