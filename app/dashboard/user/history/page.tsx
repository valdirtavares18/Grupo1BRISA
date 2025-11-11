'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/atoms'
import { Navbar } from '@/components/organisms/navbar'
import { PageHeader } from '@/components/molecules'
import { Calendar, Building2, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UserHistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar userRole="USUÁRIO" />
      
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Link 
          href="/dashboard/user"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>

        <PageHeader
          title="Meu Histórico"
          description="Todos os eventos que você participou"
        />

        {loading ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando histórico...</p>
            </CardContent>
          </Card>
        ) : history.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma presença registrada</h3>
              <p className="text-muted-foreground">
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
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{item.eventTitle}</h3>
                        
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{item.organizationName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{eventDate.toLocaleDateString('pt-BR')}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Registrado em {accessDate.toLocaleString('pt-BR')}</span>
                          </div>
                        </div>

                        {item.eventDescription && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {item.eventDescription}
                          </p>
                        )}
                      </div>

                      <Badge className="w-fit bg-green-500 hover:bg-green-600">
                        Presente
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}