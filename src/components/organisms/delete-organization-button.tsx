'use client'

import { useState } from 'react'
import { Button, Card, CardContent } from '@/components/atoms'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteOrganizationButtonProps {
  organizationId: string
  organizationName: string
}

export function DeleteOrganizationButton({ organizationId, organizationName }: DeleteOrganizationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/organizations/${organizationId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      alert('Organização excluída com sucesso!')
      router.push('/dashboard/admin')
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir organização')
      setLoading(false)
    }
  }

  return (
    <>
      <Button 
        variant="destructive" 
        className="w-full h-16 text-lg font-semibold"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        <Trash2 className="w-6 h-6 mr-3" />
        Excluir Organização
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-red-600">⚠️ Atenção!</h3>
              <p className="text-lg text-white mb-6">
                Tem certeza que deseja excluir a organização <strong className="text-white">{organizationName}</strong>?
              </p>
              <div className="bg-red-500/20 border-2 border-red-400/50 rounded-xl p-5 mb-8">
                <p className="text-base text-red-200 font-semibold mb-3">
                  <strong>Esta ação é irreversível!</strong> Todos os dados relacionados serão excluídos:
                </p>
                <ul className="text-sm text-red-100 mt-2 ml-4 space-y-2">
                  <li>• Todos os eventos da organização</li>
                  <li>• Todos os registros de presença</li>
                  <li>• Todos os usuários administradores</li>
                  <li>• Tema e configurações</li>
                </ul>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 h-14 text-lg border-2 border-navy-border text-white hover:bg-navy-light bg-navy-light font-semibold"
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-14 text-lg font-semibold"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Excluindo...
                    </>
                  ) : (
                    'Confirmar Exclusão'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}


