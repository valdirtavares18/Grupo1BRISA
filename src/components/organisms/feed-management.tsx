'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/atoms'
import { MessageSquare, Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface FeedPost {
  id: string
  title: string
  content: string
  imageUrl?: string
  published: boolean
  createdAt: string
  updatedAt: string
}

interface FeedManagementProps {
  organizationId: string
}

export function FeedManagement({ organizationId }: FeedManagementProps) {
  const [feeds, setFeeds] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFeeds()
  }, [organizationId])

  const fetchFeeds = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/organizations/${organizationId}/feed?published=false`)
      if (res.ok) {
        const data = await res.json()
        setFeeds(data)
      } else {
        setError('Erro ao carregar feed')
      }
    } catch (err) {
      setError('Erro ao carregar feed')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublished = async (feedId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/feed/${feedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ published: !currentStatus }),
      })

      if (res.ok) {
        fetchFeeds()
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    }
  }

  const handleDelete = async (feedId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) {
      return
    }

    try {
      const res = await fetch(`/api/organizations/${organizationId}/feed/${feedId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        fetchFeeds()
      }
    } catch (err) {
      console.error('Erro ao excluir post:', err)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando feed...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-navy-light border-navy-border">
        <CardContent className="p-6 text-center text-red-200">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (feeds.length === 0) {
    return (
      <Card className="bg-navy-light border-navy-border">
        <CardContent className="p-12 text-center">
          <MessageSquare className="w-16 h-16 text-[#8B92A0] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2 text-white">Nenhum post no feed</h3>
          <p className="text-[#C8CDD5] mb-6">
            Crie seu primeiro post para começar a divulgar sua organização
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {feeds.map((feed) => (
        <Card key={feed.id} className="bg-navy-light border-navy-border hover:bg-navy-light hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg text-white">{feed.title}</CardTitle>
                  <Badge
                    variant={feed.published ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {feed.published ? (
                      <>
                        <Eye className="w-3 h-3" />
                        Publicado
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Rascunho
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#C8CDD5]">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(new Date(feed.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feed.imageUrl && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={feed.imageUrl}
                    alt={feed.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <p className="text-sm text-[#C8CDD5] whitespace-pre-wrap line-clamp-3">
                {feed.content}
              </p>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-navy-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePublished(feed.id, feed.published)}
                >
                  {feed.published ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Despublicar
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Publicar
                    </>
                  )}
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <a href={`/dashboard/organization/feed/${feed.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </a>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(feed.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

