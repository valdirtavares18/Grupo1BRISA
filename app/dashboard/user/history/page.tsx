'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/atoms'
import { PageHeader } from '@/components/molecules'
import { Calendar, Building2, Clock, ArrowLeft, Download, User, Users, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function UserHistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/user/history', {
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = async (presenceId: string, eventTitle: string) => {
    setDownloadingId(presenceId)
    try {
      const res = await fetch(`/api/user/presences/${presenceId}/certificate`, {
        credentials: 'include'
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Erro ao gerar comprovante' }))
        throw new Error(errorData.error || 'Erro ao gerar comprovante')
      }

      // Criar nome do arquivo seguro
      const safeTitle = eventTitle
        .replace(/[^a-zA-Z0-9\s]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 50)
      const fileName = `Comprovante_${safeTitle}.pdf`

      // Obter blob
      const blob = await res.blob()
      
      // Criar URL do blob
      const url = window.URL.createObjectURL(blob)
      
      // Criar elemento de download
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.style.display = 'none'
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(a)
      a.click()
      
      // Limpar após um pequeno delay
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a)
        }
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (err) {
      console.error('Erro ao baixar comprovante:', err)
      alert('Erro ao gerar comprovante. Tente novamente.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="p-4 lg:p-6 lg:py-8">
        <Link 
          href="/dashboard/user"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>

        <PageHeader
          title="Meu Histórico"
          description="Todos os eventos que você participou"
        />

        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Carregando histórico...</p>
            </CardContent>
          </Card>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Nenhuma presença registrada</h3>
              <p className="text-slate-600">
                Escaneie QR Codes de eventos para começar seu histórico
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => {
              const eventDate = new Date(item.startDate)
              const accessDate = new Date(item.accessTimestamp)
              
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2 text-slate-900">{item.eventTitle}</h3>
                          
                          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              <span>{item.organizationName}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>{eventDate.toLocaleDateString('pt-BR')}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>Registrado em {accessDate.toLocaleString('pt-BR')}</span>
                            </div>

                            {item.profile && (
                              <div className="flex items-center gap-2">
                                {item.profile === 'Ouvinte' && <User className="w-4 h-4 text-slate-400" />}
                                {item.profile === 'Participante' && <Users className="w-4 h-4 text-slate-400" />}
                                {item.profile === 'Atleta' && <Trophy className="w-4 h-4 text-slate-400" />}
                                <span className="font-medium">Perfil: {item.profile}</span>
                              </div>
                            )}
                          </div>

                          {item.eventDescription && (
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                              {item.eventDescription}
                            </p>
                          )}
                        </div>

                        <Badge className="w-fit bg-slate-500 hover:bg-slate-600 text-white">
                          Presente
                        </Badge>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCertificate(item.id, item.eventTitle)}
                          disabled={downloadingId === item.id}
                          className="gap-2"
                        >
                          {downloadingId === item.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-slate-200 border-t-orange-600 rounded-full animate-spin" />
                              <span>Gerando...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>Baixar Comprovante</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
    </div>
  )
}