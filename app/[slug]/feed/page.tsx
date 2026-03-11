import { organizationService } from '@/services/organization.service'
import { feedService } from '@/services/feed.service'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms'
import { Logo } from '@/components/atoms'
import { MessageSquare, Calendar, Image as ImageIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PageProps {
  params: { slug: string }
}

export default async function OrganizationFeedPage({ params }: PageProps) {
  const organization = await organizationService.getOrganizationBySlug(params.slug)

  if (!organization || !organization.isActive) {
    notFound()
  }

  const feeds = await feedService.getFeedByOrganization(organization.id, true)

  // Aplicar tema da organização
  const primaryColor = organization.theme?.primaryColor || '#001F3F'
  const logoUrl = organization.theme?.logoUrl
  const backgroundStyle = organization.theme?.backgroundStyle

  return (
    <div
      className="min-h-screen p-4"
      style={
        backgroundStyle
          ? { background: backgroundStyle }
          : { background: primaryColor }
      }
    >
      <div className="max-w-4xl mx-auto py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          {logoUrl ? (
            <div className="mb-6">
              <img
                src={logoUrl}
                alt={organization.name}
                className="h-16 mx-auto object-contain"
              />
            </div>
          ) : (
            <div className="mb-6 flex justify-center">
              <Logo className="scale-125 opacity-90" />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
            Feed - {organization.name}
          </h1>
          <p className="text-white text-base sm:text-lg">
            Acompanhe as últimas novidades e eventos
          </p>
        </div>

        {/* Feed Posts */}
        {feeds.length === 0 ? (
          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum post disponível</h3>
              <p className="text-muted-foreground">
                A organização ainda não publicou nenhum conteúdo no feed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {feeds.map((feed) => (
              <Card
                key={feed.id}
                className="border-0 shadow-md bg-white overflow-hidden"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl sm:text-2xl mb-2">{feed.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

                <CardContent className="space-y-4">
                  {feed.imageUrl && (
                    <div className="rounded-xl overflow-hidden">
                      <img
                        src={feed.imageUrl}
                        alt={feed.title}
                        className="w-full h-auto max-h-[400px] object-cover"
                      />
                    </div>
                  )}

                  <div className="prose prose-sm max-w-none">
                    <p className="text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {feed.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

