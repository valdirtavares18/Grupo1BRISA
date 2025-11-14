'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms'
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
        className="w-full"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Excluir Organização
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2 text-red-600">⚠️ Atenção!</h3>
            <p className="text-muted-foreground mb-4">
              Tem certeza que deseja excluir a organização <strong>{organizationName}</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-900">
                <strong>Esta ação é irreversível!</strong> Todos os dados relacionados serão excluídos:
              </p>
              <ul className="text-xs text-red-800 mt-2 ml-4 space-y-1">
                <li>• Todos os eventos da organização</li>
                <li>• Todos os registros de presença</li>
                <li>• Todos os usuários administradores</li>
                <li>• Tema e configurações</li>
              </ul>
            </div>
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


